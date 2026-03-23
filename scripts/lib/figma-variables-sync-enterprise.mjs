import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { loadAndValidateSyncLedger } from './sync-ledger.mjs';

export const defaultFigmaVariablesSyncLedgerPath = 'src/figma/sync-ledger.json';
export const figmaVariablesSyncUsage = 'Usage: node scripts/figma-variables-sync-enterprise.mjs';
export const hardenedPublishMode = 'rest-variables-oauth';
export const hardenedCollectionName = 'Collider Tokens';
export const hardenedModeName = 'Base';

const hardenedExceptionPrefix = 'figma-hardened-variables-';
const retryableStatusCodes = new Set([429, 500, 502, 503, 504]);
const supportedTokenTypes = new Set(['color', 'duration', 'string', 'boolean', 'number']);
const earnedLevelRank = new Map([
  ['A-source-valid', 1],
  ['B-projection-valid', 2],
  ['C-consumption-valid', 3],
  ['D-publish-valid', 4],
  ['E-promotion-complete', 5],
]);

export async function runFigmaVariablesSync(options = {}) {
  const ledgerPath = options.ledgerPath ?? defaultFigmaVariablesSyncLedgerPath;
  const env = options.env ?? process.env;
  const fetchImpl = options.fetch ?? globalThis.fetch?.bind(globalThis);
  const sleep = options.sleep ?? defaultSleep;
  // `now` is available for tests but may be unused in production flows
  const now = options.now ?? (() => new Date());
  const readJson = options.readJson ?? readJsonFile;
  const writeJson = options.writeJson ?? writeJsonAtomic;
  const resolveArtifactRevision = options.resolveArtifactRevision ?? defaultResolveArtifactRevision;

  if (typeof fetchImpl !== 'function') {
    throw new FigmaVariablesSyncError(
      'auth',
      'global fetch is unavailable; Node 18+ is required for the hardened rail'
    );
  }

  const ledgerLoad = loadAndValidateSyncLedger(ledgerPath);
  if (ledgerLoad.errors.length > 0) {
    throw new FigmaVariablesSyncError('ledger', 'sync ledger is structurally invalid', {
      issues: ledgerLoad.errors,
    });
  }

  const ledger = ledgerLoad.data;
  let artifactRevision = ledger.artifact.revision;

  try {
    artifactRevision = resolveArtifactRevision(ledger.artifact.path);
    const artifactDocument = readJson(ledger.artifact.path);
    const accessToken = resolveAccessToken(env);
    const fileKey = parseFigmaFileKey(ledger.publish.figmaFile);
    const desiredVariables = flattenTokenDocument(artifactDocument);

    const beforeState = await requestFigmaJson({
      fetchImpl,
      sleep,
      accessToken,
      fileKey,
      method: 'GET',
      endpoint: `/v1/files/${fileKey}/variables/local`,
      phase: 'write',
    });

    const plan = createSyncPlan({
      currentState: beforeState,
      desiredVariables,
    });

    await requestFigmaJson({
      fetchImpl,
      sleep,
      accessToken,
      fileKey,
      method: 'POST',
      endpoint: `/v1/files/${fileKey}/variables`,
      phase: 'write',
      body: plan.requestBody,
    });

    const afterState = await requestFigmaJson({
      fetchImpl,
      sleep,
      accessToken,
      fileKey,
      method: 'GET',
      endpoint: `/v1/files/${fileKey}/variables/local`,
      phase: 'verification',
    });

    const verification = verifySyncOutcome({
      readBack: afterState,
      desiredVariables,
      collectionName: hardenedCollectionName,
      modeName: hardenedModeName,
    });
    const updatedLedger = buildSuccessLedger({
      ledger,
      artifactRevision,
    });

    writeJson(ledgerPath, updatedLedger);
    return { ok: true, ledger: updatedLedger, plan, verification, artifactRevision };
  } catch (error) {
    const syncError = normalizeSyncError(error);
    const failureLedger = buildFailureLedger({
      ledger,
      artifactRevision,
      error: syncError,
    });

    try {
      writeJson(ledgerPath, failureLedger);
    } catch {
      // Preserve the original rail failure if the ledger write itself fails.
    }

    return {
      ok: false,
      error: syncError,
      ledger: failureLedger,
      artifactRevision,
    };
  }
}

export async function runFigmaVariablesSyncCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const runSync = options.runSync ?? runFigmaVariablesSync;

  if (args.length > 0) {
    writeLine(stderr, figmaVariablesSyncUsage);
    return 1;
  }

  try {
    const result = await runSync(options);
    if (!result.ok) {
      writeLine(stderr, `[FIGMA_VARIABLES_SYNC_FAILED] ${formatSyncError(result.error)}`);
      return 1;
    }

    writeLine(
      stdout,
      `✓ Hardened Figma variables sync completed for ${result.ledger.publish.figmaFile}`
    );
    writeLine(
      stdout,
      `[FIGMA_VARIABLES_SYNC_STATE] mode=${result.ledger.publish.mode} status=${result.ledger.publish.lastHardenedRunStatus} collectionCount=${result.ledger.publish.successMarkers.collectionCount} variableCount=${result.ledger.publish.successMarkers.variableCount}`
    );
    return 0;
  } catch (error) {
    writeLine(stderr, `[UNEXPECTED_RUNTIME_FAILURE] ${messageForError(error)}`);
    return 3;
  }
}

export function flattenTokenDocument(node) {
  const leaves = [];
  walkTokenNode(node, [], leaves);
  return leaves.sort((left, right) => left.name.localeCompare(right.name));
}

export function createSyncPlan({ currentState, desiredVariables }) {
  const collections = currentState?.meta?.variableCollections ?? {};
  const targetCollection = findCollectionByName(collections, hardenedCollectionName);
  const requestBody = {
    variableCollections: [],
    variableModes: [],
    variables: [],
    variableModeValues: [],
  };

  if (targetCollection) {
    requestBody.variableCollections.push({
      action: 'DELETE',
      id: targetCollection.id,
    });
  }

  requestBody.variableCollections.push({
    action: 'CREATE',
    id: 'temp_hardened_collection',
    name: hardenedCollectionName,
    initialModeId: 'temp_hardened_mode',
  });

  requestBody.variableModes.push({
    action: 'UPDATE',
    id: 'temp_hardened_mode',
    name: hardenedModeName,
    variableCollectionId: 'temp_hardened_collection',
  });

  desiredVariables.forEach((variable, index) => {
    const tempVariableId = `temp_hardened_variable_${index}`;
    requestBody.variables.push({
      action: 'CREATE',
      id: tempVariableId,
      name: variable.name,
      resolvedType: variable.resolvedType,
      variableCollectionId: 'temp_hardened_collection',
    });

    requestBody.variableModeValues.push({
      variableId: tempVariableId,
      modeId: 'temp_hardened_mode',
      value: variable.value,
    });
  });

  return {
    collectionCount: 1,
    variableCount: desiredVariables.length,
    requestBody,
    targetCollectionName: hardenedCollectionName,
    targetModeName: hardenedModeName,
  };
}

export function resolveAccessToken(env) {
  const configuredToken = env?.FIGMA_OAUTH_ACCESS_TOKEN;
  if (typeof configuredToken !== 'string' || configuredToken.length === 0) {
    if (typeof env?.FIGMA_TOKEN === 'string' && env.FIGMA_TOKEN.length > 0) {
      throw new FigmaVariablesSyncError(
        'auth',
        'FIGMA_TOKEN is not accepted by the Enterprise rail; provide an OAuth app token via FIGMA_OAUTH_ACCESS_TOKEN'
      );
    }

    throw new FigmaVariablesSyncError(
      'auth',
      'missing OAuth access token in FIGMA_OAUTH_ACCESS_TOKEN (Enterprise Variables API rail)'
    );
  }

  return configuredToken;
}

