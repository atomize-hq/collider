// App documentation projection of the generated recipe map. Source discovery
// belongs to the token build; docs do not maintain another eligibility index.
import { recipeMap } from '../../../design-tokens/dist/tokens';

type RecipeValue = string | { [key: string]: RecipeValue };
type RecipeValueMap = Record<string, RecipeValue>;

type RecipeContract = {
  componentId: string;
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
  variantAxes: RecipeContract['variantAxes'];
};

const REQUIRED_FIELDS = [
  'componentId',
  'variantAxes',
  'defaults',
  'slots',
  'states',
  'fallbacks',
  'recipeVersion',
] as const satisfies ReadonlyArray<keyof RecipeContract>;

export function buildRecipeDocsModel(
  artifactRecipeMap: Record<string, unknown>
): RecipeDocsModel[] {
  return Object.keys(artifactRecipeMap)
    .sort()
    .map((componentId) => buildEntry(componentId, artifactRecipeMap[componentId]));
}

export function loadRecipeDocsModel(): RecipeDocsModel[] {
  return buildRecipeDocsModel(recipeMap);
}

function buildEntry(componentId: string, artifactRecipe: unknown): RecipeDocsModel {
  if (!artifactRecipe || typeof artifactRecipe !== 'object') {
    throw new Error(
      `Missing generated recipeMap entry for component "${componentId}" in design-tokens/dist/tokens.ts.`
    );
  }

  for (const field of REQUIRED_FIELDS) {
    assertRequiredField(artifactRecipe, field, componentId);
  }

  const contract = artifactRecipe as RecipeContract;
  if (contract.componentId !== componentId) {
    throw new Error(`Generated recipeMap identity mismatch for "${componentId}".`);
  }

  return {
    componentId,
    defaults: contract.defaults,
    fallbacks: contract.fallbacks,
    recipeVersion: contract.recipeVersion,
    slots: contract.slots,
    sourceFile: `${componentId}.recipe.json`,
    states: contract.states,
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
