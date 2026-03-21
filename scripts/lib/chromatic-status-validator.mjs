import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import { chromaticReviewJobName } from './chromatic-review-command.mjs';
import { chromaticStatusArtifactPath, chromaticStatusVersion } from './chromatic-status.mjs';

export const chromaticStatusValidationUsage = 'Usage: pnpm validate:chromatic-status';
export const chromaticStatusRootDirEnvVar = 'CHROMATIC_STATUS_ROOT_DIR';
export const chromaticStatusTargetEnvVar = 'CHROMATIC_STATUS_TARGET';
export const chromaticStatusExpectedGitShaEnvVar = 'CHROMATIC_STATUS_EXPECTED_GIT_SHA';
export const chromaticStatusMaxAgeMinutesEnvVar = 'CHROMATIC_STATUS_MAX_AGE_MINUTES';
export const defaultChromaticStatusMaxAgeMinutes = 1440;

const proofInventoryPathLiteral = 'storybook/story-inventory.json';
const diffOutcomeValues = ['passed', 'changed', 'failed', 'deferred'];
const reviewModeValues = ['informational', 'claim-required'];
const checkConclusionValues = ['success', 'neutral', 'failure', 'skipped'];
const diffOutcomeToCheckConclusion = {
  passed: 'success',
  changed: 'neutral',
  failed: 'failure',
  deferred: 'skipped',
};
const gitShaPattern = /^[a-f0-9]{40}$/;
const utcIsoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function readChromaticStatusArtifact(target = chromaticStatusArtifactPath, options = {}) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const absPath = path.isAbsolute(target) ? target : path.resolve(rootDir, target);

  return {
    absPath,
    data: JSON.parse(fs.readFileSync(absPath, 'utf8')),
  };
}

export function evaluateChromaticStatus(status, options = {}) {
  const errors = [];
  const now = normalizeNow(options.now);
  const maxAgeMinutes = normalizeMaxAgeMinutes(options.maxAgeMinutes);
  const expectedGitSha = normalizeExpectedGitSha(options.expectedGitSha);

  if (!isPlainObject(status)) {
    return {
      ok: false,
      errors: ['[CT-10B_CHROMATIC_STATUS_INVALID_ROOT] status payload must be a JSON object'],
    };
  }

  validateKeys(
    errors,
    status,
    [
      'statusVersion',
      'branch',
      'revision',
      'proofInventory',
      'build',
      'review',
      'check',
      'generatedAt',
    ],
    [],
    ''
  );
  requireLiteral(errors, status.statusVersion, chromaticStatusVersion, 'statusVersion');
  validateBranch(errors, status.branch);
  validateRevision(errors, status.revision, expectedGitSha);

  const proofInventory = validateProofInventory(errors, status.proofInventory);
  const review = validateReview(errors, status.review);
  validateBuild(errors, status.build);
  validateCheck(errors, status.check, review?.diffOutcome);
  validateGeneratedAt(errors, status.generatedAt, { maxAgeMinutes, now });
  validateScopeAlignment(errors, { proofInventory, review });

  return {
    ok: errors.length === 0,
    errors,
  };
}

export async function runChromaticStatusValidation(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const env = options.env ?? process.env;
  const rootDir = path.resolve(options.rootDir ?? env[chromaticStatusRootDirEnvVar] ?? repoRoot);
  const target = options.target ?? env[chromaticStatusTargetEnvVar] ?? chromaticStatusArtifactPath;
  const expectedGitSha = options.expectedGitSha ?? env[chromaticStatusExpectedGitShaEnvVar] ?? null;
  const maxAgeMinutes = normalizeMaxAgeMinutes(
    options.maxAgeMinutes ?? env[chromaticStatusMaxAgeMinutesEnvVar]
  );
  const now = normalizeNow(options.now);
  const readStatus = options.readStatus ?? readChromaticStatusArtifact;
  const evaluateStatus = options.evaluateStatus ?? evaluateChromaticStatus;

  let artifact;
  try {
    artifact = readStatus(target, { rootDir });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(
      stderr,
      `[CT-10B_CHROMATIC_STATUS_READ_FAILED] could not read ${resolveTargetPath(rootDir, target)}: ${message}`
    );
    return 1;
  }

  const evaluation = evaluateStatus(artifact.data, {
    expectedGitSha,
    maxAgeMinutes,
    now,
  });

  if (!evaluation.ok) {
    for (const error of evaluation.errors) {
      writeLine(stderr, error);
    }
    return 1;
  }

  writeLine(stdout, `✓ Chromatic status artifact valid: ${artifact.absPath}`);
  writeLine(stdout, 'Published review threads: THR-03, THR-06');
  return 0;
}

