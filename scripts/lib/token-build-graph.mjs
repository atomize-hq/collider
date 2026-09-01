import path from 'node:path';
import {
  recipeFilesGlob,
  themeRegistryPath,
  tokenFilesGlob,
} from '../../design-tokens/build/paths.mjs';
import { isObject, readJson, resolveFiles } from './component-recipe-validator-shared.mjs';

const referencePattern = /^\{([^}]+)\}$/;

// Families excluded from the Figma variable publish only. These stay fully
// present in the token source, in `tokens.css`, and in the typed token module —
// nothing here removes a public token ID, so this is not a CHANGE_POLICY
// removal event. It exists because these families have zero consumers and
// together account for the bulk of the emitted variables, which would bury the
// variables that are actually part of the design system in Figma's picker.
//   - tailwind-colors / tailwind-variables: raw palette pass-through.
//   - font: a single legacy `font/font-family` token superseded by the
//     `type/font/{sans,mono}` pair, which is what fonts.css actually reads.
//     Publishing both would show two competing Poppins entries in the picker.
// To restore any of them to Figma, delete its entry here and republish.
const figmaExcludedFamilies = new Set(['tailwind-colors', 'tailwind-variables', 'font']);

export function loadBuildGraph(options = {}) {
  const themeRegistry = readJson(options.themeRegistryPath ?? themeRegistryPath, true);
  const themeId = options.themeId ?? themeRegistry.defaultThemeId;
  const sourceTree = loadCanonicalSourceTree(options);
  const themeChain = resolveThemeChain(themeRegistry, themeId);
  const themedTree = applyThemeChain(sourceTree, themeChain, options);
  const materializedTokens = materializeTokenTree(themedTree);
  const tokenMap = flattenTokenMap(materializedTokens, themeId);
  const recipeMap = loadRecipeMap(options.recipeGlob ?? recipeFilesGlob);

  return {
    themeId,
    themeChain,
    themeRegistry: sortDeep(themeRegistry),
    materializedTokens,
    tokenMap,
    recipeMap,
  };
}

export function createFigmaTokenDocument(graph, themeVariants = []) {
  const publishedFamilies = Object.fromEntries(
    Object.entries(graph.materializedTokens).filter(
      ([family]) => !figmaExcludedFamilies.has(family)
    )
  );

  // Non-default themes ride along as DTCG-shaped partial trees under a
  // `$`-prefixed key, which the token walker skips. The document therefore stays
  // a valid single-theme artifact for every existing reader, while giving the
  // publish plugin what it needs to write one Figma mode per theme.
  const themeOverrides = {};
  for (const variant of themeVariants) {
    const overrides = diffTokenTrees(publishedFamilies, variant.tokens);
    if (Object.keys(overrides).length > 0) {
      themeOverrides[variant.themeId] = overrides;
    }
  }

  return sortDeep({
    $extensions: {
      'com.atomizehq.collider': {
        source: 'repo',
        themeId: graph.themeId,
      },
    },
    ...(Object.keys(themeOverrides).length > 0 ? { $themeOverrides: themeOverrides } : {}),
    ...publishedFamilies,
  });
}

/**
 * Returns the subtree of `candidate` whose leaf values differ from `base`, keeping
 * the DTCG leaf shape so the result flattens through the same mapping the base
 * document uses. Families absent from `base` — the ones withheld from the Figma
 * publish — are skipped rather than reintroduced by a theme.
 */
function diffTokenTrees(base, candidate) {
  const result = {};

  for (const [key, candidateNode] of Object.entries(candidate)) {
    const baseNode = isObject(base) ? base[key] : undefined;
    if (baseNode === undefined) continue;

    if (isObject(candidateNode) && '$value' in candidateNode) {
      if (JSON.stringify(baseNode.$value) !== JSON.stringify(candidateNode.$value)) {
        result[key] = candidateNode;
      }
      continue;
    }

    if (isObject(candidateNode)) {
      const nested = diffTokenTrees(baseNode, candidateNode);
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    }
  }

  return result;
}

export function sortDeep(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => sortDeep(entry));
  }

  if (!isObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortDeep(entry)])
  );
}

function loadCanonicalSourceTree(options) {
  const tree = {};
  const tokenFiles = resolveTokenFiles(options.tokenGlob ?? tokenFilesGlob);

  for (const filePath of tokenFiles) {
    const family = inferFamily(filePath);
    if (!family) continue;
    tree[family] = readJson(filePath, true);
  }

  if (Object.keys(tree).length === 0) {
    throw new Error('token build setup: no token family files found in token source directory');
  }

  return tree;
}

function resolveTokenFiles(pattern) {
  const nestedFiles = resolveFiles(pattern);
  const rootPattern = pattern.replace('/**/*.tokens.json', '/*.tokens.json');
  const rootFiles = rootPattern === pattern ? [] : resolveFiles(rootPattern);
  return [...new Set([...nestedFiles, ...rootFiles])].sort((left, right) =>
    left.localeCompare(right)
  );
}

