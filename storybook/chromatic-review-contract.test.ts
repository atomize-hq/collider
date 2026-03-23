import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';

const contractPath = path.join(repoRoot, 'storybook/chromatic-review-contract.md');
const policyPath = path.join(repoRoot, 'storybook/chromatic-review-policy.md');
const fixtureDir = path.join(repoRoot, 'scripts/fixtures/chromatic-status');
const storyInventoryPath = path.join(repoRoot, 'storybook/story-inventory.json');
const proofCoveragePath = path.join(repoRoot, 'artifacts/storybook/proof-coverage.json');
const thinkingIndicatorSpecPath = path.join(
  repoRoot,
  'storybook/component-specs/thinking-indicator.json'
);

const requiredRootKeys = [
  'statusVersion',
  'branch',
  'revision',
  'proofInventory',
  'build',
  'review',
  'check',
  'generatedAt',
];

const validFixtureNames = [
  'valid-passed.chromatic-status.json',
  'valid-changed.chromatic-status.json',
  'valid-failed.chromatic-status.json',
  'valid-deferred.chromatic-status.json',
];

const proofInventoryPathLiteral = 'storybook/story-inventory.json';
const namedCheckLiteral = 'chromatic-review';
const modeValues = ['informational', 'claim-required'];
const diffOutcomeValues = ['passed', 'changed', 'failed', 'deferred'];
const checkConclusionValues = ['success', 'neutral', 'failure', 'skipped'];
const shaPattern = /^[a-f0-9]{40}$/;
const utcIsoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

describe('chromatic review contract doc', () => {
  it('exists and names the frozen root keys and compatibility rule', () => {
    const contract = fs.readFileSync(contractPath, 'utf8');

    expect(contract).toContain('artifacts/chromatic/status.json');
    for (const key of requiredRootKeys) {
      expect(contract).toContain(`\`${key}\``);
    }
    expect(contract).toContain(
      'Provider or host changes must preserve these field names and meanings.'
    );
    expect(contract).toContain(
      'bump `statusVersion` instead of renaming the existing `CT-10B` keys'
    );
    expect(contract).toContain(
      'No raw provider payload, response blob, or vendor-only nested shape may appear in `CT-10B`.'
    );
    expect(contract).toContain('`review.requiredForClaim`');
    expect(contract).toContain('`review.scope.componentIds`');
    expect(contract).toContain('`review.scope.storyIds`');
    expect(contract).toContain('`review.scope.componentTiers`');
    expect(contract).toContain(
      '`review.mode` is restricted to `informational` and `claim-required`.'
    );
    expect(contract).toContain(
      '`review.requiredForClaim` is reserved for future reusable-component promotion consumption in `SEAM-10B`.'
    );
    expect(contract).toContain('## Downstream Consumption Contract');
    expect(contract).toContain('`SEAM-9B` may consume only these `CT-10B` fields');
    expect(contract).toContain('`SEAM-10B` may consume only these `CT-10B` fields');
    expect(contract).toContain('`check.name` and `check.conclusion` are execution evidence only.');
    expect(contract).toContain('## Downstream Stale Triggers');
    expect(contract).toContain('if the published `build.url` shape changes');
  });
});

describe('chromatic review policy doc', () => {
  it('pins CT-9B as the only scope source and keeps SEAM-8B non-blocking', () => {
    const policy = fs.readFileSync(policyPath, 'utf8');

    expect(policy).toContain('The only allowed source of review scope is landed `CT-9B`.');
    expect(policy).toContain('`SEAM-8B` remains non-blocking and non-universal.');
    expect(policy).toContain('Claim-level ratcheting remains owned by `SEAM-10B`.');
    expect(policy).toContain('`review.mode` is limited to `informational` and `claim-required`.');
    expect(policy).toContain(
      'Deferred, skipped, or out-of-scope runs do not create a third review mode.'
    );
    expect(policy).toContain('`componentIds`: `["thinking-indicator"]`');
    expect(policy).toContain('`componentTiers`: `{ "thinking-indicator": "primitive" }`');
  });
});

