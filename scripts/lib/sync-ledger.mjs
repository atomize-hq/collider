import fs from 'node:fs';
import path from 'node:path';

export const syncLedgerUsage =
  'Usage: node scripts/validate-sync-ledger.mjs <path-to-sync-ledger.json>';
export const topLevelKeys = ['ledgerVersion', 'scope', 'name', 'links', 'status', 'drift'];
export const linkKeys = ['figmaFile', 'artifact', 'policy', 'parityPolicy'];
export const baseStatusKeys = [
  'syncMode',
  'artifactPath',
  'artifactGitSha',
  'themeIds',
  'themeMapping',
  'parityMode',
  'lastSuccessfulPullAt',
  'canonicalSource',
];
export const driftRequiredKeys = ['code', 'severity', 'message', 'status'];
export const driftOptionalKeys = ['field'];
export const syncLedgerArtifactPath = 'design-tokens/dist/figma/tokens.json';
export const syncLedgerPolicyPath = 'src/figma/README.md';
export const syncLedgerParityPolicyPath = 'src/figma/parity-policy.md';
export const parityModes = new Set(['deferred', 'required']);
export const driftSeverities = new Set(['info', 'warn', 'error']);
export const driftStatuses = new Set(['open', 'resolved']);

const shaPattern = /^[a-f0-9]{40}$/;
const utcIsoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function readSyncLedger(target) {
  const absPath = path.resolve(target);
  return {
    absPath,
    data: JSON.parse(fs.readFileSync(absPath, 'utf8')),
  };
}

export function loadAndValidateSyncLedger(target) {
  const { absPath, data } = readSyncLedger(target);
  return {
    absPath,
    data,
    errors: validateSyncLedger(data),
  };
}

export function validateSyncLedger(data) {
  const errors = [];

  assertPlainObject(errors, data, 'Ledger must be a JSON object');
  if (errors.length > 0) {
    return errors;
  }

  validateExactKeys(errors, data, topLevelKeys, 'ledger');
  requireLiteral(errors, data.ledgerVersion, '1', 'ledgerVersion');
  requireLiteral(errors, data.scope, 'figma-pilot', 'scope');
  requireNonEmptyString(errors, data.name, 'name');

  validateLinks(errors, data.links);
  validateStatus(errors, data.status, data.links);
  validateDrift(errors, data.drift);

  return errors;
}

function validateLinks(errors, links) {
  if (!assertPlainObject(errors, links, 'links must be an object')) {
    return;
  }

  validateExactKeys(errors, links, linkKeys, 'links');
  requireNonEmptyString(errors, links.figmaFile, 'links.figmaFile');
  requireLiteral(errors, links.artifact, syncLedgerArtifactPath, 'links.artifact');
  requireLiteral(errors, links.policy, syncLedgerPolicyPath, 'links.policy');
  requireLiteral(errors, links.parityPolicy, syncLedgerParityPolicyPath, 'links.parityPolicy');
}

