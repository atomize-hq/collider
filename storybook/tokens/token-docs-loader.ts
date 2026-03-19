export type TokenDocsModel = {
  artifactPath: string;
  runtimeCssPath: string;
  themes: TokenThemeRecord[];
  groups: TokenGroupRecord[];
};

export type TokenThemeRecord = {
  id: string;
  required: boolean;
  extends: string | null;
  isDefault: boolean;
};

export type TokenGroupRecord = {
  family: string;
  tokens: TokenRecord[];
};

export type TokenRecord = {
  id: string;
  themeId: string;
  type: string;
  value: string;
  cssVar: string;
};

type TokenDocsModuleLoader = () => Promise<unknown>;

type ThemeRegistryRecord = {
  defaultThemeId: string;
  themes: TokenThemeRecord[];
};

const generatedArtifactPath = 'design-tokens/dist/tokens.ts';
const runtimeCssArtifactPath = 'src/lib/tokens/tokens.css';

export async function loadTokenDocsModel(
  loadModule: TokenDocsModuleLoader = importGeneratedTokenArtifacts
): Promise<TokenDocsModel> {
  let moduleData: unknown;

  try {
    moduleData = await loadModule();
  } catch (error) {
    throw createImportError(error);
  }

  return normalizeTokenDocsModule(moduleData);
}

export function normalizeTokenDocsModule(moduleData: unknown): TokenDocsModel {
  const moduleRecord = readRecord(moduleData, 'generated token artifact module');
  const themeRegistry = readThemeRegistry(moduleRecord.themeRegistry);
  const tokenEntries = readTokenEntries(moduleRecord.tokenMap);
  const groups = groupTokens(tokenEntries);

  return {
    artifactPath: generatedArtifactPath,
    runtimeCssPath: runtimeCssArtifactPath,
    themes: themeRegistry.themes,
    groups,
  };
}

async function importGeneratedTokenArtifacts() {
  return import('../../design-tokens/dist/tokens');
}

function groupTokens(tokens: TokenRecord[]) {
  const grouped = new Map<string, TokenRecord[]>();

  for (const token of tokens) {
    const family = token.id.split('.')[0] ?? 'unknown';
    const existing = grouped.get(family) ?? [];
    existing.push(token);
    grouped.set(family, existing);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([family, entries]) => ({
      family,
      tokens: entries.sort((left, right) => left.id.localeCompare(right.id)),
    }));
}

function readThemeRegistry(input: unknown): ThemeRegistryRecord {
  const themeRegistry = readRecord(input, 'themeRegistry');
  const defaultThemeId = readNonEmptyString(
    themeRegistry.defaultThemeId,
    'themeRegistry.defaultThemeId'
  );
  const themeValues = readArray(themeRegistry.themes, 'themeRegistry.themes');

  if (themeValues.length === 0) {
    throw new Error('Generated token docs error: themeRegistry.themes must not be empty.');
  }

  return {
    defaultThemeId,
    themes: themeValues
      .map((theme, index) => readThemeRecord(theme, index, defaultThemeId))
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
}

function readThemeRecord(input: unknown, index: number, defaultThemeId: string): TokenThemeRecord {
  const theme = readRecord(input, `themeRegistry.themes[${index}]`);
  const id = readNonEmptyString(theme.id, `themeRegistry.themes[${index}].id`);

  return {
    id,
    required: readBoolean(theme.required, `themeRegistry.themes[${index}].required`, false),
    extends: readOptionalString(theme.extends, `themeRegistry.themes[${index}].extends`),
    isDefault: id === defaultThemeId,
  };
}

function readTokenEntries(input: unknown) {
  const tokenMap = readRecord(input, 'tokenMap');
  const entries = Object.entries(tokenMap);

  if (entries.length === 0) {
    throw new Error('Generated token docs error: tokenMap must not be empty.');
  }

  return entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tokenId, value]) => readTokenRecord(tokenId, value));
}

function readTokenRecord(tokenId: string, input: unknown): TokenRecord {
  const token = readRecord(input, `tokenMap.${tokenId}`);

  return {
    id: tokenId,
    themeId: readNonEmptyString(token.themeId, `tokenMap.${tokenId}.themeId`),
    type: readNonEmptyString(token.type, `tokenMap.${tokenId}.type`),
    value: readTokenValue(token.value, `tokenMap.${tokenId}.value`),
    cssVar: toCssVariableName(tokenId),
  };
}

function readTokenValue(input: unknown, fieldPath: string) {
  if (input === undefined) {
    throw new Error(`Generated token docs error: ${fieldPath} is required.`);
  }

  if (typeof input === 'string') {
    return input;
  }

  return JSON.stringify(input);
}

function toCssVariableName(tokenId: string) {
  return `--${tokenId.replaceAll('.', '-')}`;
}

function readRecord(input: unknown, fieldPath: string) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(`Generated token docs error: ${fieldPath} must be an object.`);
  }

  return input as Record<string, unknown>;
}

function readArray(input: unknown, fieldPath: string) {
  if (!Array.isArray(input)) {
    throw new Error(`Generated token docs error: ${fieldPath} must be an array.`);
  }

  return input;
}

function readNonEmptyString(input: unknown, fieldPath: string) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error(`Generated token docs error: ${fieldPath} must be a non-empty string.`);
  }

  return input;
}

function readOptionalString(input: unknown, fieldPath: string) {
  if (input === undefined || input === null) {
    return null;
  }

  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error(`Generated token docs error: ${fieldPath} must be null or a non-empty string.`);
  }

  return input;
}

function readBoolean(input: unknown, fieldPath: string, fallback: boolean) {
  if (input === undefined) {
    return fallback;
  }

  if (typeof input !== 'boolean') {
    throw new Error(`Generated token docs error: ${fieldPath} must be a boolean.`);
  }

  return input;
}

function createImportError(error: unknown) {
  const details = error instanceof Error ? error.message : 'Unknown import failure';
  return new Error(
    `Failed to import generated token artifacts from ${generatedArtifactPath}. Run "pnpm build:tokens" and ensure the artifact exists. ${details}`
  );
}
