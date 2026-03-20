import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  getMinimumRequiredKindsForTier,
  isKnownTier,
  loadAndValidateComponentTierPolicy,
  storybookTierPolicyContractRules,
  storybookTierPolicyUsage,
} from '../scripts/lib/storybook-tier-policy.mjs';

const fixtureDir = path.join(repoRoot, 'scripts/fixtures/storybook-tier-policy');

describe('loadAndValidateComponentTierPolicy', () => {
  it('accepts the committed component tier policy baseline', () => {
    const result = loadAndValidateComponentTierPolicy(
      path.join(repoRoot, 'storybook/component-tier-policy.json')
    );

    expect(result.errors).toEqual([]);
    expect(result.data.tierOrder).toEqual(['primitive', 'interactive', 'workflow']);
  });

  it('reports an unknown tier', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-unknown-tier.component-tier-policy.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_TIER_POLICY_UNKNOWN_TIER]')
    );
  });

  it('reports an unknown validator kind', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-unknown-kind.component-tier-policy.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_TIER_POLICY_UNKNOWN_KIND]')
    );
  });

  it('reports overlap between required and optional kinds', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-overlap.component-tier-policy.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_TIER_POLICY_OVERLAPPING_KIND]')
    );
  });

  it('reports a missing required-kind purpose', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-empty-purpose.component-tier-policy.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_TIER_POLICY_INVALID_REQUIRED_KIND_PURPOSE]')
    );
  });

  it('reports an empty minimum required-kind list', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-empty-required-kinds.component-tier-policy.json')
    );

    expect(result.errors).toContain(
      '[CT-9B_TIER_POLICY_EMPTY_REQUIRED_KIND_LIST] componentTierPolicy.tiers.primitive.minimumRequiredKinds must not be empty'
    );
  });

  it('reports a duplicate required kind within a tier', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-duplicate-required-kind.component-tier-policy.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_TIER_POLICY_DUPLICATE_REQUIRED_KIND]')
    );
  });

  it('reports an invalid consumer thread id', () => {
    const result = loadAndValidateComponentTierPolicy(
      fixturePath('invalid-consumer-scope.component-tier-policy.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_TIER_POLICY_UNKNOWN_CONSUMER_THREAD]')
    );
  });
});

describe('storybook component tier policy helper surface', () => {
  it('resolves the interactive minimum required kinds for the pilot button assumption', () => {
    const buttonTier = 'interactive';

    expect(isKnownTier(buttonTier)).toBe(true);
    expect(getMinimumRequiredKindsForTier(buttonTier)).toEqual([
      'default',
      'docs',
      'state-matrix',
      'focus',
      'keyboard',
    ]);
  });

  it('keeps variant-matrix optional for interactive components', () => {
    const result = loadAndValidateComponentTierPolicy(
      path.join(repoRoot, 'storybook/component-tier-policy.json')
    );

    expect(result.errors).toEqual([]);
    expect(result.data.tiers.interactive.defaultOptionalKinds).toContain('variant-matrix');
  });

  it('publishes the minimum-only contract rules for later spec consumers', () => {
    expect(storybookTierPolicyContractRules).toEqual([
      'Tier policy defines minimum required kinds only.',
      'Component specs may add required kinds per component, but may not remove tier-minimum kinds.',
      'No new tier or validator kind may be introduced outside the repo-owned contract.',
    ]);
  });
});

describe('storybook component tier policy package contract', () => {
  it('exposes the seam-owned validate:storybook-tier-policy entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['validate:storybook-tier-policy']).toBe(
      'node scripts/validate-storybook-tier-policy.mjs'
    );
  });

  it('registers the tier policy validator in the Storybook validation command list', () => {
    const policyJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, '.storybook/storybook-version-policy.json'), 'utf8')
    ) as {
      validationCommands?: string[];
    };

    expect(policyJson.validationCommands).toContain(
      'node scripts/validate-storybook-tier-policy.mjs storybook/component-tier-policy.json'
    );
  });

  it('keeps the CLI usage stable', () => {
    expect(storybookTierPolicyUsage).toBe(
      'Usage: node scripts/validate-storybook-tier-policy.mjs [path-to-component-tier-policy.json]'
    );
  });
});

function fixturePath(name: string) {
  return path.join(fixtureDir, name);
}