export function parseFigmaFileKey(figmaFile) {
  if (typeof figmaFile !== 'string' || figmaFile.length === 0) {
    throw new FigmaVariablesSyncError('auth', 'publish.figmaFile must be a non-empty string');
  }

  const match = /^figma:\/\/file\/([^/?#]+)(?:[/?#].*)?$/.exec(figmaFile);
  if (!match) {
    throw new FigmaVariablesSyncError(
      'auth',
      `publish.figmaFile must use the figma://file/<key> URI format (received ${figmaFile})`
    );
  }

  return match[1];
}

export function verifySyncOutcome({ readBack, desiredVariables, collectionName, modeName }) {
  const collections = readBack?.meta?.variableCollections ?? {};
  const variables = readBack?.meta?.variables ?? {};
  const collection = findCollectionByName(collections, collectionName);

  if (!collection) {
    throw new FigmaVariablesSyncError(
      'verification',
      `collection ${collectionName} was not found in the Figma read-back payload`
    );
  }

  if (collection.defaultModeId == null) {
    throw new FigmaVariablesSyncError(
      'verification',
      `collection ${collectionName} is missing a default mode id`
    );
  }

  if (!Array.isArray(collection.modes)) {
    throw new FigmaVariablesSyncError(
      'verification',
      `collection ${collectionName} is missing the mode list`
    );
  }

  const mode = collection.modes.find((entry) => entry.modeId === collection.defaultModeId);
  if (!mode || mode.name !== modeName) {
    throw new FigmaVariablesSyncError(
      'verification',
      `collection ${collectionName} does not expose the expected mode name ${modeName}`
    );
  }

  if (!Array.isArray(collection.variableIds)) {
    throw new FigmaVariablesSyncError(
      'verification',
      `collection ${collectionName} does not expose variable ids`
    );
  }

  if (collection.variableIds.length !== desiredVariables.length) {
    throw new FigmaVariablesSyncError(
      'verification',
      `collection ${collectionName} contains ${collection.variableIds.length} variables, expected ${desiredVariables.length}`
    );
  }

  const actualByName = new Map();
  for (const variableId of collection.variableIds) {
    const variable = variables[variableId];
    if (!variable) {
      throw new FigmaVariablesSyncError(
        'verification',
        `collection ${collectionName} references missing variable ${variableId}`
      );
    }
    actualByName.set(variable.name, variable);
  }

  for (const desired of desiredVariables) {
    const actual = actualByName.get(desired.name);
    if (!actual) {
      throw new FigmaVariablesSyncError(
        'verification',
        `variable ${desired.name} was not present after the hardened rail write`
      );
    }

    if (actual.resolvedType !== desired.resolvedType) {
      throw new FigmaVariablesSyncError(
        'verification',
        `variable ${desired.name} resolvedType=${actual.resolvedType} but expected ${desired.resolvedType}`
      );
    }

    const actualValue = actual.valuesByMode?.[collection.defaultModeId];
    if (!valuesMatch(actualValue, desired.value)) {
      throw new FigmaVariablesSyncError(
        'verification',
        `variable ${desired.name} did not persist the expected value`
      );
    }
  }

  return {
    collectionCount: 1,
    determinismVerified: true,
    variableCount: desiredVariables.length,
  };
}

function walkTokenNode(node, pathSegments, leaves) {
  if (!isPlainObject(node)) {
    throw new FigmaVariablesSyncError('artifact', 'token artifact must contain objects only');
  }

  if (Object.prototype.hasOwnProperty.call(node, '$value')) {
    if (!Object.prototype.hasOwnProperty.call(node, '$type')) {
      throw new FigmaVariablesSyncError(
        'artifact',
        `token ${pathSegments.join('.')} is missing $type`
      );
    }

    if (!supportedTokenTypes.has(node.$type)) {
      throw new FigmaVariablesSyncError(
        'artifact',
        `unsupported token type ${node.$type} at ${pathSegments.join('.')}`
      );
    }

    leaves.push({
      name: pathSegments.map(sanitizeVariablePathSegment).join('/'),
      path: pathSegments,
      resolvedType: mapResolvedType(node.$type),
      value: normalizeTokenValue(node.$type, node.$value),
    });
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === '$extensions') {
      continue;
    }

    walkTokenNode(value, [...pathSegments, key], leaves);
  }
}

function normalizeTokenValue(tokenType, value) {
  switch (tokenType) {
    case 'color':
      return parseColorValue(value);
    case 'duration':
      return parseDurationValue(value);
    case 'string':
      return String(value);
    case 'boolean':
      return Boolean(value);
    case 'number':
      return Number(value);
    default:
      throw new FigmaVariablesSyncError('artifact', `unsupported token type ${tokenType}`);
  }
}

function mapResolvedType(tokenType) {
  switch (tokenType) {
    case 'color':
      return 'COLOR';
    case 'duration':
    case 'number':
      return 'FLOAT';
    case 'string':
      return 'STRING';
    case 'boolean':
      return 'BOOLEAN';
    default:
      throw new FigmaVariablesSyncError('artifact', `unsupported token type ${tokenType}`);
  }
}

function parseColorValue(value) {
  if (typeof value !== 'string') {
    throw new FigmaVariablesSyncError('artifact', 'color tokens must use hex string values');
  }

  const normalized = value.trim();

  if (normalized.startsWith('#')) {
    const hex = normalized.replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
      throw new FigmaVariablesSyncError(
        'artifact',
        `color token value ${value} must use #RRGGBB or #RRGGBBAA`
      );
    }

    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgbaMatch =
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.exec(
      normalized
    );
  if (!rgbaMatch) {
    throw new FigmaVariablesSyncError(
      'artifact',
      `color token value ${value} must use #RRGGBB, #RRGGBBAA, rgb(...), or rgba(...)`
    );
  }

  const channel = (input) => {
    const number = Number(input);
    if (number < 0 || number > 255) {
      throw new FigmaVariablesSyncError(
        'artifact',
        `color token value ${value} must keep RGB channels between 0 and 255`
      );
    }
    return number / 255;
  };

  const alpha = rgbaMatch[4] == null ? 1 : Number(rgbaMatch[4]);
  if (alpha < 0 || alpha > 1) {
    throw new FigmaVariablesSyncError(
      'artifact',
      `color token value ${value} must keep alpha between 0 and 1`
    );
  }

  return {
    r: channel(rgbaMatch[1]),
    g: channel(rgbaMatch[2]),
    b: channel(rgbaMatch[3]),
    a: alpha,
  };
}

function parseDurationValue(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    throw new FigmaVariablesSyncError('artifact', 'duration tokens must use string values');
  }

  const match = /^\s*(-?\d+(?:\.\d+)?)(ms|s)\s*$/.exec(value);
  if (!match) {
    throw new FigmaVariablesSyncError(
      'artifact',
      `duration token value ${value} must use ms or s units`
    );
  }

  return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1]);
}

