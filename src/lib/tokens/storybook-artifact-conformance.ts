export type StorybookArtifactConformanceDiagnostic = {
  code:
    | 'GENERATED_ARTIFACT_MISSING'
    | 'GENERATED_ARTIFACT_FIELD_MISSING'
    | 'GENERATED_RUNTIME_CSS_MISMATCH';
  message: string;
  path: string;
  rule: 'CT-5' | 'CT-6';
};

export type GeneratedTokenArtifactLoader = () => Promise<unknown>;

export type GeneratedTokenEntry = {
  themeId: string;
  type: string;
  value: string;
};

export type GeneratedTokenArtifact = {
  themeRegistry: {
    defaultThemeId: string;
    themes: Array<{ id: string }>;
  };
  tokenMap: Record<string, GeneratedTokenEntry>;
  // Only the leaves a non-default theme changes. Optional so a stale artifact
  // built before the typed module carried its themes still loads — it then
  // resolves as the default theme, which is what it used to do anyway.
  themeOverrides?: Record<string, Record<string, GeneratedTokenEntry>>;
};

export type RuntimeCssParityCheck = {
  cssVariable: string;
  property: 'backgroundColor' | 'color';
  tokenId: string;
};

export const generatedTokenArtifactPath = 'design-tokens/dist/tokens.ts';
export const runtimeCssArtifactPath = 'src/lib/tokens/tokens.css';
export const rebuildGeneratedArtifactsHint =
  'Rebuild generated token artifacts with `pnpm build:tokens`.';

export const defaultRuntimeCssParityChecks: RuntimeCssParityCheck[] = [
  {
    cssVariable: '--color-background-surface',
    property: 'backgroundColor',
    tokenId: 'semantic.color.background.surface',
  },
  {
    cssVariable: '--color-text-secondary',
    property: 'color',
    tokenId: 'semantic.color.text.secondary',
  },
];

export async function loadGeneratedTokenArtifact(
  loader: GeneratedTokenArtifactLoader = defaultGeneratedTokenArtifactLoader
) {
  try {
    const candidate = await loader();
    const artifact = toGeneratedTokenArtifact(candidate);
    return {
      artifact,
      diagnostics: validateGeneratedTokenArtifactShape(artifact),
    };
  } catch (error) {
    return {
      artifact: null,
      diagnostics: [
        createDiagnostic(
          'GENERATED_ARTIFACT_MISSING',
          `Unable to load generated token artifact: ${formatError(error)}. ${rebuildGeneratedArtifactsHint}`,
          generatedTokenArtifactPath,
          'CT-5'
        ),
      ],
    };
  }
}

export function validateGeneratedTokenArtifactShape(
  input: unknown
): StorybookArtifactConformanceDiagnostic[] {
  const diagnostics: StorybookArtifactConformanceDiagnostic[] = [];
  const artifact = isRecord(input) ? input : null;
  const themeRegistry = isRecord(artifact?.themeRegistry) ? artifact.themeRegistry : null;
  const tokenMap = isRecord(artifact?.tokenMap) ? artifact.tokenMap : null;

  if (
    !themeRegistry ||
    typeof themeRegistry.defaultThemeId !== 'string' ||
    themeRegistry.defaultThemeId.length === 0
  ) {
    diagnostics.push(createMissingFieldDiagnostic('themeRegistry.defaultThemeId'));
  }

  if (!themeRegistry || !Array.isArray(themeRegistry.themes) || themeRegistry.themes.length === 0) {
    diagnostics.push(createMissingFieldDiagnostic('themeRegistry.themes'));
  } else if (
    typeof themeRegistry.defaultThemeId === 'string' &&
    !themeRegistry.themes.some(
      (theme) => isRecord(theme) && theme.id === themeRegistry.defaultThemeId
    )
  ) {
    diagnostics.push(
      createDiagnostic(
        'GENERATED_ARTIFACT_FIELD_MISSING',
        `Generated token artifact is invalid: themeRegistry.defaultThemeId "${themeRegistry.defaultThemeId}" is not declared in themeRegistry.themes.`,
        generatedTokenArtifactPath,
        'CT-5'
      )
    );
  }

  validateRequiredTokenValue(tokenMap, 'semantic.color.background.surface', diagnostics);
  validateRequiredTokenValue(tokenMap, 'semantic.color.text.secondary', diagnostics);

  return diagnostics;
}