export async function runChromaticStatusValidationCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const stderr = options.stderr ?? process.stderr;
  const runValidation = options.runValidation ?? runChromaticStatusValidation;

  if (args.length > 0) {
    writeLine(stderr, chromaticStatusValidationUsage);
    return 1;
  }

  try {
    return await runValidation(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(stderr, `[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
    return 3;
  }
}

function validateBranch(errors, branch) {
  if (!isPlainObject(branch)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BRANCH] branch must be an object');
    return;
  }

  validateKeys(errors, branch, ['name'], [], 'branch');
  if (
    typeof branch.name !== 'string' ||
    branch.name.trim() !== branch.name ||
    branch.name.length === 0
  ) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_BRANCH_NAME] branch.name must be a non-empty trimmed string'
    );
  }
}

function validateRevision(errors, revision, expectedGitSha) {
  if (!isPlainObject(revision)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_REVISION] revision must be an object');
    return;
  }

  validateKeys(errors, revision, ['gitSha'], [], 'revision');
  if (typeof revision.gitSha !== 'string' || !gitShaPattern.test(revision.gitSha)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_GIT_SHA] revision.gitSha must be a 40-character lowercase git SHA'
    );
    return;
  }

  if (expectedGitSha && revision.gitSha !== expectedGitSha) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_GIT_SHA_MISMATCH] revision.gitSha must equal expected git SHA ${expectedGitSha}`
    );
  }
}

function validateProofInventory(errors, proofInventory) {
  if (!isPlainObject(proofInventory)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_PROOF_INVENTORY] proofInventory must be an object'
    );
    return null;
  }

  validateKeys(
    errors,
    proofInventory,
    ['path', 'inventoryVersion', 'selectedComponentIds', 'selectedStoryIds'],
    [],
    'proofInventory'
  );
  requireLiteral(errors, proofInventory.path, proofInventoryPathLiteral, 'proofInventory.path');
  requireNonEmptyString(errors, proofInventory.inventoryVersion, 'proofInventory.inventoryVersion');
  const selectedComponentIds = requireUniqueStringArray(
    errors,
    proofInventory.selectedComponentIds,
    'proofInventory.selectedComponentIds'
  );
  const selectedStoryIds = requireUniqueStringArray(
    errors,
    proofInventory.selectedStoryIds,
    'proofInventory.selectedStoryIds'
  );

  return {
    selectedComponentIds,
    selectedStoryIds,
  };
}

function validateBuild(errors, build) {
  if (!isPlainObject(build)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD] build must be an object');
    return;
  }

  validateKeys(errors, build, ['url'], [], 'build');
  if (typeof build.url !== 'string') {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD_URL] build.url must be a valid URL');
    return;
  }

  try {
    new URL(build.url);
  } catch {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD_URL] build.url must be a valid URL');
  }
}

