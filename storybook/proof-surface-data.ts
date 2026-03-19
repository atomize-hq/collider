import {
  recipeMap,
  themeRegistry,
  tokenMap,
  type RecipeComponentId,
  type TokenId,
} from '../design-tokens/dist/tokens';

type TokenRecord = (typeof tokenMap)[TokenId];

export type ThemeDocsEntry = {
  extendsThemeId: string | null;
  file: string;
  id: string;
  label: string;
  required: boolean;
};

export type TokenDocsEntry = {
  cssVariable: string;
  id: TokenId;
  themeId: string;
  type: string;
  value: string;
};

export type TokenDocsGroup = {
  id: string;
  label: string;
  tokens: TokenDocsEntry[];
};

export type TokenDocsModel = {
  defaultThemeId: string;
  groups: TokenDocsGroup[];
  themes: ThemeDocsEntry[];
  totalTokens: number;
};

export type RecipeBinding = {
  cssVariable: string;
  property: string;
  tokenId: TokenId;
  value: string;
};

export type RecipeSlotModel = {
  bindings: RecipeBinding[];
  name: string;
};

export type RecipeStateModel = {
  name: string;
  slots: RecipeSlotModel[];
};

export type RecipeDocsModel = {
  componentId: string;
  defaults: {
    state: string;
    variants: Array<{ axis: string; value: string }>;
  };
  fallbacks: {
    missingVariantBehavior: string;
    stateFallbacks: Array<{ fallbackState: string; state: string }>;
  };
  recipeVersion: string;
  slots: RecipeSlotModel[];
  states: RecipeStateModel[];
  variantAxes: Array<{ name: string; values: string[] }>;
};

export function getTokenDocsModel(): TokenDocsModel {
  const tokenEntries = getTokenEntries();
  const themeIds = new Set(themeRegistry.themes.map((theme) => theme.id));

  invariant(
    themeRegistry.themes.length > 0,
    'themeRegistry.themes must contain at least one theme'
  );
  invariant(
    themeIds.has(themeRegistry.defaultThemeId),
    `themeRegistry.defaultThemeId references missing theme "${themeRegistry.defaultThemeId}"`
  );

  const groups = new Map<string, TokenDocsEntry[]>();
  for (const [tokenId, token] of tokenEntries) {
    invariant(
      themeIds.has(token.themeId),
      `tokenMap.${tokenId} references missing theme "${token.themeId}"`
    );
    invariant(token.value.length > 0, `tokenMap.${tokenId} is missing a value`);

    const groupId = tokenId.split('.').slice(0, 2).join('.');
    const groupTokens = groups.get(groupId) ?? [];
    groupTokens.push({
      cssVariable: toCssVariableName(tokenId),
      id: tokenId,
      themeId: token.themeId,
      type: token.type,
      value: token.value,
    });
    groups.set(groupId, groupTokens);
  }

  return {
    defaultThemeId: themeRegistry.defaultThemeId,
    groups: [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([groupId, tokens]) => ({
        id: groupId,
        label: toLabel(groupId, ' / '),
        tokens: tokens.sort((left, right) => left.id.localeCompare(right.id)),
      })),
    themes: themeRegistry.themes.map((theme) => ({
      extendsThemeId: theme.extends,
      file: theme.file,
      id: theme.id,
      label: toLabel(theme.id),
      required: theme.required,
    })),
    totalTokens: tokenEntries.length,
  };
}

export function getPilotRecipeDocsModel(
  componentId: RecipeComponentId = 'button'
): RecipeDocsModel {
  const recipe = recipeMap[componentId];
  invariant(recipe, `recipeMap is missing the "${componentId}" entry`);
  invariant(
    recipe.componentId === componentId,
    `recipeMap.${componentId}.componentId must match "${componentId}"`
  );
  invariant(recipe.recipeVersion.length > 0, `recipeMap.${componentId}.recipeVersion is required`);
  invariant(
    recipe.variantAxes.length > 0,
    `recipeMap.${componentId}.variantAxes must contain at least one axis`
  );

  return {
    componentId: recipe.componentId,
    defaults: {
      state: recipe.defaults.state,
      variants: Object.entries(recipe.defaults.variants)
        .map(([axis, value]) => ({ axis, value }))
        .sort((left, right) => left.axis.localeCompare(right.axis)),
    },
    fallbacks: {
      missingVariantBehavior: recipe.fallbacks.missingVariantBehavior,
      stateFallbacks: Object.entries(recipe.fallbacks.stateFallbacks)
        .map(([state, fallbackState]) => ({ fallbackState, state }))
        .sort((left, right) => left.state.localeCompare(right.state)),
    },
    recipeVersion: recipe.recipeVersion,
    slots: toSlotModels(recipe.slots, `recipeMap.${componentId}.slots`),
    states: Object.entries(recipe.states)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([stateName, stateSlots]) => ({
        name: stateName,
        slots: toSlotModels(stateSlots, `recipeMap.${componentId}.states.${stateName}`),
      })),
    variantAxes: recipe.variantAxes.map((axis) => ({
      name: axis.name,
      values: [...axis.values],
    })),
  };
}

function getTokenEntries() {
  const entries = Object.entries(tokenMap) as Array<[TokenId, TokenRecord]>;
  invariant(entries.length > 0, 'tokenMap must contain at least one generated token');
  return entries.sort(([left], [right]) => left.localeCompare(right));
}

function toSlotModels(input: unknown, context: string): RecipeSlotModel[] {
  invariant(isRecord(input), `${context} must be an object`);

  return Object.entries(input)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([slotName, slotBindings]) => ({
      bindings: toRecipeBindings(slotBindings, `${context}.${slotName}`),
      name: slotName,
    }));
}

function toRecipeBindings(input: unknown, context: string): RecipeBinding[] {
  invariant(isRecord(input), `${context} must be an object`);

  return Object.entries(input)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([property, rawReference]) => {
      invariant(
        typeof rawReference === 'string',
        `${context}.${property} must be a {token.id} reference string`
      );

      const tokenId = parseTokenReference(rawReference, `${context}.${property}`);
      const token = tokenMap[tokenId];
      invariant(token, `${context}.${property} references missing token "${tokenId}"`);

      return {
        cssVariable: toCssVariableName(tokenId),
        property,
        tokenId,
        value: token.value,
      };
    });
}

function parseTokenReference(rawReference: string, context: string): TokenId {
  const match = rawReference.trim().match(/^\{(.+)\}$/);
  invariant(match?.[1], `${context} must use a {token.id} reference`);

  const tokenId = match[1] as TokenId;
  invariant(tokenId in tokenMap, `${context} references unknown token "${tokenId}"`);
  return tokenId;
}

function toCssVariableName(tokenId: string) {
  return `--${tokenId.replace(/\./g, '-')}`;
}

function toLabel(value: string, separator = ' ') {
  return value
    .split(/[.-]/g)
    .filter(Boolean)
    .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
    .join(separator);
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Storybook proof surface invariant failed: ${message}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
