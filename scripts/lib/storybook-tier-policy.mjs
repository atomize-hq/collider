import fs from 'node:fs';
import path from 'node:path';

import { allowedStorybookValidatorKinds } from './storybook-story-inventory.mjs';

export const defaultComponentTierPolicyPath = 'storybook/component-tier-policy.json';
export const storybookTierPolicyUsage =
  'Usage: node scripts/validate-storybook-tier-policy.mjs [path-to-component-tier-policy.json]';
export const allowedStorybookComponentTiers = Object.freeze([
  'primitive',
  'interactive',
  'workflow',
]);
export const allowedStorybookConsumerThreads = Object.freeze(['THR-02', 'THR-04', 'THR-08']);
export const storybookTierPolicyContractRules = Object.freeze([
  'Tier policy defines minimum required kinds only.',
  'Component specs may add required kinds per component, but may not remove tier-minimum kinds.',
  'No new tier or validator kind may be introduced outside the repo-owned contract.',
]);

const validatorKindOrder = new Map(
  allowedStorybookValidatorKinds.map((kind, index) => [kind, index])
);
const tierOrder = new Map(allowedStorybookComponentTiers.map((tier, index) => [tier, index]));
const consumerThreadSet = new Set(allowedStorybookConsumerThreads);
const validatorKindSet = new Set(allowedStorybookValidatorKinds);

export function readComponentTierPolicy(target) {
  const absPath = path.resolve(target);
  return {
    absPath,
    data: JSON.parse(fs.readFileSync(absPath, 'utf8')),
  };
}

export function loadAndValidateComponentTierPolicy(target = defaultComponentTierPolicyPath) {
  const { absPath, data } = readComponentTierPolicy(target);
  return {
    absPath,
    data,
    errors: validateComponentTierPolicy(data),
  };
}

export function validateComponentTierPolicy(data) {
  const errors = [];

  if (!assertPlainObject(errors, data, 'componentTierPolicy')) {
    return errors;
  }

  validateKeySpec(
    errors,
    data,
    {
      required: ['policyVersion', 'tierOrder', 'tiers'],
      optional: [],
    },
    'componentTierPolicy'
  );

  requireLiteral(errors, data.policyVersion, '1', 'componentTierPolicy.policyVersion');
  validateTierOrder(errors, data.tierOrder);
  validateTiers(errors, data.tiers);

  return errors;
}

export function isKnownTier(tier) {
  return tierOrder.has(tier);
}

export function getMinimumRequiredKindsForTier(tier, target = defaultComponentTierPolicyPath) {
  const { data, errors } = loadAndValidateComponentTierPolicy(target);
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  if (!isKnownTier(tier)) {
    throw new Error(
      `[CT-9B_TIER_POLICY_UNKNOWN_TIER] tier must be one of ${allowedStorybookComponentTiers.join(', ')}`
    );
  }

  return data.tiers[tier].minimumRequiredKinds.map((entry) => entry.kind);
}