describe('chromatic status fixtures', () => {
  it.each(validFixtureNames)('accepts %s against the frozen seam-local contract', (fixtureName) => {
    const result = loadFixture(fixtureName);

    expect(result.errors).toEqual([]);
  });

  it('rejects the invalid fixture because a repo-owned field is missing', () => {
    const result = loadFixture('invalid-missing-selected-story-ids.chromatic-status.json');

    expect(result.errors).toContain(
      '[CT-10B_CHROMATIC_STATUS_MISSING_REQUIRED_KEY] proofInventory.selectedStoryIds is required'
    );
  });

  it('keeps the committed pilot proof scope aligned with CT-9B inventory and coverage', () => {
    const storyInventory = JSON.parse(fs.readFileSync(storyInventoryPath, 'utf8')) as {
      inventoryVersion: string;
      components: Array<{
        componentId: string;
        implementedStoryRefs: Array<{ storyId: string }>;
      }>;
    };
    const proofCoverage = JSON.parse(fs.readFileSync(proofCoveragePath, 'utf8')) as {
      components: Array<{ componentId: string }>;
    };
    const thinkingIndicatorSpec = JSON.parse(
      fs.readFileSync(thinkingIndicatorSpecPath, 'utf8')
    ) as {
      componentId: string;
      tier: string;
    };
    const inventoryEntry = storyInventory.components.find(
      (component) => component.componentId === 'thinking-indicator'
    );

    expect(inventoryEntry).toBeDefined();
    const expectedStoryIds = inventoryEntry?.implementedStoryRefs.map((story) => story.storyId);
    const expectedComponentIds = proofCoverage.components.map((component) => component.componentId);
    const expectedComponentTiers = {
      [thinkingIndicatorSpec.componentId]: thinkingIndicatorSpec.tier,
    };

    for (const fixtureName of validFixtureNames) {
      const fixture = loadFixture(fixtureName).data;

      expect(fixture.proofInventory.path).toBe(proofInventoryPathLiteral);
      expect(fixture.proofInventory.inventoryVersion).toBe(storyInventory.inventoryVersion);
      expect(fixture.proofInventory.selectedComponentIds).toEqual(expectedComponentIds);
      expect(fixture.proofInventory.selectedStoryIds).toEqual(expectedStoryIds);
      expect(fixture.review.scope.componentIds).toEqual(expectedComponentIds);
      expect(fixture.review.scope.storyIds).toEqual(expectedStoryIds);
      expect(fixture.review.scope.componentTiers).toEqual(expectedComponentTiers);
    }
  });
});

function loadFixture(name: string) {
  const fixturePath = path.join(fixtureDir, name);
  const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  return {
    data,
    errors: validateChromaticStatusFixture(data),
  };
}

function validateChromaticStatusFixture(data: unknown) {
  const errors: string[] = [];

  if (!isPlainObject(data)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_ROOT] status payload must be a JSON object');
    return errors;
  }

  validateKeys(errors, data, requiredRootKeys, [], 'status');
  requireLiteral(errors, data.statusVersion, '1', 'statusVersion');
  validateBranch(errors, data.branch);
  validateRevision(errors, data.revision);
  validateProofInventory(errors, data.proofInventory);
  validateBuild(errors, data.build);
  validateReview(errors, data.review);
  validateCheck(errors, data.check);
  requireUtcTimestamp(errors, data.generatedAt, 'generatedAt');

  return errors;
}

function validateBranch(errors: string[], branch: unknown) {
  if (!isPlainObject(branch)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BRANCH] branch must be an object');
    return;
  }

  validateKeys(errors, branch, ['name'], [], 'branch');
  requireNonEmptyString(errors, branch.name, 'branch.name');
}

function validateRevision(errors: string[], revision: unknown) {
  if (!isPlainObject(revision)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_REVISION] revision must be an object');
    return;
  }

  validateKeys(errors, revision, ['gitSha'], [], 'revision');
  if (typeof revision.gitSha !== 'string' || !shaPattern.test(revision.gitSha)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_GIT_SHA] revision.gitSha must be a 40-character lowercase git SHA'
    );
  }
}

function validateProofInventory(errors: string[], proofInventory: unknown) {
  if (!isPlainObject(proofInventory)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_PROOF_INVENTORY] proofInventory must be an object'
    );
    return;
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
  requireStringArray(
    errors,
    proofInventory.selectedComponentIds,
    'proofInventory.selectedComponentIds'
  );
  requireStringArray(errors, proofInventory.selectedStoryIds, 'proofInventory.selectedStoryIds');
}

function validateBuild(errors: string[], build: unknown) {
  if (!isPlainObject(build)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD] build must be an object');
    return;
  }

  validateKeys(errors, build, ['url'], [], 'build');
  if (typeof build.url !== 'string') {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD_URL] build.url must be a string');
    return;
  }

  try {
    new URL(build.url);
  } catch {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD_URL] build.url must be a valid URL');
  }
}

