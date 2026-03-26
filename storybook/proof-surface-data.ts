import { themeRegistry, tokenMap, type TokenId } from '../design-tokens/dist/tokens';

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
    const valueStr = String(token.value);
    invariant(valueStr.length > 0, `tokenMap.${tokenId} is missing a value`);

    const groupId = tokenId.split('.').slice(0, 2).join('.');
    const groupTokens = groups.get(groupId) ?? [];
    groupTokens.push({
      cssVariable: toCssVariableName(tokenId),
      id: tokenId,
      themeId: token.themeId,
      type: token.type,
      value: valueStr,
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

function getTokenEntries() {
  const entries = Object.entries(tokenMap) as Array<[TokenId, TokenRecord]>;
  invariant(entries.length > 0, 'tokenMap must contain at least one generated token');
  return entries.sort(([left], [right]) => left.localeCompare(right));
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
