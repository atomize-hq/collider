import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  loadAndValidateStoryInventory,
  storyInventoryUsage,
} from '../scripts/lib/storybook-story-inventory.mjs';

const fixtureDir = path.join(repoRoot, 'scripts/fixtures/storybook-story-inventory');

describe('loadAndValidateStoryInventory', () => {
  it('accepts the committed inventory', () => {
    const result = loadAndValidateStoryInventory(
      path.join(repoRoot, 'storybook/story-inventory.json')
    );

    expect(result.errors).toEqual([]);
    expect(result.data.components).toEqual([
      {
        componentId: 'message',
        validatorKinds: ['default', 'variant-matrix', 'docs'],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-message--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-message--variant-matrix' },
          { kind: 'docs', storyId: 'ai-elements-message--docs' },
        ],
      },
      {
        componentId: 'reasoning',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'async',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-reasoning--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-reasoning--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-reasoning--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-reasoning--focus' },
          { kind: 'workflow', storyId: 'ai-elements-reasoning--expand-collapse-flow' },
          { kind: 'motion', storyId: 'ai-elements-reasoning--collapse-transition' },
          { kind: 'async', storyId: 'ai-elements-reasoning--streaming-states' },
          { kind: 'docs', storyId: 'ai-elements-reasoning--docs' },
        ],
      },
      {
        componentId: 'code-block',
        validatorKinds: ['default', 'variant-matrix', 'state-matrix', 'actions', 'async', 'docs'],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-code-block--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-code-block--variant-matrix' },
          { kind: 'state-matrix', storyId: 'ai-elements-code-block--state-matrix' },
          { kind: 'actions', storyId: 'ai-elements-code-block--copy-action' },
          { kind: 'async', storyId: 'ai-elements-code-block--async-highlight' },
          { kind: 'docs', storyId: 'ai-elements-code-block--docs' },
        ],
      },
      {
        componentId: 'tool',
        validatorKinds: [
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
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-tool--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-tool--variant-matrix' },
          { kind: 'state-matrix', storyId: 'ai-elements-tool--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-tool--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-tool--focus' },
          { kind: 'workflow', storyId: 'ai-elements-tool--expand-collapse-flow' },
          { kind: 'motion', storyId: 'ai-elements-tool--collapse-transition' },
          { kind: 'async', storyId: 'ai-elements-tool--tool-call-lifecycle' },
          { kind: 'docs', storyId: 'ai-elements-tool--docs' },
        ],
      },
    ]);
  });

  it('accepts the valid sample fixture that uses current Storybook story ids', () => {
    const result = loadAndValidateStoryInventory(fixturePath('valid-sample.story-inventory.json'));

    expect(result.errors).toEqual([]);
    expect(result.data.components[0]?.implementedStoryRefs).toEqual([
      {
        kind: 'default',
        storyId: 'ai-elements-thinking-indicator--default',
      },
      {
        kind: 'variant-matrix',
        storyId: 'ai-elements-thinking-indicator--variant-matrix',
      },
      {
        kind: 'state-matrix',
        storyId: 'ai-elements-thinking-indicator--state-matrix',
      },
      {
        kind: 'motion',
        storyId: 'ai-elements-thinking-indicator--motion',
      },
      {
        kind: 'docs',
        storyId: 'ai-elements-thinking-indicator--docs',
      },
    ]);
  });

  it('reports an unknown validator kind', () => {
    const result = loadAndValidateStoryInventory(
      fixturePath('invalid-unknown-kind.story-inventory.json')
    );

    expect(result.errors).toContainEqual(
      expect.stringContaining('[CT-9B_STORY_INVENTORY_UNKNOWN_KIND]')
    );
  });

  it('reports a missing component id', () => {
    const result = loadAndValidateStoryInventory(
      fixturePath('invalid-missing-component-id.story-inventory.json')
    );

    expect(result.errors).toContain(
      '[CT-9B_STORY_INVENTORY_MISSING_REQUIRED_KEY] components[0].componentId is required'
    );
  });

  it('reports mismatched validator kinds and implemented story ref kinds', () => {
    const result = loadAndValidateStoryInventory(
      fixturePath('invalid-kind-set-mismatch.story-inventory.json')
    );

    expect(result.errors).toContain(
      '[CT-9B_STORY_INVENTORY_KIND_SET_MISMATCH] components[0].validatorKinds must match components[0].implementedStoryRefs.kind exactly'
    );
  });
});

describe('storybook story inventory package contract', () => {
  it('exposes the seam-owned validate:storybook-story-inventory entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['validate:storybook-story-inventory']).toBe(
      'node scripts/validate-storybook-story-inventory.mjs'
    );
  });

  it('keeps the CLI usage stable', () => {
    expect(storyInventoryUsage).toBe(
      'Usage: node scripts/validate-storybook-story-inventory.mjs [path-to-story-inventory.json]'
    );
  });
});

function fixturePath(name: string) {
  return path.join(fixtureDir, name);
}
