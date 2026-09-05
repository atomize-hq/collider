/**
 * Collider's governance wrapper around the Variables REST API rail.
 *
 * The rail itself — auth, plan construction, the Figma requests, retry, and
 * write-back verification — lives in @atomize-hq/figma-token-rail. What stays
 * here is the part only this repo can own: reading and writing the CT-8B sync
 * ledger, mapping a rail outcome onto a promotion level, and recording a
 * failure as a blocking exception.
 *
 * This rail is Enterprise/full-seat gated and is NOT the active path — the
 * plugin rail is (`publish.mode: plugin-import-manual`). It also deletes and
 * recreates the collection, so VariableIDs and the paint bindings pointing at
 * them do not survive. Prefer `pnpm figma:plugin:build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import {
  formatSyncError,
  normalizeSyncError,
  syncVariablesViaRest,
} from '@atomize-hq/figma-token-rail';
import { loadAndValidateSyncLedger } from './sync-ledger.mjs';

export const defaultFigmaVariablesSyncLedgerPath = 'src/figma/sync-ledger.json';
export const defaultTokenSyncConfigPath = 'figma/token-sync.config.json';
export const figmaVariablesSyncUsage = 'Usage: node scripts/figma-variables-sync-enterprise.mjs';
export const hardenedPublishMode = 'rest-variables-oauth';
export const hardenedModeName = 'Base';

const hardenedExceptionPrefix = 'figma-hardened-variables-';
const earnedLevelRank = new Map([
  ['A-source-valid', 1],
  ['B-projection-valid', 2],
  ['C-consumption-valid', 3],
  ['D-publish-valid', 4],
  ['E-promotion-complete', 5],
]);

/** Phases the rail does not own: reading the ledger and resolving the artifact. */
class LedgerPhaseError extends Error {
  constructor(phase, message, details = {}) {
    super(message);
    this.name = 'LedgerPhaseError';
    this.phase = phase;
    this.details = details;
  }
}

export async function runFigmaVariablesSync(options = {}) {
  const ledgerPath = options.ledgerPath ?? defaultFigmaVariablesSyncLedgerPath;
  const configPath = options.configPath ?? defaultTokenSyncConfigPath;
  const env = options.env ?? process.env;
  const readJson = options.readJson ?? readJsonFile;
  const writeJson = options.writeJson ?? writeJsonAtomic;
  const resolveArtifactRevision = options.resolveArtifactRevision ?? defaultResolveArtifactRevision;

  const ledgerLoad = loadAndValidateSyncLedger(ledgerPath);
  if (ledgerLoad.errors.length > 0) {
    throw new LedgerPhaseError('ledger', 'sync ledger is structurally invalid', {
      issues: ledgerLoad.errors,
    });
  }

  const ledger = ledgerLoad.data;
  let artifactRevision = ledger.artifact.revision;

  try {
    artifactRevision = resolveArtifactRevision(ledger.artifact.path);
    const config = readJson(configPath);

    const { plan, verification } = await syncVariablesViaRest({
      artifactDocument: readJson(ledger.artifact.path),
      figmaFile: ledger.publish.figmaFile,
      env,
      collectionName: config.collectionName,
      modeName: options.modeName ?? hardenedModeName,
      ...(options.fetch ? { fetch: options.fetch } : {}),
      ...(options.sleep ? { sleep: options.sleep } : {}),
    });

    const updatedLedger = buildSuccessLedger({ ledger, artifactRevision, verification });
    writeJson(ledgerPath, updatedLedger);
    return { ok: true, ledger: updatedLedger, plan, verification, artifactRevision };
  } catch (error) {
    const syncError = normalizeError(error);
    const failureLedger = buildFailureLedger({ ledger, artifactRevision, error: syncError });

    try {
      writeJson(ledgerPath, failureLedger);
    } catch {
      // Preserve the original rail failure if the ledger write itself fails.
    }

    return { ok: false, error: syncError, ledger: failureLedger, artifactRevision };
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
      writeLine(stderr, `[FIGMA_VARIABLES_SYNC_FAILED] ${formatError(result.error)}`);
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
  const syncError = normalizeError(error);
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

export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export function writeJsonAtomic(filePath, value) {
  const absPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
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
    throw new LedgerPhaseError(
      'artifact',
      `failed to resolve artifact revision for ${artifactPath}: ${messageForError(error)}`
    );
  }
}

/** Rail errors already carry a phase; governance errors carry their own. */
function normalizeError(error) {
  return error instanceof LedgerPhaseError ? error : normalizeSyncError(error);
}

function formatError(error) {
  return error instanceof LedgerPhaseError
    ? `${error.phase}: ${error.message}`
    : formatSyncError(error);
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

function maxEarnedLevel(currentLevel, nextLevel) {
  return (earnedLevelRank.get(nextLevel) ?? 0) > (earnedLevelRank.get(currentLevel) ?? 0)
    ? nextLevel
    : currentLevel;
}

function messageForError(error) {
  return error instanceof Error ? error.message : String(error);
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
