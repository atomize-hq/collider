import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildExpectedVariables,
  compareFigmaVariables,
  flattenTokenDocument,
  type ObservedCollection,
} from '@atomize-hq/figma-token-rail';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';

/**
 * The rail itself is unit-tested in @atomize-hq/figma-token-rail against its own
 * fixture. What belongs here is the part only this repo can assert: that OUR
 * published artifact, with OUR config, still produces the variable set we expect
 * to see in the Figma file.
 */
const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'figma/token-sync.config.json'), 'utf8')
) as {
  collectionName: string;
  extensionsNamespace: string;
  fallbackThemeId: string;
};

const themeOptions = {
  extensionsNamespace: config.extensionsNamespace,
  fallbackThemeId: config.fallbackThemeId,
};

function loadArtifact(): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'design-tokens/dist/figma/tokens.json'), 'utf8')
  );
}

describe('Collider token artifact through the Figma rail', () => {
  it('flattens to the expected variable set', () => {
    const leaves = flattenTokenDocument(loadArtifact());

    expect(leaves).toHaveLength(176);
    expect(leaves[0]?.name).toBe('accent/primary');
    expect(leaves.at(-1)?.name).toBe('type/weight/semibold');
  });

  it('resolves both themes from our $extensions namespace', () => {
    const expected = buildExpectedVariables(loadArtifact(), themeOptions);

    expect(expected.defaultThemeId).toBe('dark');
    expect(expected.themeIds).toEqual(['dark', 'light']);
    for (const variable of expected.variables) {
      expect(Object.keys(variable.valuesByTheme).sort()).toEqual(['dark', 'light']);
    }
  });

  it('reports no drift against a file that matches the artifact', () => {
    const expected = buildExpectedVariables(loadArtifact(), themeOptions);
    const observed: ObservedCollection = {
      name: config.collectionName,
      modeNames: [...expected.themeIds],
      variables: expected.variables.map((variable) => ({
        name: variable.name,
        resolvedType: variable.resolvedType,
        valuesByMode: { ...variable.valuesByTheme },
      })),
    };

    const report = compareFigmaVariables(expected, observed);
    expect(report.findings).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('keeps the sync config in step with the artifact it publishes', () => {
    // A namespace typo here would silently fall back to the wrong default theme.
    const artifact = loadArtifact() as { $extensions?: Record<string, unknown> };
    expect(artifact.$extensions?.[config.extensionsNamespace]).toMatchObject({ themeId: 'dark' });
  });
});
