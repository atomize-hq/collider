import { describe, expect, it } from 'vitest';
import recipeIndex from '../../../design-tokens/src/recipes/index.json';
import { recipeMap } from '../../../design-tokens/dist/tokens';
import { buildRecipeDocsModel } from './recipeDocs';

const artifactRecipe = {
  defaults: { state: 'rest', variants: {} },
  fallbacks: { missingVariantBehavior: 'error', stateFallbacks: {} },
  recipeVersion: '1',
  slots: {},
  states: {},
  variantAxes: [],
};

describe('buildRecipeDocsModel', () => {
  it('returns an empty list for the live recipe index, which carries no recipes', () => {
    expect(buildRecipeDocsModel(recipeIndex, recipeMap)).toEqual([]);
  });

  it('returns an empty list for an explicitly empty recipes array', () => {
    expect(buildRecipeDocsModel({ recipes: [] }, recipeMap)).toEqual([]);
  });

  it('excludes deferred entries', () => {
    const result = buildRecipeDocsModel(
      {
        recipes: [
          { componentId: 'example', sourceFile: 'example.recipe.json', status: 'deferred' },
        ],
      },
      recipeMap
    );
    expect(result).toEqual([]);
  });

  it('returns every discoverable entry rather than capping at one', () => {
    const result = buildRecipeDocsModel(
      {
        recipes: [
          {
            componentId: 'button-primary',
            sourceFile: 'button-primary.recipe.json',
            status: 'active',
          },
          {
            componentId: 'button-secondary',
            sourceFile: 'button-secondary.recipe.json',
            status: 'active',
          },
        ],
      },
      { 'button-primary': artifactRecipe, 'button-secondary': artifactRecipe }
    );

    expect(result.map((entry) => entry.componentId)).toEqual([
      'button-primary',
      'button-secondary',
    ]);
    expect(result[0]?.sourceFile).toBe('button-primary.recipe.json');
    expect(result[0]?.status).toBe('active');
  });

  it('throws when the generated recipeMap has no entry for a discoverable component', () => {
    expect(() =>
      buildRecipeDocsModel(
        {
          recipes: [{ componentId: 'absent', sourceFile: 'absent.recipe.json', status: 'active' }],
        },
        {}
      )
    ).toThrow('Missing generated recipeMap entry for component "absent"');
  });

  it('throws when a generated recipeMap entry is missing a required field', () => {
    const { slots: _slots, ...withoutSlots } = artifactRecipe;
    expect(() =>
      buildRecipeDocsModel(
        {
          recipes: [
            { componentId: 'partial', sourceFile: 'partial.recipe.json', status: 'active' },
          ],
        },
        { partial: withoutSlots }
      )
    ).toThrow('missing required field "slots"');
  });
});
