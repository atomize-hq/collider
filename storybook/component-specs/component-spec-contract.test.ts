import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  allowedComponentSpecKinds,
  componentSpecVersion,
  validateComponentSpec,
} from '../../scripts/lib/storybook-component-spec.mjs';

const thinkingIndicatorSpecPath = path.join(
  repoRoot,
  'storybook/component-specs/thinking-indicator.json'
);

type ComponentSpecFixture = {
  specVersion: string;
  componentId: string;
  tier: string;
  requiredStoryKinds: string[];
  ownedStoryRefs: Array<{
    storyId: string;
    kinds: string[];
  }>;
  generatedArtifactRefs: {
    tokenDocs: string | null;
    recipeDocs: string | null;
    runtimeParity: string | null;
  };
  downstreamHooks: {
    codeEntrypoint: string | null;
    figmaComponentRef: string | null;
    supportedVariantsSource: string | null;
    slotNamesSource: string | null;
    exampleStoryIds: string[];
  };
  [key: string]: unknown;
};

describe('validateComponentSpec', () => {
  it('accepts the committed thinking-indicator component spec', () => {
    const result = validateComponentSpec(readThinkingIndicatorSpec(), {
      filenameStem: 'thinking-indicator',
    });

    expect(result).toEqual([]);
  });

  it('keeps the component spec contract version and kind vocabulary stable', () => {
    expect(componentSpecVersion).toBe('1');
    expect(allowedComponentSpecKinds).toEqual([
      'default',
      'variant-matrix',
      'state-matrix',
      'actions',
      'controlled',
      'keyboard',
      'focus',
      'workflow',
      'motion',
      'async',
      'docs',
      'responsive',
      'composition',
    ]);
  });

  it('keeps the committed thinking-indicator Stage 1 spec reviewer-clear', () => {
    const spec = readThinkingIndicatorSpec();

    expect(spec.componentId).toBe('thinking-indicator');
    expect(spec.tier).toBe('primitive');
    expect(spec.requiredStoryKinds).toEqual(['default', 'docs']);
    expect(spec.ownedStoryRefs).toEqual([
      {
        storyId: 'contracts-pilot-recipe--button-recipe',
        kinds: ['default'],
      },
      {
        storyId: 'contracts-generated-tokens--token-registry',
        kinds: ['docs'],
      },
    ]);
    expect(spec.generatedArtifactRefs).toEqual({
      tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
      recipeDocs: 'storybook/stories/pilot-recipe-contract.stories.tsx',
      runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
    });
    expect(spec.downstreamHooks).toEqual({
      codeEntrypoint: null,
      figmaComponentRef: null,
      supportedVariantsSource: null,
      slotNamesSource: null,
      exampleStoryIds: [],
    });
  });

  it('reports a missing component id', () => {
    const spec = omitKey(readThinkingIndicatorSpec(), 'componentId');

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_MISSING_REQUIRED_KEY] componentSpec.componentId is required'
    );
  });

  it('reports a filename and component id mismatch', () => {
    const result = validateComponentSpec(readThinkingIndicatorSpec(), {
      filenameStem: 'thinking-indicator-variant',
    });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_FILENAME_MISMATCH] componentSpec.componentId must match filename stem "thinking-indicator-variant"'
    );
  });

  it('reports an unknown proof kind', () => {
    const spec = readThinkingIndicatorSpec();
    spec.requiredStoryKinds = ['docs', 'hover-state'];

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContainEqual(expect.stringContaining('[CT-9B_COMPONENT_SPEC_UNKNOWN_KIND]'));
  });

  it('reports a duplicate proof kind', () => {
    const spec = readThinkingIndicatorSpec();
    spec.requiredStoryKinds = ['docs', 'docs'];

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_DUPLICATE_KIND] componentSpec.requiredStoryKinds[1] duplicates "docs" in componentSpec.requiredStoryKinds'
    );
  });

  it('reports a duplicate owned story ref story id', () => {
    const spec = readThinkingIndicatorSpec();
    spec.ownedStoryRefs = [
      ...spec.ownedStoryRefs,
      {
        storyId: 'contracts-pilot-recipe--button-recipe',
        kinds: ['docs'],
      },
    ];

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_DUPLICATE_STORY_ID] componentSpec.ownedStoryRefs[2].storyId duplicates "contracts-pilot-recipe--button-recipe"'
    );
  });

  it('reports unexpected root and nested keys', () => {
    const spec = readThinkingIndicatorSpec();
    spec.extraField = true;
    (spec.downstreamHooks as Record<string, unknown>).vendorDescriptor = {};

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_UNEXPECTED_KEY] componentSpec.extraField is not allowed'
    );
    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_UNEXPECTED_KEY] componentSpec.downstreamHooks.vendorDescriptor is not allowed'
    );
  });

  it('reports a non-path generated artifact ref', () => {
    const spec = readThinkingIndicatorSpec();
    spec.generatedArtifactRefs.tokenDocs = 'https://storybook.example.com/tokens';

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_INVALID_REPO_PATH] componentSpec.generatedArtifactRefs.tokenDocs must be a repo-relative path string or null'
    );
  });

  it('reports a missing downstream hook key', () => {
    const spec = readThinkingIndicatorSpec();
    spec.downstreamHooks = omitKey(
      spec.downstreamHooks,
      'slotNamesSource'
    ) as ComponentSpecFixture['downstreamHooks'];

    const result = validateComponentSpec(spec, { filenameStem: 'thinking-indicator' });

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_MISSING_REQUIRED_KEY] componentSpec.downstreamHooks.slotNamesSource is required'
    );
  });

  it('rejects an intentionally incomplete spec', () => {
    const result = validateComponentSpec(
      {
        specVersion: '1',
        componentId: 'button',
        tier: 'pilot',
        requiredStoryKinds: ['docs'],
      },
      { filenameStem: 'button' }
    );

    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_MISSING_REQUIRED_KEY] componentSpec.ownedStoryRefs is required'
    );
    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_MISSING_REQUIRED_KEY] componentSpec.generatedArtifactRefs is required'
    );
    expect(result).toContain(
      '[CT-9B_COMPONENT_SPEC_MISSING_REQUIRED_KEY] componentSpec.downstreamHooks is required'
    );
  });
});

function readThinkingIndicatorSpec() {
  return JSON.parse(fs.readFileSync(thinkingIndicatorSpecPath, 'utf8')) as ComponentSpecFixture;
}

function omitKey<T extends Record<string, unknown>, K extends keyof T>(input: T, key: K) {
  const clone = { ...input };
  Reflect.deleteProperty(clone, key);
  return clone as Omit<T, K>;
}
