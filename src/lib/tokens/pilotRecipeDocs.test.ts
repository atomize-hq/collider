import { describe, expect, it } from 'vitest';
import recipeIndex from '../../../design-tokens/src/recipes/index.json';
import { recipeMap } from '../../../design-tokens/dist/tokens';
import { buildPilotRecipeDocsModel } from './pilotRecipeDocs';

describe('buildPilotRecipeDocsModel', () => {
  it('builds a docs model for the current pilot recipe', () => {
    const model = buildPilotRecipeDocsModel(recipeIndex, recipeMap);

    expect(model.componentId).toBe('button');
    expect(model.sourceFile).toBe('button.recipe.json');
    expect(model.status).toBe('pilot');
    expect(model.variantAxes).toEqual(recipeMap.button.variantAxes);
    expect(model.defaults).toEqual(recipeMap.button.defaults);
    expect(model.slots).toEqual(recipeMap.button.slots);
    expect(model.states).toEqual(recipeMap.button.states);
    expect(model.fallbacks).toEqual(recipeMap.button.fallbacks);
  });

  it('fails when the source index has no pilot recipe entry', () => {
    expect(() =>
      buildPilotRecipeDocsModel(
        {
          recipes: recipeIndex.recipes.map((entry) => ({ ...entry, status: 'deferred' })),
        },
        recipeMap
      )
    ).toThrow('Expected exactly one pilot recipe entry');
  });

  it('fails when the source index has more than one pilot recipe entry', () => {
    expect(() =>
      buildPilotRecipeDocsModel(
        {
          recipes: [
            ...recipeIndex.recipes,
            {
              componentId: 'button-secondary',
              sourceFile: 'button-secondary.recipe.json',
              status: 'pilot',
            },
          ],
        },
        recipeMap
      )
    ).toThrow('Expected exactly one pilot recipe entry');
  });

  it('fails when the generated recipe entry is missing or incomplete', () => {
    expect(() => buildPilotRecipeDocsModel(recipeIndex, {})).toThrow(
      'Missing generated recipeMap entry'
    );

    expect(() =>
      buildPilotRecipeDocsModel(recipeIndex, {
        button: {
          defaults: recipeMap.button.defaults,
          fallbacks: recipeMap.button.fallbacks,
          recipeVersion: recipeMap.button.recipeVersion,
          slots: recipeMap.button.slots,
          states: recipeMap.button.states,
        },
      })
    ).toThrow('missing required field "variantAxes"');
  });
});
