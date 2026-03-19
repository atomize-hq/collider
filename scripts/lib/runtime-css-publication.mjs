import {
  generatedFileBanner as defaultGeneratedFileBanner,
  runtimeAliasMapPath as defaultRuntimeAliasMapPath,
  runtimeInventoryPath as defaultRuntimeInventoryPath,
} from '../../design-tokens/build/paths.mjs';
import { readJson } from './component-recipe-validator-shared.mjs';

const categoryLabels = new Map([
  ['background', 'Background'],
  ['text', 'Text'],
  ['status-strip', 'StatusStrip'],
]);
const supportedActions = new Set(['preserve', 'alias', 'rename-with-migration']);

export function buildPublishedRuntimeCss(options) {
  const {
    stagedCss,
    themeId,
    generatedFileBanner = defaultGeneratedFileBanner,
    runtimeAliasMapPath = defaultRuntimeAliasMapPath,
    runtimeInventoryPath = defaultRuntimeInventoryPath,
  } = options;

  const inventory = readJson(runtimeInventoryPath, true);
  const aliasMap = readJson(runtimeAliasMapPath, true);
  const stagedVariables = extractCssCustomProperties(stagedCss);
  const compatibilityLines = renderCompatibilityAliases(
    inventory,
    aliasMap,
    themeId,
    stagedVariables
  );
  const rootBody = extractCssRootBody(stagedCss);

  return [
    generatedFileBanner,
    '',
    ':root {',
    rootBody,
    '',
    '  /* Legacy runtime compatibility surface */',
    ...compatibilityLines,
    '}',
    '',
  ].join('\n');
}

export function extractCssCustomProperties(cssSource) {
  const variables = new Set();

  for (const match of cssSource.matchAll(/^\s*(--[a-z0-9-]+):\s*.+;$/gm)) {
    variables.add(match[1]);
  }

  return variables;
}

function extractCssRootBody(cssSource) {
  const match = cssSource.match(/^:root\s*\{\n([\s\S]*?)\n\}\n?$/);
  if (!match) {
    throw new Error('token build setup: staged runtime css must be a single :root block');
  }

  return match[1];
}

function renderCompatibilityAliases(inventory, aliasMap, themeId, stagedVariables) {
  const inventoryEntries = inventory?.entries;
  const aliasEntries = aliasMap?.entries;
  if (!Array.isArray(inventoryEntries) || !Array.isArray(aliasEntries)) {
    throw new Error(
      'token build setup: runtime compatibility artifacts must expose an entries array'
    );
  }

  const aliasByLegacyVar = new Map(aliasEntries.map((entry) => [entry.legacyVar, entry]));
  if (
    aliasByLegacyVar.size !== inventoryEntries.length ||
    aliasEntries.length !== inventoryEntries.length
  ) {
    throw new Error(
      'token build setup: runtime compatibility artifacts must keep inventory and alias-map entries aligned'
    );
  }

  const rendered = [];
  let previousCategory = null;

  for (const entry of inventoryEntries) {
    const aliasEntry = aliasByLegacyVar.get(entry.legacyVar);
    if (!aliasEntry) {
      throw new Error(`token build setup: missing alias-map entry for "${entry.legacyVar}"`);
    }
    if (aliasEntry.themeId !== themeId) {
      throw new Error(
        `token build setup: alias-map entry "${entry.legacyVar}" targets theme "${aliasEntry.themeId}", expected "${themeId}"`
      );
    }
    if (!supportedActions.has(aliasEntry.action)) {
      throw new Error(
        `token build setup: alias-map entry "${entry.legacyVar}" has unsupported action "${aliasEntry.action}"`
      );
    }

    const canonicalVar = toCssCustomProperty(aliasEntry.canonicalTokenId);
    if (!stagedVariables.has(canonicalVar)) {
      throw new Error(
        `token build setup: staged runtime css does not expose canonical variable "${canonicalVar}"`
      );
    }

    const currentCategory = entry.normalizedCategory;
    if (currentCategory !== previousCategory) {
      rendered.push('');
      rendered.push(`  /* ${formatCategoryLabel(currentCategory)} */`);
      previousCategory = currentCategory;
    }

    rendered.push(`  ${entry.legacyVar}: var(${canonicalVar});`);
  }

  return rendered;
}

function toCssCustomProperty(tokenId) {
  return `--${tokenId.replaceAll('.', '-')}`;
}

function formatCategoryLabel(category) {
  return categoryLabels.get(category) ?? category;
}
