import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { recipeMap } from '../../../design-tokens/dist/tokens';
import { buildRecipeDocsModel, loadRecipeDocsModel } from './recipeDocs';

const artifactRecipe = {
  componentId: 'notice',
  defaults: { state: 'rest', variants: { intent: 'normal' } },
  fallbacks: { missingVariantBehavior: 'use-defaults', stateFallbacks: {} },
  recipeVersion: '1',
  slots: { body: { color: '{semantic.color.text.primary}' } },
  states: { rest: { body: { color: '{semantic.color.text.primary}' } } },
  variantAxes: [{ name: 'intent', values: ['normal'] }],
};

describe('artifact-backed recipe docs', () => {
  it('uses precisely the generated recipe set and matches current regular source files', () => {
    const sourceIds = fs
      .readdirSync(path.resolve('design-tokens/src/recipes'), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.recipe.json'))
      .map((entry) => entry.name.slice(0, -'.recipe.json'.length))
      .sort();
    const result = loadRecipeDocsModel();
    expect(result.map((entry) => entry.componentId)).toEqual(Object.keys(recipeMap).sort());
    expect(result.map((entry) => entry.componentId)).toEqual(sourceIds);
    for (const entry of result) {
      expect(entry.variantAxes.length).toBeGreaterThan(0);
      expect(Object.keys(entry.slots).length).toBeGreaterThan(0);
      expect(entry).not.toHaveProperty('status');
    }
  });
  it('returns empty docs for an empty generated map', () => {
    expect(buildRecipeDocsModel({})).toEqual([]);
  });
  it('shows any generated component without a second registry or status', () => {
    const result = buildRecipeDocsModel({
      zebra: { ...artifactRecipe, componentId: 'zebra' },
      notice: artifactRecipe,
    });
    expect(result.map((entry) => entry.componentId)).toEqual(['notice', 'zebra']);
    expect(result[0]?.sourceFile).toBe('notice.recipe.json');
    expect(result.every((entry) => !('status' in entry))).toBe(true);
  });
  it('uses evolved contract fields from the generated recipe rather than pinning shape', () => {
    const evolved = {
      ...artifactRecipe,
      variantAxes: [{ name: 'density', values: ['compact'] }],
      defaults: { state: 'rest', variants: { density: 'compact' } },
    };
    expect(buildRecipeDocsModel({ notice: evolved })[0]?.variantAxes).toEqual(evolved.variantAxes);
  });
  it('rejects missing artifact payloads instead of inventing docs', () => {
    expect(() => buildRecipeDocsModel({ absent: null })).toThrow(
      'Missing generated recipeMap entry'
    );
  });
  it('rejects a generated entry missing a field needed by the surface', () => {
    const withoutSlots: Partial<typeof artifactRecipe> = { ...artifactRecipe };
    delete withoutSlots.slots;
    expect(() => buildRecipeDocsModel({ notice: withoutSlots })).toThrow(
      'missing required field "slots"'
    );
  });
  it('rejects artifact key and payload identity disagreement', () => {
    expect(() => buildRecipeDocsModel({ other: artifactRecipe })).toThrow('identity mismatch');
  });
});