function validateTierOrder(errors, actualTierOrder) {
  const label = 'componentTierPolicy.tierOrder';
  if (!Array.isArray(actualTierOrder)) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_TIER_ORDER] ${label} must be an array`);
    return;
  }

  if (actualTierOrder.length !== allowedStorybookComponentTiers.length) {
    errors.push(
      `[CT-9B_TIER_POLICY_INVALID_TIER_ORDER] ${label} must contain exactly ${allowedStorybookComponentTiers.length} tiers`
    );
  }

  const seenTiers = new Set();
  let previousTierIndex = -1;

  for (const [index, tier] of actualTierOrder.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (typeof tier !== 'string' || tier.length === 0) {
      errors.push(`[CT-9B_TIER_POLICY_INVALID_TIER] ${itemLabel} must be a non-empty string`);
      continue;
    }

    if (!tierOrder.has(tier)) {
      errors.push(
        `[CT-9B_TIER_POLICY_UNKNOWN_TIER] ${itemLabel} must be one of ${allowedStorybookComponentTiers.join(', ')}`
      );
      continue;
    }

    if (seenTiers.has(tier)) {
      errors.push(`[CT-9B_TIER_POLICY_DUPLICATE_TIER] ${itemLabel} duplicates "${tier}"`);
      continue;
    }

    const nextTierIndex = tierOrder.get(tier);
    if (nextTierIndex < previousTierIndex) {
      errors.push(
        `[CT-9B_TIER_POLICY_INVALID_TIER_ORDER] ${label} must follow the canonical tier order`
      );
    }

    seenTiers.add(tier);
    previousTierIndex = nextTierIndex;
  }
}

function validateTiers(errors, tiers) {
  const label = 'componentTierPolicy.tiers';
  if (!assertPlainObject(errors, tiers, label)) {
    return;
  }

  const actualKeys = Object.keys(tiers).sort();
  const expectedKeys = [...allowedStorybookComponentTiers].sort();

  for (const tier of expectedKeys) {
    if (!actualKeys.includes(tier)) {
      errors.push(`[CT-9B_TIER_POLICY_MISSING_REQUIRED_TIER] ${label}.${tier} is required`);
    }
  }

  for (const tier of actualKeys) {
    if (!tierOrder.has(tier)) {
      errors.push(
        `[CT-9B_TIER_POLICY_UNKNOWN_TIER] ${label}.${tier} must be one of ${allowedStorybookComponentTiers.join(', ')}`
      );
      continue;
    }

    validateTier(errors, tiers[tier], tier);
  }
}

function validateTier(errors, tierEntry, tier) {
  const label = `componentTierPolicy.tiers.${tier}`;
  if (!assertPlainObject(errors, tierEntry, label)) {
    return;
  }

  validateKeySpec(
    errors,
    tierEntry,
    {
      required: ['consumerScope', 'defaultOptionalKinds', 'minimumRequiredKinds'],
      optional: [],
    },
    label
  );

  const requiredKinds = validateMinimumRequiredKinds(errors, tierEntry.minimumRequiredKinds, label);
  const optionalKinds = validateOptionalKinds(errors, tierEntry.defaultOptionalKinds, label);
  validateConsumerScope(errors, tierEntry.consumerScope, label);

  if (requiredKinds === null || optionalKinds === null) {
    return;
  }

  for (const kind of requiredKinds) {
    if (optionalKinds.has(kind)) {
      errors.push(
        `[CT-9B_TIER_POLICY_OVERLAPPING_KIND] ${label} must not list "${kind}" as both required and optional`
      );
    }
  }

  const union = new Set([...requiredKinds, ...optionalKinds]);
  for (const kind of allowedStorybookValidatorKinds) {
    if (!union.has(kind)) {
      errors.push(
        `[CT-9B_TIER_POLICY_UNCATEGORIZED_KIND] ${label} must explicitly classify "${kind}" as required or optional`
      );
    }
  }

  if (union.size !== validatorKindSet.size) {
    errors.push(
      `[CT-9B_TIER_POLICY_INVALID_KIND_COVERAGE] ${label} must classify each known validator kind exactly once`
    );
  }
}

function validateMinimumRequiredKinds(errors, minimumRequiredKinds, tierLabel) {
  const label = `${tierLabel}.minimumRequiredKinds`;
  if (!Array.isArray(minimumRequiredKinds)) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_REQUIRED_KIND_LIST] ${label} must be an array`);
    return null;
  }

  if (minimumRequiredKinds.length === 0) {
    errors.push(`[CT-9B_TIER_POLICY_EMPTY_REQUIRED_KIND_LIST] ${label} must not be empty`);
    return null;
  }

  const seenKinds = new Set();

  for (const [index, entry] of minimumRequiredKinds.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (!assertPlainObject(errors, entry, itemLabel)) {
      continue;
    }

    validateKeySpec(
      errors,
      entry,
      {
        required: ['kind', 'purpose'],
        optional: [],
      },
      itemLabel
    );

    const nextKindIndex = validateKindField(errors, entry.kind, `${itemLabel}.kind`);
    if (nextKindIndex !== null) {
      if (seenKinds.has(entry.kind)) {
        errors.push(
          `[CT-9B_TIER_POLICY_DUPLICATE_REQUIRED_KIND] ${itemLabel}.kind duplicates "${entry.kind}" in ${label}`
        );
      } else {
        seenKinds.add(entry.kind);
      }
    }

    if (typeof entry.purpose !== 'string' || entry.purpose.trim().length === 0) {
      errors.push(
        `[CT-9B_TIER_POLICY_INVALID_REQUIRED_KIND_PURPOSE] ${itemLabel}.purpose must be a non-empty string`
      );
    }
  }

  return seenKinds;
}