function validateStatus(errors, status, links) {
  if (!assertPlainObject(errors, status, 'status must be an object')) {
    return;
  }

  const statusKeySpec =
    status.parityMode === 'deferred'
      ? { required: [...baseStatusKeys, 'parityDeferredReason'], optional: [] }
      : { required: baseStatusKeys, optional: ['parityDeferredReason'] };

  validateKeySpec(errors, status, statusKeySpec, 'status');
  requireLiteral(errors, status.syncMode, 'pull-url-readonly', 'status.syncMode');
  requireLiteral(errors, status.artifactPath, syncLedgerArtifactPath, 'status.artifactPath');

  if (
    typeof links?.artifact === 'string' &&
    typeof status.artifactPath === 'string' &&
    links.artifact !== status.artifactPath
  ) {
    errors.push(
      `[CT-7_STATUS_ARTIFACT_MISMATCH] links.artifact and status.artifactPath must match ${syncLedgerArtifactPath}`
    );
  }

  if (typeof status.artifactGitSha !== 'string' || !shaPattern.test(status.artifactGitSha)) {
    errors.push(
      '[CT-7_INVALID_ARTIFACT_GIT_SHA] status.artifactGitSha must be a 40-character lowercase git SHA'
    );
  }

  validateThemeIds(errors, status.themeIds);
  validateThemeMapping(errors, status.themeMapping, status.themeIds);

  if (!parityModes.has(status.parityMode)) {
    errors.push('[CT-7_INVALID_PARITY_MODE] status.parityMode must be deferred or required');
  }

  if (status.parityMode === 'deferred') {
    requireNonEmptyString(errors, status.parityDeferredReason, 'status.parityDeferredReason');
  } else if (status.parityMode === 'required' && status.parityDeferredReason !== undefined) {
    errors.push(
      '[CT-7_FORBIDDEN_PARITY_DEFERRED_REASON] status.parityDeferredReason must be omitted when status.parityMode is required'
    );
  }

  if (
    status.lastSuccessfulPullAt !== null &&
    (typeof status.lastSuccessfulPullAt !== 'string' ||
      !utcIsoPattern.test(status.lastSuccessfulPullAt) ||
      Number.isNaN(Date.parse(status.lastSuccessfulPullAt)))
  ) {
    errors.push(
      '[CT-7_INVALID_LAST_SUCCESSFUL_PULL_AT] status.lastSuccessfulPullAt must be null or an ISO-8601 UTC timestamp'
    );
  }

  requireLiteral(errors, status.canonicalSource, 'repo-pr', 'status.canonicalSource');

  if (
    status.syncMode === 'pull-url-readonly' &&
    status.canonicalSource !== undefined &&
    status.canonicalSource !== 'repo-pr'
  ) {
    errors.push(
      '[CT-7_CANONICAL_SOURCE_CONTRADICTION] pull-url-readonly sync requires status.canonicalSource to remain repo-pr'
    );
  }
}

function validateThemeIds(errors, themeIds) {
  if (!Array.isArray(themeIds) || themeIds.length === 0) {
    errors.push('[CT-7_INVALID_THEME_IDS] status.themeIds must be a non-empty array');
    return;
  }

  const seen = new Set();
  for (const [index, themeId] of themeIds.entries()) {
    if (typeof themeId !== 'string' || themeId.length === 0) {
      errors.push(`[CT-7_INVALID_THEME_ID] status.themeIds[${index}] must be a non-empty string`);
      continue;
    }

    if (seen.has(themeId)) {
      errors.push(
        `[CT-7_DUPLICATE_THEME_ID] status.themeIds contains duplicate themeId ${themeId}`
      );
    }
    seen.add(themeId);
  }

  if (!seen.has('dark')) {
    errors.push('[CT-7_MISSING_DARK_THEME] status.themeIds must include dark');
  }
}

