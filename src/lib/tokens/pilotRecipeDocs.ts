import recipeIndex from '../../../design-tokens/src/recipes/index.json';
import { recipeMap } from '../../../design-tokens/dist/tokens';

type RecipeIndexEntry = {
  componentId: string;
  sourceFile: string;
  status: string;
};

type RecipeIndexContract = {
  recipes: ReadonlyArray<RecipeIndexEntry>;
};

type RecipeValueMap = Record<string, string>;

type RecipeContract = {
  defaults: {
    state: string;
    variants: Record<string, string>;
  };
  fallbacks: {
    missingVariantBehavior: string;
    stateFallbacks: Record<string, string>;
  };
  recipeVersion: string;
  slots: Record<string, RecipeValueMap>;
  states: Record<string, Record<string, RecipeValueMap>>;
  variantAxes: ReadonlyArray<{
    name: string;
    values: ReadonlyArray<string>;
  }>;
};

export type PilotRecipeDocsModel = {
  componentId: string;
  defaults: RecipeContract['defaults'];
  fallbacks: RecipeContract['fallbacks'];
  recipeVersion: string;
  slots: RecipeContract['slots'];
  sourceFile: string;
  states: RecipeContract['states'];
  status: string;
  variantAxes: RecipeContract['variantAxes'];
};

export function buildPilotRecipeDocsModel(
  sourceRecipeIndex: RecipeIndexContract,
  artifactRecipeMap: Record<string, unknown>
): PilotRecipeDocsModel {
  const pilotRecipes = sourceRecipeIndex.recipes.filter((entry) => entry.status === 'pilot');
  if (pilotRecipes.length !== 1) {
    throw new Error(
      `Expected exactly one pilot recipe entry in design-tokens/src/recipes/index.json, found ${pilotRecipes.length}.`
    );
  }

  const [pilotRecipe] = pilotRecipes;
  if (!pilotRecipe) {
    throw new Error('Expected a pilot recipe entry but none was available.');
  }

  const artifactRecipe = artifactRecipeMap[pilotRecipe.componentId];
  if (!artifactRecipe || typeof artifactRecipe !== 'object') {
    throw new Error(
      `Missing generated recipeMap entry for pilot component "${pilotRecipe.componentId}" in design-tokens/dist/tokens.ts.`
    );
  }

  assertRequiredField(artifactRecipe, 'variantAxes', pilotRecipe.componentId);
  assertRequiredField(artifactRecipe, 'defaults', pilotRecipe.componentId);
  assertRequiredField(artifactRecipe, 'slots', pilotRecipe.componentId);
  assertRequiredField(artifactRecipe, 'states', pilotRecipe.componentId);
  assertRequiredField(artifactRecipe, 'fallbacks', pilotRecipe.componentId);
  assertRequiredField(artifactRecipe, 'recipeVersion', pilotRecipe.componentId);

  const contract = artifactRecipe as RecipeContract;

  return {
    componentId: pilotRecipe.componentId,
    defaults: contract.defaults,
    fallbacks: contract.fallbacks,
    recipeVersion: contract.recipeVersion,
    slots: contract.slots,
    sourceFile: pilotRecipe.sourceFile,
    states: contract.states,
    status: pilotRecipe.status,
    variantAxes: contract.variantAxes,
  };
}

export function loadPilotRecipeDocsModel() {
  return buildPilotRecipeDocsModel(recipeIndex, recipeMap);
}

function assertRequiredField(
  artifactRecipe: object,
  field: keyof RecipeContract,
  componentId: string
) {
  if (!(field in artifactRecipe)) {
    throw new Error(
      `Generated recipeMap entry "${componentId}" is missing required field "${field}" for the pilot recipe docs surface.`
    );
  }
}