function validateReview(errors, review) {
  if (!isPlainObject(review)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_REVIEW] review must be an object');
    return null;
  }

  validateKeys(errors, review, ['mode', 'requiredForClaim', 'scope', 'diffOutcome'], [], 'review');
  requireEnum(errors, review.mode, reviewModeValues, 'review.mode');
  requireEnum(errors, review.diffOutcome, diffOutcomeValues, 'review.diffOutcome');

  if (typeof review.requiredForClaim !== 'boolean') {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_BOOLEAN] review.requiredForClaim must be a boolean'
    );
  } else if (review.mode === 'informational' && review.requiredForClaim !== false) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_REQUIRED_FOR_CLAIM_MISMATCH] review.requiredForClaim must be false when review.mode is informational'
    );
  } else if (review.mode === 'claim-required' && review.requiredForClaim !== true) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_REQUIRED_FOR_CLAIM_MISMATCH] review.requiredForClaim must be true when review.mode is claim-required'
    );
  }

  const scope = validateReviewScope(errors, review.scope);

  return {
    diffOutcome: review.diffOutcome,
    scope,
  };
}

function validateReviewScope(errors, scope) {
  if (!isPlainObject(scope)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_REVIEW_SCOPE] review.scope must be an object');
    return null;
  }

  validateKeys(errors, scope, ['componentIds', 'storyIds', 'componentTiers'], [], 'review.scope');
  const componentIds = requireUniqueStringArray(
    errors,
    scope.componentIds,
    'review.scope.componentIds'
  );
  const storyIds = requireUniqueStringArray(errors, scope.storyIds, 'review.scope.storyIds');

  if (!isPlainObject(scope.componentTiers)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_COMPONENT_TIERS] review.scope.componentTiers must be an object'
    );
    return {
      componentIds,
      componentTiers: null,
      storyIds,
    };
  }

  const componentTierEntries = Object.entries(scope.componentTiers);
  if (componentTierEntries.length === 0) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_COMPONENT_TIERS] review.scope.componentTiers must not be empty'
    );
  }

  for (const [componentId, tier] of componentTierEntries) {
    if (componentId.length === 0) {
      errors.push(
        '[CT-10B_CHROMATIC_STATUS_INVALID_COMPONENT_TIERS] review.scope.componentTiers keys must be non-empty component IDs'
      );
    }

    if (typeof tier !== 'string' || tier.trim() !== tier || tier.length === 0) {
      errors.push(
        `[CT-10B_CHROMATIC_STATUS_INVALID_STRING] review.scope.componentTiers.${componentId} must be a non-empty string`
      );
    }
  }

  return {
    componentIds,
    componentTiers: scope.componentTiers,
    storyIds,
  };
}

function validateCheck(errors, check, diffOutcome) {
  if (!isPlainObject(check)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_CHECK] check must be an object');
    return;
  }

  validateKeys(errors, check, ['name', 'conclusion'], [], 'check');
  requireLiteral(errors, check.name, chromaticReviewJobName, 'check.name');
  requireEnum(errors, check.conclusion, checkConclusionValues, 'check.conclusion');

  if (typeof diffOutcome === 'string') {
    const expectedConclusion = diffOutcomeToCheckConclusion[diffOutcome];
    if (expectedConclusion && check.conclusion !== expectedConclusion) {
      errors.push(
        `[CT-10B_CHROMATIC_STATUS_CHECK_CONCLUSION_MISMATCH] check.conclusion must be ${expectedConclusion} when review.diffOutcome is ${diffOutcome}`
      );
    }
  }
}