function validateReview(errors: string[], review: unknown) {
  if (!isPlainObject(review)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_REVIEW] review must be an object');
    return;
  }

  validateKeys(errors, review, ['mode', 'requiredForClaim', 'scope', 'diffOutcome'], [], 'review');
  requireEnum(errors, review.mode, modeValues, 'review.mode');
  if (typeof review.requiredForClaim !== 'boolean') {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_BOOLEAN] review.requiredForClaim must be a boolean'
    );
  }
  validateReviewScope(errors, review.scope);
  requireEnum(errors, review.diffOutcome, diffOutcomeValues, 'review.diffOutcome');
}

function validateReviewScope(errors: string[], scope: unknown) {
  if (!isPlainObject(scope)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_REVIEW_SCOPE] review.scope must be an object');
    return;
  }

  validateKeys(errors, scope, ['componentIds', 'storyIds', 'componentTiers'], [], 'review.scope');
  requireStringArray(errors, scope.componentIds, 'review.scope.componentIds');
  requireStringArray(errors, scope.storyIds, 'review.scope.storyIds');

  if (!isPlainObject(scope.componentTiers)) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_COMPONENT_TIERS] review.scope.componentTiers must be an object'
    );
    return;
  }

  const tiers = Object.entries(scope.componentTiers);
  if (tiers.length === 0) {
    errors.push(
      '[CT-10B_CHROMATIC_STATUS_INVALID_COMPONENT_TIERS] review.scope.componentTiers must not be empty'
    );
  }

  for (const [componentId, tier] of tiers) {
    if (componentId.length === 0) {
      errors.push(
        '[CT-10B_CHROMATIC_STATUS_INVALID_COMPONENT_TIERS] review.scope.componentTiers keys must be non-empty component IDs'
      );
    }
    if (typeof tier !== 'string' || tier.length === 0) {
      errors.push(
        `[CT-10B_CHROMATIC_STATUS_INVALID_STRING] review.scope.componentTiers.${componentId} must be a non-empty string`
      );
    }
  }
}

function validateCheck(errors: string[], check: unknown) {
  if (!isPlainObject(check)) {
    errors.push('[CT-10B_CHROMATIC_STATUS_INVALID_CHECK] check must be an object');
    return;
  }

  validateKeys(errors, check, ['name', 'conclusion'], [], 'check');
  requireLiteral(errors, check.name, namedCheckLiteral, 'check.name');
  requireEnum(errors, check.conclusion, checkConclusionValues, 'check.conclusion');
}

function validateKeys(
  errors: string[],
  value: Record<string, unknown>,
  required: string[],
  optional: string[],
  label: string
) {
  const allowedKeys = new Set([...required, ...optional]);
  const actualKeys = Object.keys(value);

  for (const key of required) {
    if (!(key in value)) {
      errors.push(`[CT-10B_CHROMATIC_STATUS_MISSING_REQUIRED_KEY] ${label}.${key} is required`);
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.has(key)) {
      errors.push(`[CT-10B_CHROMATIC_STATUS_UNEXPECTED_KEY] ${label}.${key} is not allowed`);
    }
  }
}

function requireLiteral(errors: string[], actual: unknown, expected: string, label: string) {
  if (actual !== expected) {
    errors.push(`[CT-10B_CHROMATIC_STATUS_INVALID_LITERAL] ${label} must be ${expected}`);
  }
}

function requireNonEmptyString(errors: string[], actual: unknown, label: string) {
  if (typeof actual !== 'string' || actual.length === 0) {
    errors.push(`[CT-10B_CHROMATIC_STATUS_INVALID_STRING] ${label} must be a non-empty string`);
  }
}

function requireStringArray(errors: string[], actual: unknown, label: string) {
  if (
    !Array.isArray(actual) ||
    actual.length === 0 ||
    actual.some((item) => typeof item !== 'string')
  ) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_STRING_ARRAY] ${label} must be a non-empty string array`
    );
  }
}

function requireEnum(errors: string[], actual: unknown, allowedValues: string[], label: string) {
  if (typeof actual !== 'string' || !allowedValues.includes(actual)) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_ENUM] ${label} must be ${allowedValues.join(', ')}`
    );
  }
}

function requireUtcTimestamp(errors: string[], actual: unknown, label: string) {
  if (
    typeof actual !== 'string' ||
    !utcIsoPattern.test(actual) ||
    Number.isNaN(Date.parse(actual))
  ) {
    errors.push(
      `[CT-10B_CHROMATIC_STATUS_INVALID_TIMESTAMP] ${label} must be an ISO-8601 UTC timestamp`
    );
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
