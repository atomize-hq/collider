import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadBuildGraph } from '../../../scripts/lib/token-build-graph.mjs';
import { generateTypedTokenModule } from '../../../scripts/lib/token-artifacts.mjs';

const repoRoot = process.cwd();
const cssArtifactPath = path.join(repoRoot, 'design-tokens/dist/css/tokens.css');
const typedArtifactPath = path.join(repoRoot, 'design-tokens/dist/tokens.ts');
const figmaArtifactPath = path.join(repoRoot, 'design-tokens/dist/figma/tokens.json');

beforeAll(() => {
  execFileSync('pnpm', ['build:tokens'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
});

describe('generated token artifacts', () => {
  it('exports the stable typed surface and mirrors the current recipe payload', async () => {
    const generated = await import('../../../design-tokens/dist/tokens');
    const graph = loadBuildGraph();
    const typedSource = fs.readFileSync(typedArtifactPath, 'utf8');

    expect(Object.keys(generated).sort()).toEqual(['recipeMap', 'themeRegistry', 'tokenMap']);
    expect(typedSource).toContain(
      `export type ThemeId = (typeof themeRegistry.themes)[number]['id'];`
    );
    expect(typedSource).toContain('export type TokenId = keyof typeof tokenMap;');
    expect(typedSource).toContain('export type RecipeComponentId = keyof typeof recipeMap;');
    expect(generated.recipeMap.button).toEqual(graph.recipeMap.button);
  });

  it('keeps the figma export token-only and DTCG-shaped', () => {
    const figma = JSON.parse(fs.readFileSync(figmaArtifactPath, 'utf8')) as Record<string, unknown>;

    expect(Object.keys(figma)).toEqual(['$extensions', 'core', 'motion', 'semantic']);
    expect(figma).not.toHaveProperty('recipeMap');
    expect(JSON.stringify(figma)).not.toContain('"componentId"');
  });

  it('emits lexical ordering for css vars, token map keys, and figma json keys', async () => {
    const generated = await import('../../../design-tokens/dist/tokens');
    const css = fs.readFileSync(cssArtifactPath, 'utf8');
    const figma = JSON.parse(fs.readFileSync(figmaArtifactPath, 'utf8')) as Record<string, unknown>;

    const cssVariables = [...css.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((match) => match[1]);

    expect(cssVariables).toEqual(
      [...cssVariables].sort((left, right) => left.localeCompare(right))
    );
    expect(Object.keys(generated.tokenMap)).toEqual(
      [...Object.keys(generated.tokenMap)].sort((left, right) => left.localeCompare(right))
    );
    expectObjectKeysSorted(figma);
  });

  it('keeps outputs byte-stable on a second build', () => {
    const firstPass = readArtifacts();

    execFileSync('pnpm', ['build:tokens'], {
      cwd: repoRoot,
      stdio: 'pipe',
    });

    expect(readArtifacts()).toEqual(firstPass);
  });

  it('changes only the recipe section when recipe source data changes', () => {
    const graph = loadBuildGraph();
    const originalSource = generateTypedTokenModule(graph);
    const modifiedGraph = {
      ...graph,
      recipeMap: {
        ...graph.recipeMap,
        button: {
          ...graph.recipeMap.button,
          defaults: {
            ...graph.recipeMap.button.defaults,
            state: 'hover',
          },
        },
      },
    };
    const modifiedSource = generateTypedTokenModule(modifiedGraph);

    expect(extractConstSection(originalSource, 'tokenMap')).toBe(
      extractConstSection(modifiedSource, 'tokenMap')
    );
    expect(extractConstSection(originalSource, 'recipeMap')).not.toBe(
      extractConstSection(modifiedSource, 'recipeMap')
    );
  });
});

function readArtifacts() {
  return {
    css: fs.readFileSync(cssArtifactPath, 'utf8'),
    figma: fs.readFileSync(figmaArtifactPath, 'utf8'),
    typed: fs.readFileSync(typedArtifactPath, 'utf8'),
  };
}

function extractConstSection(source: string, exportName: string) {
  const start = source.indexOf(`export const ${exportName} = `);
  const end = source.indexOf(' as const;', start);
  return source.slice(start, end + ' as const;'.length);
}

function expectObjectKeysSorted(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }

  const keys = Object.keys(value);
  expect(keys).toEqual([...keys].sort((left, right) => left.localeCompare(right)));
  for (const child of Object.values(value)) {
    expectObjectKeysSorted(child);
  }
}
