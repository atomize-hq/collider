// Docs model for the component recipes discovered through
// `design-tokens/src/recipes/index.json`.
//
// The index is metadata-only: it names a componentId, its source file, and a discovery
// status. The token payload lives in the generated `recipeMap` inside
// `design-tokens/dist/tokens.ts`. This module joins the two and asserts the artifact
// actually carries the fields a docs surface needs.
//
// `deferred` entries are excluded — they are recorded but not published. Every other
// discoverable entry is returned, however many there are.

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

export type RecipeDocsModel = {
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

const REQUIRED_FIELDS = [
  'variantAxes',
  'defaults',
  'slots',
  'states',
  'fallbacks',
  'recipeVersion',
] as const satisfies ReadonlyArray<keyof RecipeContract>;

export function buildRecipeDocsModel(
  sourceRecipeIndex: RecipeIndexContract,
  artifactRecipeMap: Record<string, unknown>
): RecipeDocsModel[] {
  return sourceRecipeIndex.recipes
    .filter((entry) => entry.status !== 'deferred')
    .map((entry) => buildEntry(entry, artifactRecipeMap));
}

export function loadRecipeDocsModel(): RecipeDocsModel[] {
  return buildRecipeDocsModel(recipeIndex, recipeMap);
}

function buildEntry(
  entry: RecipeIndexEntry,
  artifactRecipeMap: Record<string, unknown>
): RecipeDocsModel {
  const artifactRecipe = artifactRecipeMap[entry.componentId];
  if (!artifactRecipe || typeof artifactRecipe !== 'object') {
    throw new Error(
      `Missing generated recipeMap entry for component "${entry.componentId}" in design-tokens/dist/tokens.ts.`
    );
  }

  for (const field of REQUIRED_FIELDS) {
    assertRequiredField(artifactRecipe, field, entry.componentId);
  }

  const contract = artifactRecipe as RecipeContract;

  return {
    componentId: entry.componentId,
    defaults: contract.defaults,
    fallbacks: contract.fallbacks,
    recipeVersion: contract.recipeVersion,
    slots: contract.slots,
    sourceFile: entry.sourceFile,
    states: contract.states,
    status: entry.status,
    variantAxes: contract.variantAxes,
  };
}

function assertRequiredField(
  artifactRecipe: object,
  field: keyof RecipeContract,
  componentId: string
) {
  if (!(field in artifactRecipe)) {
    throw new Error(
      `Generated recipeMap entry "${componentId}" is missing required field "${field}" for the recipe docs surface.`
    );
  }
}
