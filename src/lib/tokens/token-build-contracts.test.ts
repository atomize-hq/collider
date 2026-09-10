import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const stagedCssArtifactPath = path.join(repoRoot, 'design-tokens/dist/css/tokens.css');
const typedArtifactPath = path.join(repoRoot, 'design-tokens/dist/tokens.ts');
const figmaArtifactPath = path.join(repoRoot, 'design-tokens/dist/figma/tokens.json');
const runtimeCssArtifactPath = path.join(repoRoot, 'src/lib/tokens/tokens.css');

beforeAll(() => {
  execFileSync('pnpm', ['build:tokens'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
});

describe('token build contracts', () => {
  it('exports the stable typed surface and mirrors the current recipe payload', async () => {
    const generated = await import('../../../design-tokens/dist/tokens');
    const recipes = Object.fromEntries(
      fs
        .readdirSync(path.join(repoRoot, 'design-tokens/src/recipes'))
        .filter((file) => file.endsWith('.recipe.json'))
        .map((file) => [
          file.slice(0, -'.recipe.json'.length),
          JSON.parse(
            fs.readFileSync(path.join(repoRoot, 'design-tokens/src/recipes', file), 'utf8')
          ),
        ])
    );
    const typedSource = fs.readFileSync(typedArtifactPath, 'utf8');

    expect(Object.keys(generated).sort()).toEqual([
      'recipeMap',
      'themeOverrides',
      'themeRegistry',
      'tokenMap',
    ]);
    expect(typedSource).toMatch(
      /export type ThemeId = \(typeof themeRegistry\.themes\)\[number\]\[['"]id['"]\];/
    );
    expect(typedSource).toContain('export type TokenId = keyof typeof tokenMap;');
    expect(typedSource).toContain('export type RecipeComponentId = keyof typeof recipeMap;');
    expect(generated.recipeMap).toEqual(recipes);
  });

  it('carries every non-default theme in the typed module, as a diff of tokenMap', async () => {
    const generated = await import('../../../design-tokens/dist/tokens');
    const overrides = generated.themeOverrides as Record<
      string,
      Record<string, { themeId: string; type: string; value: unknown }>
    >;
    const tokenMap = generated.tokenMap as Record<string, { type: string; value: unknown }>;
    const nonDefault = generated.themeRegistry.themes
      .map((theme) => theme.id)
      .filter((id) => id !== generated.themeRegistry.defaultThemeId);

    // The typed module was flattened to the default theme long after the Figma
    // document and the runtime CSS both carried every theme, which silently made
    // each in-repo proof built on it a single-theme proof.
    expect(Object.keys(overrides).sort()).toEqual([...nonDefault].sort());

    for (const [themeId, entries] of Object.entries(overrides)) {
      for (const [tokenId, entry] of Object.entries(entries)) {
        // An override is a diff: it names a token that exists, tags the theme it
        // belongs to, keeps the base type, and never restates the base value.
        expect(tokenMap[tokenId], `${themeId} overrides unknown token ${tokenId}`).toBeDefined();
        expect(entry.themeId).toBe(themeId);
        expect(entry.type).toBe(tokenMap[tokenId].type);
        expect(entry.value).not.toEqual(tokenMap[tokenId].value);
      }
    }
  });

  it('keeps the figma export token-only and DTCG-shaped', () => {
    const figma = JSON.parse(fs.readFileSync(figmaArtifactPath, 'utf8')) as Record<string, unknown>;

    expect(Object.keys(figma)).toEqual([
      '$extensions',
      '$themeOverrides',
      'accent',
      'core',
      'elevation',
      'layout',
      'motion',
      'radius',
      'semantic',
      'shape',
      'spacing',
      'type',
    ]);
    expect(figma).not.toHaveProperty('recipeMap');
    expect(JSON.stringify(figma)).not.toContain('"componentId"');
  });

  it('withholds the consumer-less families from Figma while keeping them in runtime css', () => {
    const figma = JSON.parse(fs.readFileSync(figmaArtifactPath, 'utf8')) as Record<string, unknown>;
    const runtimeCss = fs.readFileSync(runtimeCssArtifactPath, 'utf8');

    // These families are withheld from the Figma variable publish only — they
    // have no consumers and would otherwise bury the design-system variables in
    // Figma's picker. They must stay in runtime css, because withholding them
    // there would remove public token IDs and become a CHANGE_POLICY migration
    // event. See `tokens.figma.excludedFamilies` in ds-skills.project.json.
    for (const family of ['tailwind-colors', 'tailwind-variables', 'font']) {
      expect(figma).not.toHaveProperty(family);
      expect(runtimeCss).toContain(`--${family}-`);
    }
  });

  it('carries theme overrides under a key the token walker skips', () => {
    const figma = JSON.parse(fs.readFileSync(figmaArtifactPath, 'utf8')) as Record<string, unknown>;
    const overrides = figma.$themeOverrides as Record<string, unknown>;

    // Non-default themes ride under a `$` key so the token walker skips them:
    // the document stays a single-theme artifact for every existing reader while
    // the publish plugin gets one Figma mode per theme out of the same file.
    expect(Object.keys(overrides)).toEqual(['light']);

    // The other half of that claim — that the overrides really do stay out of the
    // flattened variable set — used to be asserted here by importing the rail's
    // flattener. It is now `pnpm figma:verify`, a step of `pnpm govern:tokens`,
    // and it is a stronger check: renaming `$themeOverrides` so it leaks was
    // measured to produce four diagnostics there (leafCount 198 vs 176, a lost
    // `light` theme, 198 differing variables, 198 theme-incomplete) against this
    // test's single count equality. Collider owns the artifact; the pack owns
    // what flattening it means.
  });

  it('emits lexical ordering for css vars, token map keys, and figma json keys', async () => {
    const generated = await import('../../../design-tokens/dist/tokens');
    const css = fs.readFileSync(stagedCssArtifactPath, 'utf8');
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

  it('publishes the stable runtime css file with the generated banner and legacy aliases', () => {
    const runtimeCss = fs.readFileSync(runtimeCssArtifactPath, 'utf8');

    expect(
      runtimeCss.startsWith(
        '/* This file is generated by pnpm build:tokens. Do not edit by hand. */'
      )
    ).toBe(true);
    expect(runtimeCss).toContain('--semantic-color-background-base: #171717;');
    expect(runtimeCss).toContain('--color-background-base: var(--semantic-color-background-base);');
    expect(runtimeCss).toContain('--color-text-secondary: var(--semantic-color-text-secondary);');
    expect(runtimeCss).toContain(
      '--color-statusstrip-success: var(--semantic-color-status-strip-success);'
    );
    expect(runtimeCss).toContain(
      '--color-background-white-10: var(--semantic-color-background-white-10);'
    );
  });

  it('reports the public runtime css path in build:tokens json mode', () => {
    const result = execFileSync(
      'node',
      ['.ds-skills/project.mjs', 'tokens', 'build', '--config', 'ds-skills.project.json', '--json'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      }
    );
    const payload = JSON.parse(result) as {
      ok: boolean;
      artifacts: Array<{ id: string; path: string; status: string }>;
    };

    expect(payload.ok).toBe(true);
    expect(payload.artifacts).toContainEqual(
      expect.objectContaining({
        id: 'runtimeCss',
        path: 'src/lib/tokens/tokens.css',
        status: 'unchanged',
      })
    );
  });
});

function expectObjectKeysSorted(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }

  const keys = Object.keys(value);
  // V8 enumerates integer-index keys (e.g. '0', '1', '10') in ascending numeric order
  // before named string keys. Mirror that comparator so the assertion matches runtime behavior.
  const isIntegerIndex = (k: string) => /^\d+$/.test(k) && String(parseInt(k, 10)) === k;
  const sorted = [...keys].sort((left, right) => {
    const li = isIntegerIndex(left);
    const ri = isIntegerIndex(right);
    if (li && ri) return parseInt(left, 10) - parseInt(right, 10);
    if (li) return -1;
    if (ri) return 1;
    return left.localeCompare(right);
  });
  expect(keys).toEqual(sorted);
  for (const child of Object.values(value)) {
    expectObjectKeysSorted(child);
  }
}