function validateOptionalKinds(errors, defaultOptionalKinds, tierLabel) {
  const label = `${tierLabel}.defaultOptionalKinds`;
  if (!Array.isArray(defaultOptionalKinds)) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_OPTIONAL_KIND_LIST] ${label} must be an array`);
    return null;
  }

  const seenKinds = new Set();

  for (const [index, kind] of defaultOptionalKinds.entries()) {
    const itemLabel = `${label}[${index}]`;
    const nextKindIndex = validateKindField(errors, kind, itemLabel);
    if (nextKindIndex === null) {
      continue;
    }

    if (seenKinds.has(kind)) {
      errors.push(
        `[CT-9B_TIER_POLICY_DUPLICATE_OPTIONAL_KIND] ${itemLabel} duplicates "${kind}" in ${label}`
      );
      continue;
    }

    seenKinds.add(kind);
  }

  return seenKinds;
}

function validateConsumerScope(errors, consumerScope, tierLabel) {
  const label = `${tierLabel}.consumerScope`;
  if (!Array.isArray(consumerScope)) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_CONSUMER_SCOPE] ${label} must be an array`);
    return;
  }

  if (consumerScope.length === 0) {
    errors.push(`[CT-9B_TIER_POLICY_EMPTY_CONSUMER_SCOPE] ${label} must not be empty`);
  }

  const seenThreads = new Set();

  for (const [index, threadId] of consumerScope.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (typeof threadId !== 'string' || threadId.length === 0) {
      errors.push(
        `[CT-9B_TIER_POLICY_INVALID_CONSUMER_THREAD] ${itemLabel} must be a non-empty string`
      );
      continue;
    }

    if (!consumerThreadSet.has(threadId)) {
      errors.push(
        `[CT-9B_TIER_POLICY_UNKNOWN_CONSUMER_THREAD] ${itemLabel} must be one of ${allowedStorybookConsumerThreads.join(', ')}`
      );
      continue;
    }

    if (seenThreads.has(threadId)) {
      errors.push(
        `[CT-9B_TIER_POLICY_DUPLICATE_CONSUMER_THREAD] ${itemLabel} duplicates "${threadId}" in ${label}`
      );
    }

    seenThreads.add(threadId);
  }
}

function validateKindField(errors, kind, label) {
  if (typeof kind !== 'string' || kind.length === 0) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_KIND] ${label} must be a non-empty string`);
    return null;
  }

  const nextKindIndex = validatorKindOrder.get(kind);
  if (typeof nextKindIndex !== 'number') {
    errors.push(
      `[CT-9B_TIER_POLICY_UNKNOWN_KIND] ${label} must be one of ${allowedStorybookValidatorKinds.join(', ')}`
    );
    return null;
  }

  return nextKindIndex;
}

function assertPlainObject(errors, value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_OBJECT] ${label} must be an object`);
    return false;
  }

  return true;
}

function validateKeySpec(errors, value, keySpec, label) {
  const requiredKeys = [...keySpec.required].sort();
  const optionalKeys = [...(keySpec.optional ?? [])].sort();
  const allowedKeys = [...requiredKeys, ...optionalKeys].sort();
  const actualKeys = Object.keys(value).sort();

  for (const key of requiredKeys) {
    if (!actualKeys.includes(key)) {
      errors.push(`[CT-9B_TIER_POLICY_MISSING_REQUIRED_KEY] ${label}.${key} is required`);
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.includes(key)) {
      errors.push(`[CT-9B_TIER_POLICY_UNEXPECTED_KEY] ${label}.${key} is not allowed`);
    }
  }
}

function requireLiteral(errors, actual, expected, label) {
  if (actual !== expected) {
    errors.push(`[CT-9B_TIER_POLICY_INVALID_LITERAL] ${label} must be ${expected}`);
  }
}
