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
    themeOverrides = [],
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
    ...renderThemeOverrideBlocks(stagedCss, themeOverrides, compatibilityLines, themeId),
    '',
  ].join('\n');
}

/**
 * Non-default themes are emitted as `[data-theme="<id>"]` blocks holding only the
 * declarations whose values differ from the default theme.
 *
 * The legacy compatibility aliases are repeated in each block. They are declared
 * as `--color-x: var(--semantic-x)`, and a `var()` in a custom property resolves
 * on the element that declares it — so the `:root` copies compute against the
 * default theme and then merely inherit. Without restating them here, theming a
 * subtree (which is what Storybook's decorator does) would switch the semantic
 * variables while the legacy aliases stayed on the default theme's values.
 */
function renderThemeOverrideBlocks(
  defaultStagedCss,
  themeOverrides,
  compatibilityLines,
  defaultThemeId
) {
  if (themeOverrides.length === 0) {
    return [];
  }

  const defaults = parseDeclarations(extractCssRootBody(defaultStagedCss));
  const lines = [];
  const themedNames = new Set();

  for (const { themeId, stagedCss } of themeOverrides) {
    const candidate = parseDeclarations(extractCssRootBody(stagedCss));
    const changed = [...candidate].filter(([name, value]) => defaults.get(name) !== value);

    if (changed.length === 0) {
      throw new Error(
        `token build setup: theme "${themeId}" resolves identically to the default theme, so it would publish an empty override block`
      );
    }

    for (const [name] of changed) themedNames.add(name);
    lines.push('');
    lines.push(`[data-theme='${themeId}'] {`);
    for (const [name, value] of changed) {
      lines.push(`  ${name}: ${value};`);
    }
    lines.push('');
    lines.push('  /* Legacy runtime compatibility surface */');
    lines.push(...compatibilityLines);
    lines.push('}');
  }

  // The default theme also gets an explicit block so it can be re-declared
  // inside another theme's subtree. Without it, `data-theme="dark"` would be
  // inert (dark lives unqualified in `:root`) and a surface that must stay dark
  // regardless of app theme — a terminal, whose ANSI palette is defined against
  // a dark ground — would have no way to opt out of an enclosing light theme.
  lines.push('');
  lines.push(`[data-theme='${defaultThemeId}'] {`);
  for (const name of [...themedNames].sort()) {
    lines.push(`  ${name}: ${defaults.get(name)};`);
  }
  lines.push('');
  lines.push('  /* Legacy runtime compatibility surface */');
  lines.push(...compatibilityLines);
  lines.push('}');

  return lines;
}

function parseDeclarations(cssBody) {
  const declarations = new Map();

  for (const match of cssBody.matchAll(/^\s*(--[a-z0-9-]+):\s*(.+);$/gm)) {
    declarations.set(match[1], match[2]);
  }

  return declarations;
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
