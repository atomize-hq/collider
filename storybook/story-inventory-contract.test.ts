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
      {
        componentId: 'sources',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-sources--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-sources--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-sources--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-sources--focus' },
          { kind: 'workflow', storyId: 'ai-elements-sources--expand-collapse-flow' },
          { kind: 'motion', storyId: 'ai-elements-sources--collapse-transition' },
          { kind: 'docs', storyId: 'ai-elements-sources--docs' },
        ],
      },
      {
        componentId: 'task',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-task--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-task--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-task--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-task--focus' },
          { kind: 'workflow', storyId: 'ai-elements-task--expand-collapse-flow' },
          { kind: 'motion', storyId: 'ai-elements-task--collapse-transition' },
          { kind: 'docs', storyId: 'ai-elements-task--docs' },
        ],
      },
      {
        componentId: 'chain-of-thought',
        validatorKinds: [
          'default',
          'variant-matrix',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-chain-of-thought--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-chain-of-thought--variant-matrix' },
          { kind: 'state-matrix', storyId: 'ai-elements-chain-of-thought--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-chain-of-thought--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-chain-of-thought--focus' },
          { kind: 'workflow', storyId: 'ai-elements-chain-of-thought--expand-collapse-flow' },
          { kind: 'motion', storyId: 'ai-elements-chain-of-thought--collapse-transition' },
          { kind: 'docs', storyId: 'ai-elements-chain-of-thought--docs' },
        ],
      },
      {
        componentId: 'suggestion',
        validatorKinds: ['default', 'variant-matrix', 'actions', 'keyboard', 'focus', 'docs'],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-suggestion--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-suggestion--variant-matrix' },
          { kind: 'actions', storyId: 'ai-elements-suggestion--click-action' },
          { kind: 'keyboard', storyId: 'ai-elements-suggestion--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-suggestion--focus' },
          { kind: 'docs', storyId: 'ai-elements-suggestion--docs' },
        ],
      },
      {
        componentId: 'inline-citation',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-inline-citation--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-inline-citation--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-inline-citation--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-inline-citation--focus' },
          {
            kind: 'workflow',
            storyId: 'ai-elements-inline-citation--open-hover-card-flow',
          },
          {
            kind: 'motion',
            storyId: 'ai-elements-inline-citation--hover-card-transition',
          },
          { kind: 'docs', storyId: 'ai-elements-inline-citation--docs' },
        ],
      },
      {
        componentId: 'context',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-context--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-context--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-context--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-context--focus' },
          { kind: 'workflow', storyId: 'ai-elements-context--open-hover-card-flow' },
          { kind: 'motion', storyId: 'ai-elements-context--hover-card-transition' },
          { kind: 'docs', storyId: 'ai-elements-context--docs' },
        ],
      },
      {
        componentId: 'prompt-input',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-prompt-input--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-prompt-input--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-prompt-input--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-prompt-input--focus' },
          { kind: 'workflow', storyId: 'ai-elements-prompt-input--workflow' },
          {
            kind: 'motion',
            storyId: 'ai-elements-prompt-input--submit-status-motion',
          },
          { kind: 'docs', storyId: 'ai-elements-prompt-input--docs' },
        ],
      },
      {
        componentId: 'snippet',
        validatorKinds: ['default', 'variant-matrix', 'actions', 'keyboard', 'focus', 'docs'],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-snippet--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-snippet--variant-matrix' },
          { kind: 'actions', storyId: 'ai-elements-snippet--copy-action' },
          { kind: 'keyboard', storyId: 'ai-elements-snippet--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-snippet--focus' },
          { kind: 'docs', storyId: 'ai-elements-snippet--docs' },
        ],
      },
      {
        componentId: 'image',
        validatorKinds: ['default', 'variant-matrix', 'docs'],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-image--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-image--variant-matrix' },
          { kind: 'docs', storyId: 'ai-elements-image--docs' },
        ],
      },
      {
        componentId: 'open-in-chat',
        validatorKinds: [
          'default',
          'state-matrix',
          'keyboard',
          'focus',
          'workflow',
          'motion',
          'docs',
        ],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-open-in-chat--default' },
          { kind: 'state-matrix', storyId: 'ai-elements-open-in-chat--state-matrix' },
          { kind: 'keyboard', storyId: 'ai-elements-open-in-chat--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-open-in-chat--focus' },
          { kind: 'workflow', storyId: 'ai-elements-open-in-chat--open-menu-flow' },
          { kind: 'motion', storyId: 'ai-elements-open-in-chat--menu-open-transition' },
          { kind: 'docs', storyId: 'ai-elements-open-in-chat--docs' },
        ],
      },
      {
        componentId: 'artifact',
        validatorKinds: ['default', 'variant-matrix', 'actions', 'keyboard', 'focus', 'docs'],
        implementedStoryRefs: [
          { kind: 'default', storyId: 'ai-elements-artifact--default' },
          { kind: 'variant-matrix', storyId: 'ai-elements-artifact--variant-matrix' },
          { kind: 'actions', storyId: 'ai-elements-artifact--copy-action' },
          { kind: 'keyboard', storyId: 'ai-elements-artifact--keyboard' },
          { kind: 'focus', storyId: 'ai-elements-artifact--focus' },
          { kind: 'docs', storyId: 'ai-elements-artifact--docs' },
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
