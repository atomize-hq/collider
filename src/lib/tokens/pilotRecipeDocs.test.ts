import { describe, expect, it } from 'vitest';
import recipeIndex from '../../../design-tokens/src/recipes/index.json';
import { recipeMap } from '../../../design-tokens/dist/tokens';
import { buildPilotRecipeDocsModel } from './pilotRecipeDocs';

describe('buildPilotRecipeDocsModel', () => {
  it('returns null when the source index has no pilot recipe entries', () => {
    const result = buildPilotRecipeDocsModel(recipeIndex, recipeMap);
    expect(result).toBeNull();
  });

  it('returns null for an explicitly empty recipes array', () => {
    const result = buildPilotRecipeDocsModel({ recipes: [] }, recipeMap);
    expect(result).toBeNull();
  });

  it('returns null when all recipes are deferred', () => {
    const result = buildPilotRecipeDocsModel(
      {
        recipes: [
          { componentId: 'example', sourceFile: 'example.recipe.json', status: 'deferred' },
        ],
      },
      recipeMap
    );
    expect(result).toBeNull();
  });

  it('fails when the source index has more than one pilot recipe entry', () => {
    expect(() =>
      buildPilotRecipeDocsModel(
        {
          recipes: [
            {
              componentId: 'button-primary',
              sourceFile: 'button-primary.recipe.json',
              status: 'pilot',
            },
            {
              componentId: 'button-secondary',
              sourceFile: 'button-secondary.recipe.json',
              status: 'pilot',
            },
          ],
        },
        recipeMap
      )
    ).toThrow('Expected at most one pilot recipe entry');
  });
});