function inferFamily(filePath) {
  // Theme override files live in the themes/ subdirectory and are loaded separately.
  if (filePath.includes('/themes/')) return null;
  const base = path.basename(filePath);
  const match = /^([a-z][a-z0-9-]*)\.tokens\.json$/.exec(base);
  return match ? match[1] : null;
}

function resolveThemeChain(themeRegistry, requestedThemeId) {
  if (!isObject(themeRegistry) || !Array.isArray(themeRegistry.themes)) {
    throw new Error('token build setup: theme registry must expose a themes array');
  }

  const themes = new Map(themeRegistry.themes.map((theme) => [theme.id, theme]));
  if (!themes.has(requestedThemeId)) {
    throw new Error(`token build setup: unknown theme id "${requestedThemeId}"`);
  }

  const chain = [];
  let current = themes.get(requestedThemeId);
  while (current) {
    chain.unshift(current);
    current = current.extends ? themes.get(current.extends) : null;
  }
  return chain;
}

function applyThemeChain(sourceTree, themeChain, options) {
  const families = Object.keys(sourceTree);
  const themedTree = Object.fromEntries(families.map((f) => [f, cloneValue(sourceTree[f])]));

  const themesRoot = options.themesRoot ?? path.dirname(themeRegistryPath);
  for (const theme of themeChain) {
    const themeFilePath = path.join(themesRoot, theme.file);
    const themeDoc = readJson(themeFilePath, true);
    for (const family of families) {
      if (family in themeDoc) {
        themedTree[family] = deepMerge(themedTree[family], themeDoc[family]);
      }
    }
  }

  return themedTree;
}

function materializeTokenTree(tokenTree) {
  const cache = new Map();
  const currentPath = [];

  return sortDeep(
    walkMaterializedTree(
      tokenTree,
      (tokenId, leaf) => ({
        $type: leaf.$type,
        $value: resolveTokenValue(tokenId, tokenTree, cache),
      }),
      currentPath
    )
  );
}

function walkMaterializedTree(node, visitLeaf, trail) {
  if (!isObject(node)) {
    return node;
  }

  if ('$value' in node && '$type' in node) {
    return visitLeaf(trail.join('.'), node);
  }

  const next = {};
  for (const [key, value] of Object.entries(node)) {
    next[key] = key.startsWith('$')
      ? cloneValue(value)
      : walkMaterializedTree(value, visitLeaf, [...trail, key]);
  }
  return next;
}

function resolveTokenValue(tokenId, tokenTree, cache, stack = []) {
  if (cache.has(tokenId)) {
    return cache.get(tokenId);
  }
  if (stack.includes(tokenId)) {
    throw new Error(`token build setup: circular token reference detected for "${tokenId}"`);
  }

  const token = getTokenLeaf(tokenTree, tokenId);
  const resolved = resolveValueNode(token.$value, tokenTree, cache, [...stack, tokenId]);
  cache.set(tokenId, resolved);
  return resolved;
}

function resolveValueNode(value, tokenTree, cache, stack) {
  if (typeof value === 'string') {
    const match = referencePattern.exec(value);
    return match ? resolveTokenValue(match[1], tokenTree, cache, stack) : value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => resolveValueNode(entry, tokenTree, cache, stack));
  }
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        resolveValueNode(entry, tokenTree, cache, stack),
      ])
    );
  }
  return value;
}

function getTokenLeaf(tokenTree, tokenId) {
  const node = tokenId.split('.').reduce((current, segment) => current?.[segment], tokenTree);
  if (!isObject(node) || !('$value' in node) || !('$type' in node)) {
    throw new Error(
      `token build setup: token "${tokenId}" is not defined in the materialized graph`
    );
  }
  return node;
}

function flattenTokenMap(tokenTree, themeId) {
  const entries = [];
  collectTokenEntries(tokenTree, [], entries, themeId);
  entries.sort(([left], [right]) => left.localeCompare(right));
  return Object.fromEntries(entries);
}

function collectTokenEntries(node, trail, entries, themeId) {
  if (!isObject(node)) {
    return;
  }
  if ('$value' in node && '$type' in node) {
    entries.push([
      trail.join('.'),
      {
        themeId,
        type: node.$type,
        value: cloneValue(node.$value),
      },
    ]);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$')) {
      collectTokenEntries(value, [...trail, key], entries, themeId);
    }
  }
}

function loadRecipeMap(pattern) {
  const recipeFiles = resolveFiles(pattern).sort((left, right) => left.localeCompare(right));
  const entries = recipeFiles.map((filePath) => {
    const recipe = readJson(filePath, true);
    const componentId = path.basename(filePath, '.recipe.json');
    return [componentId, sortDeep(recipe)];
  });
  return Object.fromEntries(entries);
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }
  if (!isObject(value)) {
    return value;
  }

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
}

function deepMerge(base, override) {
  if (!isObject(base) || !isObject(override)) {
    return cloneValue(override);
  }

  if (('$value' in base && '$type' in base) || ('$value' in override && '$type' in override)) {
    return cloneValue(override);
  }

  const merged = cloneValue(base);
  for (const [key, value] of Object.entries(override)) {
    if (!(key in merged)) {
      merged[key] = cloneValue(value);
      continue;
    }
    merged[key] = deepMerge(merged[key], value);
  }
  return merged;
}
