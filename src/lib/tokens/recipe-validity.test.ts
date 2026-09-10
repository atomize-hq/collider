import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import badge from '../../../design-tokens/src/recipes/badge.recipe.json';
import project from '../../../ds-skills.project.json';

const repoRoot = path.resolve(__dirname, '../../..');

type Recipe = {
  recipeVersion: string;
  componentId: string;
  variantAxes: { name: string; values: string[] }[];
  defaults: { variants: Record<string, string>; state: string };
  slots: Record<string, Record<string, string>>;
  states: Record<string, Record<string, Record<string, string>>>;
  fallbacks: { missingVariantBehavior: string; stateFallbacks: Record<string, string> };
};

const workdirs: string[] = [];

afterEach(() => {
  for (const dir of workdirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function example(): Recipe {
  return { ...structuredClone(badge), componentId: 'callout' };
}

function validate(recipes: Recipe[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-validity-'));
  workdirs.push(dir);
  fs.cpSync(path.join(repoRoot, project.tokens.sourceDir), path.join(dir, 'tokens'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(dir, 'recipes'));
  for (const recipe of recipes) {
    fs.writeFileSync(
      path.join(dir, 'recipes', `${recipe.componentId}.recipe.json`),
      JSON.stringify(recipe)
    );
  }
  // Intrinsic validation uses the installed CLI and actual Collider token sources.
  // Build, readiness and publication are deliberately separate concerns.
  fs.writeFileSync(
    path.join(dir, 'project.json'),
    JSON.stringify({
      projectVersion: project.projectVersion,
      tokens: {
        format: project.tokens.format,
        sourceDir: 'tokens',
        recipesDir: 'recipes',
        extensionsNamespace: project.tokens.extensionsNamespace,
        themes: { registry: 'tokens/themes/registry.json', directory: 'tokens/themes' },
        figma: project.tokens.figma,
      },
    })
  );
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, '.ds-skills/project.mjs'),
      'tokens',
      'validate',
      '--config',
      path.join(dir, 'project.json'),
      '--root',
      dir,
      '--json',
    ],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  expect(result.error).toBeUndefined();
  expect([0, 1], result.stderr).toContain(result.status);
  const report = JSON.parse(result.stdout);
  expect(report.command).toBe('tokens validate');
  expect(report.ok).toBe(result.status === 0);
  return { ok: report.ok, diagnostics: report.diagnostics };
}

describe('recipe validity through the token gate', () => {
  it('accepts the live badge and a new component without separate enrollment', () => {
    expect(validate([badge, example()])).toEqual({ ok: true, diagnostics: [] });
  });

  it('allows a recipe to define different axes, slots, defaults and states', () => {
    const recipe = example();
    recipe.variantAxes = [{ name: 'intent', values: ['informational', 'urgent'] }];
    recipe.defaults = { variants: { intent: 'urgent' }, state: 'idle' };
    recipe.slots = { body: { text: '{semantic.color.text.primary}' } };
    recipe.states = {
      idle: { body: { text: '{semantic.color.text.primary}' } },
      muted: { body: { text: '{semantic.color.text.secondary}' } },
    };
    recipe.fallbacks.stateFallbacks = { muted: 'idle' };
    expect(validate([recipe])).toEqual({ ok: true, diagnostics: [] });
  });

  it('allows a valid component to evolve without updating a mirrored declaration', () => {
    const recipe = structuredClone(badge);
    recipe.variantAxes[0].values.push('informational');
    recipe.defaults.variants.variant = 'informational';
    expect(validate([recipe])).toEqual({ ok: true, diagnostics: [] });
  });

  it('allows a token project with no recipes', () => {
    expect(validate([])).toEqual({ ok: true, diagnostics: [] });
  });

  const invalidCases: [string, (recipe: Recipe) => void, RegExp][] = [
    [
      'duplicate axis names',
      (r) => r.variantAxes.push(structuredClone(r.variantAxes[0])),
      /duplicate axis/,
    ],
    [
      'duplicate axis values',
      (r) => r.variantAxes[0].values.push('default'),
      /axis values must be unique/,
    ],
    [
      'undeclared default axis',
      (r) => {
        r.defaults.variants.size = 'small';
      },
      /unknown default variant axis/,
    ],
    [
      'missing default axis',
      (r) => {
        r.variantAxes.push({ name: 'size', values: ['small'] });
      },
      /missing default for axis/,
    ],
    [
      'undeclared default value',
      (r) => {
        r.defaults.variants.variant = 'absent';
      },
      /unknown default value/,
    ],
    [
      'undeclared default state',
      (r) => {
        r.defaults.state = 'absent';
      },
      /unknown default state/,
    ],
    [
      'undeclared override slot',
      (r) => {
        r.states.hover.absent = { text: '{semantic.color.text.primary}' };
      },
      /unknown slot/,
    ],
    [
      'undeclared fallback source',
      (r) => {
        r.fallbacks.stateFallbacks.absent = 'rest';
      },
      /unknown fallback state/,
    ],
    [
      'undeclared fallback target',
      (r) => {
        r.fallbacks.stateFallbacks.hover = 'absent';
      },
      /unknown fallback target/,
    ],
    [
      'cyclic state fallbacks',
      (r) => {
        r.fallbacks.stateFallbacks.rest = 'hover';
      },
      /fallback cycle/,
    ],
    [
      'extra defaults property',
      (r) => Object.assign(r.defaults, { unexpected: 'value' }),
      /unknown defaults property/,
    ],
    [
      'extra fallbacks property',
      (r) => Object.assign(r.fallbacks, { unexpected: 'value' }),
      /unknown fallbacks property/,
    ],
    [
      'inline token values',
      (r) => {
        r.slots.root.background = '#000000';
      },
      /inline scalar values are not allowed/,
    ],
  ];

  it.each(invalidCases)('rejects %s at the intended rule', (_name, mutate, message) => {
    const recipe = example();
    mutate(recipe);
    const result = validate([recipe]);
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'TOKEN_RECIPE',
        message: expect.stringMatching(message),
      }),
    ]);
  });

  it.each(['slot', 'state'])('rejects a missing %s token at reference validation', (where) => {
    const recipe = example();
    if (where === 'slot') recipe.slots.root.background = '{semantic.color.absent}';
    else recipe.states.hover.root.background = '{semantic.color.absent}';
    const result = validate([recipe]);
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'TOKEN_RECIPE',
        message: expect.stringContaining('[token-inventory] unknown token reference'),
      }),
    ]);
  });
});
