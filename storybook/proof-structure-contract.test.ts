import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  loadAndValidateStorybookProofStructure,
  storybookProofStructureUsage,
} from '../scripts/lib/storybook-proof-structure.mjs';

const fixtureDir = path.join(repoRoot, 'scripts/fixtures/storybook-proof-structure');
const sharedTierPolicyPath = path.join(fixtureDir, '_shared/component-tier-policy.json');

describe('loadAndValidateStorybookProofStructure', () => {
  it('accepts the committed proof surfaces', () => {
    const result = loadAndValidateStorybookProofStructure();

    expect(result.errors).toEqual([]);
    expect(result.data.componentFacts).toEqual([
      {
        componentId: 'code-block',
        generatedArtifactRefs: {
          tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
          recipeDocs: null,
          runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
        },
        implementedKinds: ['default', 'variant-matrix', 'state-matrix', 'actions', 'async', 'docs'],
        requiredKinds: ['default', 'variant-matrix', 'state-matrix', 'actions', 'async', 'docs'],
        tier: 'primitive',
      },
      {
        componentId: 'message',
        generatedArtifactRefs: {
          tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
          recipeDocs: null,
          runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
        },
        implementedKinds: ['default', 'variant-matrix', 'docs'],
        requiredKinds: ['default', 'variant-matrix', 'docs'],
        tier: 'primitive',
      },
      {
        componentId: 'reasoning',
        generatedArtifactRefs: {
          tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
          recipeDocs: null,
          runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
        },
        implementedKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'async',
          'docs',
        ],
        requiredKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'async',
          'docs',
        ],
        tier: 'interactive',
      },
      {
        componentId: 'sources',
        generatedArtifactRefs: {
          tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
          recipeDocs: null,
          runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
        },
        implementedKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        requiredKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        tier: 'interactive',
      },
      {
        componentId: 'tool',
        generatedArtifactRefs: {
          tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
          recipeDocs: null,
          runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
        },
        implementedKinds: [
          'default',
          'variant-matrix',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'async',
          'docs',
        ],
        requiredKinds: [
          'default',
          'variant-matrix',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'async',
          'docs',
        ],
        tier: 'interactive',
      },
    ]);
  });

  it('accepts the valid fixture pilot', () => {
    const result = loadFixture('valid-pilot');

    expect(result.errors).toEqual([]);
    expect(result.data.storyIndex?.fileByStoryId.get('ai-elements-thinking-indicator--docs')).toBe(
      path.join(
        fixturePath('valid-pilot'),
        'src/components/ai-elements/ThinkingIndicator.stories.tsx'
      )
    );
    expect(
      result.data.storyIndex?.fileByStoryId.get('contracts-generated-tokens--token-registry')
    ).toBe(
      path.join(fixturePath('valid-pilot'), 'storybook/stories/generated-token-docs.stories.tsx')
    );
  });

  it('reports a duplicate component id in the inventory', () => {
    const result = loadFixture('duplicate-component-id');

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_PROOF_STRUCTURE_DUPLICATE_COMPONENT_ID]')
    );
  });

  it('reports a missing component spec file for an inventory component', () => {
    const result = loadFixture('missing-spec-file');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_MISSING_SPEC_FILE] componentId "thinking-indicator" is present in storybook/story-inventory.json but missing storybook/component-specs/thinking-indicator.json'
    );
  });

  it('reports an orphan component spec', () => {
    const result = loadFixture('orphan-spec');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_ORPHAN_SPEC] componentId "thinking-indicator" is defined by storybook/component-specs/thinking-indicator.json but missing from storybook/story-inventory.json'
    );
  });

  it('reports an unknown component tier', () => {
    const result = loadFixture('unknown-tier');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_UNKNOWN_TIER] componentId "thinking-indicator" references unknown tier "pilot" in componentSpec.tier'
    );
  });

  it('reports when a spec omits a tier-minimum required kind', () => {
    const result = loadFixture('tier-minimum-kind-missing');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_TIER_MINIMUM_KIND_MISSING] componentId "thinking-indicator" tier "interactive" requires kind "state-matrix" in componentSpec.requiredStoryKinds'
    );
  });

  it('reports a broken owned story ref', () => {
    const result = loadFixture('broken-owned-story-ref');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_UNRESOLVED_STORY_REF] componentId "thinking-indicator" references unresolved storyId "ai-elements-thinking-indicator--missing-story" in storyInventory.implementedStoryRefs'
    );
  });

  it('reports a broken generated artifact ref', () => {
    const result = loadFixture('unresolved-generated-artifact-ref');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_UNRESOLVED_GENERATED_ARTIFACT_REF] componentId "thinking-indicator" references missing generated artifact path "storybook/stories/missing-generated-docs.stories.tsx" in componentSpec.generatedArtifactRefs.tokenDocs'
    );
  });

  it('reports an inventory story ref that is not owned by the component spec', () => {
    const result = loadFixture('story-not-owned-by-spec');

    expect(result.errors).toContain(
      '[CT-9B_PROOF_STRUCTURE_STORY_NOT_OWNED_BY_SPEC] componentId "thinking-indicator" references storyId "contracts-external-docs--external-proof" but storybook/stories/external-proof.stories.tsx is not listed in componentSpec.generatedArtifactRefs and the story is not owned by the component spec'
    );
  });
});

describe('storybook proof structure package contract', () => {
  it('exposes the seam-owned validate:storybook-proof-structure entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['validate:storybook-proof-structure']).toBe(
      'node scripts/validate-storybook-proof-structure.mjs'
    );
  });

  it('registers the proof-structure validator in the Storybook validation command list', () => {
    const policyJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, '.storybook/storybook-version-policy.json'), 'utf8')
    ) as {
      validationCommands?: string[];
    };

    expect(policyJson.validationCommands).toContain(
      'node scripts/validate-storybook-proof-structure.mjs'
    );
  });

  it('keeps the CLI usage stable', () => {
    expect(storybookProofStructureUsage).toBe(
      'Usage: node scripts/validate-storybook-proof-structure.mjs [path-to-repo-root]'
    );
  });
});

function fixturePath(name: string) {
  return path.join(fixtureDir, name);
}

function loadFixture(name: string) {
  return loadAndValidateStorybookProofStructure({
    componentTierPolicyPath: sharedTierPolicyPath,
    rootDir: fixturePath(name),
    storyRoots: [
      path.join(fixturePath(name), 'src'),
      path.join(fixturePath(name), 'storybook/stories'),
    ],
  });
}
