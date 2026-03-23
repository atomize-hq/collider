import { describe, expect, it } from 'vitest';
import recipeIndex from '../../../design-tokens/src/recipes/index.json';
import { recipeMap } from '../../../design-tokens/dist/tokens';
import { buildPilotRecipeDocsModel } from './pilotRecipeDocs';

describe('buildPilotRecipeDocsModel', () => {
  it('builds a docs model for the current pilot recipe', () => {
    const model = buildPilotRecipeDocsModel(recipeIndex, recipeMap);

    expect(model.componentId).toBe('thinking-indicator');
    expect(model.sourceFile).toBe('thinking-indicator.recipe.json');
    expect(model.status).toBe('pilot');

    const generatedEntryRaw = (recipeMap as unknown as Record<string, unknown>)[model.componentId];
    expect(generatedEntryRaw).toBeDefined();

    const generatedEntry = generatedEntryRaw as {
      variantAxes: unknown;
      defaults: unknown;
      slots: unknown;
      states: unknown;
      fallbacks: unknown;
    };

    expect(model.variantAxes).toEqual(generatedEntry.variantAxes);
    expect(model.defaults).toEqual(generatedEntry.defaults);
    expect(model.slots).toEqual(generatedEntry.slots);
    expect(model.states).toEqual(generatedEntry.states);
    expect(model.fallbacks).toEqual(generatedEntry.fallbacks);
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

    const pilotRecipe = (recipeMap as unknown as Record<string, unknown>)['thinking-indicator'] as
      | undefined
      | {
          defaults: unknown;
          fallbacks: unknown;
          recipeVersion: unknown;
          slots: unknown;
          states: unknown;
        };
    expect(pilotRecipe).toBeDefined();

    expect(() =>
      buildPilotRecipeDocsModel(recipeIndex, {
        'thinking-indicator': {
          defaults: pilotRecipe!.defaults,
          fallbacks: pilotRecipe!.fallbacks,
          recipeVersion: pilotRecipe!.recipeVersion,
          slots: pilotRecipe!.slots,
          states: pilotRecipe!.states,
        },
      })
    ).toThrow('missing required field "variantAxes"');
  });
});