function sanitizeVariablePathSegment(segment) {
  return String(segment).replace(/[.{}]/g, '-');
}

function valuesMatch(actual, expected) {
  if (typeof expected === 'number') {
    return typeof actual === 'number' && Math.abs(actual - expected) < 1e-6;
  }

  if (isColorValue(expected)) {
    return (
      isColorValue(actual) &&
      ['r', 'g', 'b', 'a'].every((key) => Math.abs(actual[key] - expected[key]) < 1e-6)
    );
  }

  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      expected.length === actual.length &&
      expected.every((entry, index) => valuesMatch(actual[index], entry))
    );
  }

  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) {
      return false;
    }

    const expectedKeys = Object.keys(expected);
    if (expectedKeys.length !== Object.keys(actual).length) {
      return false;
    }

    return expectedKeys.every((key) => valuesMatch(actual[key], expected[key]));
  }

  return actual === expected;
}

function isColorValue(value) {
  return (
    isPlainObject(value) && ['r', 'g', 'b', 'a'].every((key) => typeof value[key] === 'number')
  );
}

export function buildSuccessLedger({ ledger, artifactRevision }) {
  const nextLedger = cloneLedger(ledger);
  nextLedger.artifact.revision = artifactRevision;
  nextLedger.publish.mode = hardenedPublishMode;
  nextLedger.verification.materializationStatus = 'passed';
  nextLedger.verification.lastVerifiedRevision = artifactRevision;
  nextLedger.promotion.highestEarnedLevel = maxEarnedLevel(
    nextLedger.promotion.highestEarnedLevel,
    'D-publish-valid'
  );
  nextLedger.promotion.parityDeferredReason =
    nextLedger.promotion.parityMode === 'deferred'
      ? 'Parity remains deferred because the release-governed promotion gate is not yet in place for Collider.'
      : nextLedger.promotion.parityDeferredReason;
  nextLedger.exceptions = removeHardenedExceptions(nextLedger.exceptions);
  return nextLedger;
}