function validateGeneratedAt(errors, generatedAt, options) {
  if (
    typeof generatedAt !== 'string' ||
    !utcIsoPattern.test(generatedAt) ||
    Number.isNaN(Date.parse(generatedAt))
  ) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_TIMESTAMP] generatedAt must be an ISO-8601 UTC timestamp'
    );
    return;
  }

  const generatedTime = Date.parse(generatedAt);
  const ageMs = options.now.getTime() - generatedTime;
  if (ageMs > options.maxAgeMinutes * 60 * 1000) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_STALE] generatedAt must be no older than ${options.maxAgeMinutes} minutes`
    );
  }
}

function validateScopeAlignment(errors, values) {
  const proofInventory = values.proofInventory;
  const reviewScope = values.review?.scope;

  if (!proofInventory || !reviewScope) {
    return;
  }

  if (!arraysEqual(proofInventory.selectedComponentIds, reviewScope.componentIds)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_SCOPE_MISMATCH] review.scope.componentIds must match proofInventory.selectedComponentIds exactly'
    );
  }

  if (!arraysEqual(proofInventory.selectedStoryIds, reviewScope.storyIds)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_SCOPE_MISMATCH] review.scope.storyIds must match proofInventory.selectedStoryIds exactly'
    );
  }

  if (reviewScope.componentTiers && Array.isArray(reviewScope.componentIds)) {
    const expectedComponentIds = [...reviewScope.componentIds].sort();
    const actualComponentIds = Object.keys(reviewScope.componentTiers).sort();
    if (!arraysEqual(expectedComponentIds, actualComponentIds)) {
      errors.push(
        '[CT-10B_CHROMATIC_STATUS_SCOPE_MISMATCH] review.scope.componentTiers keys must match review.scope.componentIds exactly'
      );
    }
  }
}

function validateKeys(errors, value, required, optional, label) {
  const allowedKeys = new Set([...required, ...optional]);
  const actualKeys = Object.keys(value);

  for (const key of required) {
    if (!(key in value)) {
      errors.push(
        `[CT-10B_CHROMATIC_STATUS_MISSING_REQUIRED_KEY] ${formatPath(label, key)} is required`
      );
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.has(key)) {
      errors.push(
        `[CT-10B_CHROMATIC_STATUS_UNEXPECTED_KEY] ${formatPath(label, key)} is not allowed`
      );
    }
  }
}

function requireLiteral(errors, actual, expected, label) {
  if (actual !== expected) {
    errors.push(`[CT-10B_CHROMATIC_STATUS_INVALID_LITERAL] ${label} must be ${expected}`);
  }
}

function requireNonEmptyString(errors, actual, label) {
  if (typeof actual !== 'string' || actual.trim() !== actual || actual.length === 0) {
    errors.push(`[CT-10B_CHROMATIC_STATUS_INVALID_STRING] ${label} must be a non-empty string`);
  }
}

function requireUniqueStringArray(errors, actual, label) {
  if (!Array.isArray(actual) || actual.length === 0) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_STRING_ARRAY] ${label} must be a non-empty string array`
    );
    return null;
  }

  const invalidItem = actual.find(
    (item) => typeof item !== 'string' || item.trim() !== item || item.length === 0
  );
  if (invalidItem !== undefined) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_STRING_ARRAY] ${label} must be a non-empty string array`
    );
    return null;
  }

  if (new Set(actual).size !== actual.length) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_STRING_ARRAY] ${label} must not contain duplicate values`
    );
  }

  return [...actual];
}

function requireEnum(errors, actual, allowedValues, label) {
  if (typeof actual !== 'string' || !allowedValues.includes(actual)) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_ENUM] ${label} must be ${allowedValues.join(', ')}`
    );
  }
}

function normalizeExpectedGitSha(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value).trim();
}

function normalizeMaxAgeMinutes(value) {
  if (value === undefined || value === null || value === '') {
    return defaultChromaticStatusMaxAgeMinutes;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `[CT-10B_CHROMATIC_STATUS_INVALID_MAX_AGE] ${chromaticStatusMaxAgeMinutesEnvVar} must be a non-negative integer`
    );
  }

  return parsed;
}

function normalizeNow(now) {
  if (now instanceof Date) {
    return now;
  }

  if (typeof now === 'string' || typeof now === 'number') {
    return new Date(now);
  }

  return new Date();
}

function resolveTargetPath(rootDir, target) {
  return path.isAbsolute(target) ? target : path.resolve(rootDir, target);
}

function formatPath(label, key) {
  return label ? `${label}.${key}` : key;
}

function arraysEqual(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