export function createRuntimeCssParityDiagnostics(
  artifact: GeneratedTokenArtifact,
  options: {
    checks?: RuntimeCssParityCheck[];
    document?: Document;
    themeId?: string;
  } = {}
) {
  const diagnostics: StorybookArtifactConformanceDiagnostic[] = [];
  const doc = options.document ?? document;
  const checks = options.checks ?? defaultRuntimeCssParityChecks;
  const themeId = options.themeId ?? artifact.themeRegistry.defaultThemeId;

  for (const check of checks) {
    const token = resolveGeneratedTokenEntry(artifact, check.tokenId, themeId);
    if (!token || typeof token.value !== 'string' || token.value.length === 0) {
      diagnostics.push(createMissingFieldDiagnostic(`tokenMap.${check.tokenId}.value`));
      continue;
    }

    const actualValue = resolveComputedStyleValue(`var(${check.cssVariable})`, check.property, doc);
    const expectedValue = resolveComputedStyleValue(token.value, check.property, doc);
    if (actualValue === expectedValue) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(
        'GENERATED_RUNTIME_CSS_MISMATCH',
        `Generated runtime CSS mismatch: ${check.cssVariable} resolved to "${actualValue}" but ${check.tokenId} resolves to "${expectedValue}". ${rebuildGeneratedArtifactsHint}`,
        runtimeCssArtifactPath,
        'CT-6'
      )
    );
  }

  return diagnostics;
}

export function formatStorybookArtifactConformanceDiagnostics(
  diagnostics: StorybookArtifactConformanceDiagnostic[]
) {
  return diagnostics
    .map(
      (diagnostic) =>
        `[${diagnostic.rule}] ${diagnostic.path} ${diagnostic.code}: ${diagnostic.message}`
    )
    .join('\n');
}

export function resolveGeneratedTokenStyleValue(
  artifact: GeneratedTokenArtifact,
  tokenId: string,
  property: 'backgroundColor' | 'color',
  doc: Document = document,
  themeId: string = artifact.themeRegistry.defaultThemeId
) {
  const token = resolveGeneratedTokenEntry(artifact, tokenId, themeId);
  if (!token || typeof token.value !== 'string' || token.value.length === 0) {
    throw new Error(`Generated token artifact is missing ${tokenId}.value for theme "${themeId}"`);
  }

  return resolveComputedStyleValue(token.value, property, doc);
}

/**
 * The value a token resolves to in `themeId`: its override when the theme
 * changes it, the default-theme entry otherwise. Themes inherit, so a token the
 * override map does not mention is genuinely shared rather than missing.
 */
export function resolveGeneratedTokenEntry(
  artifact: GeneratedTokenArtifact,
  tokenId: string,
  themeId: string = artifact.themeRegistry.defaultThemeId
): GeneratedTokenEntry | undefined {
  return artifact.themeOverrides?.[themeId]?.[tokenId] ?? artifact.tokenMap[tokenId];
}

async function defaultGeneratedTokenArtifactLoader() {
  return import('../../../design-tokens/dist/tokens');
}

function validateRequiredTokenValue(
  tokenMap: Record<string, unknown> | null,
  tokenId: string,
  diagnostics: StorybookArtifactConformanceDiagnostic[]
) {
  const token = tokenMap?.[tokenId];
  if (!isRecord(token) || typeof token.value !== 'string' || token.value.length === 0) {
    diagnostics.push(createMissingFieldDiagnostic(`tokenMap.${tokenId}.value`));
  }
}

function toGeneratedTokenArtifact(input: unknown): GeneratedTokenArtifact {
  return input as GeneratedTokenArtifact;
}

function resolveComputedStyleValue(
  rawValue: string,
  property: 'backgroundColor' | 'color',
  doc: Document
) {
  const probe = doc.createElement('div');
  probe.style.setProperty(property === 'backgroundColor' ? 'background-color' : 'color', rawValue);
  doc.body.appendChild(probe);

  const computedValue = doc.defaultView?.getComputedStyle(probe)[property] ?? '';
  probe.remove();
  return computedValue;
}

function createMissingFieldDiagnostic(fieldName: string) {
  return createDiagnostic(
    'GENERATED_ARTIFACT_FIELD_MISSING',
    `Generated token artifact is missing required field "${fieldName}". ${rebuildGeneratedArtifactsHint}`,
    generatedTokenArtifactPath,
    'CT-5'
  );
}

function createDiagnostic(
  code: StorybookArtifactConformanceDiagnostic['code'],
  message: string,
  path: string,
  rule: StorybookArtifactConformanceDiagnostic['rule']
): StorybookArtifactConformanceDiagnostic {
  return { code, message, path, rule };
}

function formatError(error: unknown) {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'unknown loader failure';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