function validateThemeMapping(errors, themeMapping, themeIds) {
  if (!Array.isArray(themeMapping) || themeMapping.length === 0) {
    errors.push('[CT-7_INVALID_THEME_MAPPING] status.themeMapping must be a non-empty array');
    return;
  }

  const mappedThemeIds = new Set();
  for (const [index, entry] of themeMapping.entries()) {
    if (!assertPlainObject(errors, entry, `status.themeMapping[${index}] must be an object`)) {
      continue;
    }

    validateExactKeys(errors, entry, ['themeId', 'figmaMode'], `status.themeMapping[${index}]`);

    if (typeof entry.themeId !== 'string' || entry.themeId.length === 0) {
      errors.push(
        `[CT-7_INVALID_THEME_MAPPING_THEME_ID] status.themeMapping[${index}].themeId must be a non-empty string`
      );
    }

    if (typeof entry.figmaMode !== 'string' || entry.figmaMode.length === 0) {
      errors.push(
        `[CT-7_INVALID_THEME_MAPPING_MODE] status.themeMapping[${index}].figmaMode must be a non-empty string`
      );
    }

    if (typeof entry.themeId === 'string') {
      if (mappedThemeIds.has(entry.themeId)) {
        errors.push(
          `[CT-7_DUPLICATE_THEME_MAPPING] status.themeMapping contains duplicate themeId ${entry.themeId}`
        );
      }
      mappedThemeIds.add(entry.themeId);
    }
  }

  if (Array.isArray(themeIds)) {
    const themeIdSet = new Set(themeIds.filter((themeId) => typeof themeId === 'string'));
    for (const themeId of themeIdSet) {
      if (!mappedThemeIds.has(themeId)) {
        errors.push(
          `[CT-7_THEME_MAPPING_MISMATCH] status.themeMapping is missing themeId ${themeId}`
        );
      }
    }

    for (const themeId of mappedThemeIds) {
      if (!themeIdSet.has(themeId)) {
        errors.push(
          `[CT-7_THEME_MAPPING_MISMATCH] status.themeMapping contains unmapped themeId ${themeId}`
        );
      }
    }
  }
}

function validateDrift(errors, drift) {
  if (!Array.isArray(drift)) {
    errors.push('[CT-7_INVALID_DRIFT] drift must be an array');
    return;
  }

  for (const [index, entry] of drift.entries()) {
    if (!assertPlainObject(errors, entry, `drift[${index}] must be an object`)) {
      continue;
    }

    validateKeySpec(
      errors,
      entry,
      { required: driftRequiredKeys, optional: driftOptionalKeys },
      `drift[${index}]`
    );
    requireNonEmptyString(errors, entry.code, `drift[${index}].code`);
    requireNonEmptyString(errors, entry.message, `drift[${index}].message`);

    if (!driftSeverities.has(entry.severity)) {
      errors.push(
        `[CT-7_INVALID_DRIFT_SEVERITY] drift[${index}].severity must be info, warn, or error`
      );
    }

    if (!driftStatuses.has(entry.status)) {
      errors.push(`[CT-7_INVALID_DRIFT_STATUS] drift[${index}].status must be open or resolved`);
    }

    if (
      entry.field !== undefined &&
      (typeof entry.field !== 'string' || entry.field.length === 0)
    ) {
      errors.push(
        `[CT-7_INVALID_DRIFT_FIELD] drift[${index}].field must be a non-empty string when present`
      );
    }
  }
}

function assertPlainObject(errors, value, message) {
  if (!isPlainObject(value)) {
    errors.push(message);
    return false;
  }

  return true;
}

function validateExactKeys(errors, value, expectedKeys, label) {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  if (
    actualKeys.length !== sortedExpectedKeys.length ||
    actualKeys.some((key, index) => key !== sortedExpectedKeys[index])
  ) {
    errors.push(
      `[CT-7_INVALID_KEYS] ${label} must contain exactly: ${sortedExpectedKeys.join(', ')}`
    );
  }
}

function validateKeySpec(errors, value, keySpec, label) {
  const requiredKeys = [...keySpec.required].sort();
  const optionalKeys = [...(keySpec.optional ?? [])].sort();
  const allowedKeys = [...requiredKeys, ...optionalKeys].sort();
  const actualKeys = Object.keys(value).sort();

  for (const key of requiredKeys) {
    if (!actualKeys.includes(key)) {
      errors.push(`[CT-7_MISSING_REQUIRED_KEY] ${label}.${key} is required`);
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.includes(key)) {
      errors.push(`[CT-7_UNEXPECTED_KEY] ${label}.${key} is not allowed`);
    }
  }
}

function requireLiteral(errors, actual, expected, label) {
  if (actual !== expected) {
    errors.push(`[CT-7_INVALID_LITERAL] ${label} must be ${expected}`);
  }
}

function requireNonEmptyString(errors, value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    errors.push(`[CT-7_INVALID_STRING] ${label} must be a non-empty string`);
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