export function buildFailureLedger({ ledger, artifactRevision, error }) {
  const syncError = normalizeSyncError(error);
  const nextLedger = cloneLedger(ledger);
  nextLedger.artifact.revision = artifactRevision;
  nextLedger.publish.mode = hardenedPublishMode;
  nextLedger.verification.materializationStatus = 'failed';
  nextLedger.verification.lastVerifiedRevision = artifactRevision;
  nextLedger.promotion.highestEarnedLevel = 'C-consumption-valid';
  nextLedger.promotion.parityDeferredReason =
    nextLedger.promotion.parityMode === 'deferred'
      ? 'Parity remains deferred because the hardened rail failed during the latest publish attempt.'
      : nextLedger.promotion.parityDeferredReason;
  nextLedger.exceptions = removeHardenedExceptions(nextLedger.exceptions);
  nextLedger.exceptions.push({
    code: `${hardenedExceptionPrefix}${syncError.phase}-failed`,
    message: syncError.message,
    blocking: true,
    status: 'open',
    field: 'verification.materializationStatus',
  });
  return nextLedger;
}

function removeHardenedExceptions(exceptions) {
  if (!Array.isArray(exceptions)) {
    return [];
  }

  return exceptions.filter(
    (entry) => typeof entry?.code !== 'string' || !entry.code.startsWith(hardenedExceptionPrefix)
  );
}

function cloneLedger(ledger) {
  return JSON.parse(JSON.stringify(ledger));
}

export function normalizeSyncError(error) {
  if (error instanceof FigmaVariablesSyncError) {
    return error;
  }

  return new FigmaVariablesSyncError('verification', messageForError(error));
}

function createSyncError(phase, message, details = {}) {
  return new FigmaVariablesSyncError(phase, message, details);
}

function formatSyncError(error) {
  const syncError = normalizeSyncError(error);
  return `${syncError.phase}: ${syncError.message}`;
}

function findCollectionByName(variableCollections, collectionName) {
  for (const collection of Object.values(variableCollections)) {
    if (collection?.name === collectionName) {
      return collection;
    }
  }

  return null;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export function writeJsonAtomic(filePath, value) {
  const absPath = path.resolve(filePath);
  ensureParentDirectory(absPath);
  const tempPath = `${absPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, absPath);
}

export function defaultResolveArtifactRevision(artifactPath) {
  const absPath = path.resolve(artifactPath);
  try {
    return execFileSync('git', ['log', '-1', '--format=%H', '--', absPath], {
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    throw createSyncError(
      'artifact',
      `failed to resolve artifact revision for ${artifactPath}: ${messageForError(error)}`
    );
  }
}

async function requestFigmaJson({
  fetchImpl,
  sleep,
  accessToken,
  fileKey,
  method,
  endpoint,
  phase,
  body,
}) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(`https://api.figma.com${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Figma-Token': accessToken,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      const syncError = normalizeSyncError(error);
      if (attempt < 3) {
        await sleep(retryDelayMs(attempt));
        continue;
      }

      throw syncError;
    }

    let payload;
    try {
      payload = await parseResponseBody(response);
    } catch (error) {
      const syncError = normalizeSyncError(error);
      if (attempt < 3) {
        await sleep(retryDelayMs(attempt));
        continue;
      }

      throw syncError;
    }

    if (response.ok) {
      return payload;
    }

    const message = extractFigmaErrorMessage(payload, response.status);
    if (retryableStatusCodes.has(response.status) && attempt < 3) {
      await sleep(retryDelayMs(attempt));
      continue;
    }

    throw createSyncError(
      phase,
      `Figma API request failed (${method} ${endpoint}) for ${fileKey}: ${message}`,
      { payload, status: response.status }
    );
  }

  throw createSyncError(phase, 'Figma request failed unexpectedly');
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function extractFigmaErrorMessage(payload, status) {
  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.length > 0) {
      return payload.message;
    }

    if (typeof payload.error === 'string' && payload.error.length > 0) {
      return payload.error;
    }
  }

  return `HTTP ${status}`;
}

function retryDelayMs(attempt) {
  return 150 * attempt;
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function maxEarnedLevel(currentLevel, nextLevel) {
  return (earnedLevelRank.get(nextLevel) ?? 0) > (earnedLevelRank.get(currentLevel) ?? 0)
    ? nextLevel
    : currentLevel;
}

function messageForError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}

class FigmaVariablesSyncError extends Error {
  constructor(phase, message, details = {}) {
    super(message);
    this.name = 'FigmaVariablesSyncError';
    this.phase = phase;
    this.details = details;
  }
}
