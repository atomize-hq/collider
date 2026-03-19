import { describe, expect, it } from 'vitest';

import {
  formatStorybookArtifactConformanceDiagnostics,
  loadGeneratedTokenArtifact,
  validateGeneratedTokenArtifactShape,
} from './storybook-artifact-conformance';

describe('storybook artifact conformance', () => {
  it('accepts the current generated token artifact', async () => {
    const { artifact, diagnostics } = await loadGeneratedTokenArtifact();

    expect(artifact).not.toBeNull();
    expect(diagnostics).toEqual([]);
    expect(artifact?.themeRegistry.defaultThemeId).toBe('dark');
    expect(artifact?.tokenMap['semantic.color.background.surface']?.value).toBe('#202020');
    expect(artifact?.tokenMap['semantic.color.text.secondary']?.value).toBe('#6a7282');
  });

  it('reports a deterministic missing-artifact diagnostic when the loader fails', async () => {
    const { artifact, diagnostics } = await loadGeneratedTokenArtifact(async () => {
      throw new Error('Cannot resolve generated token module');
    });

    expect(artifact).toBeNull();
    expect(diagnostics).toEqual([
      {
        code: 'GENERATED_ARTIFACT_MISSING',
        message:
          'Unable to load generated token artifact: Cannot resolve generated token module. Rebuild generated token artifacts with `pnpm build:tokens`.',
        path: 'design-tokens/dist/tokens.ts',
        rule: 'CT-5',
      },
    ]);
  });

  it('reports required-field diagnostics for malformed generated artifacts', () => {
    const diagnostics = validateGeneratedTokenArtifactShape({
      themeRegistry: {
        defaultThemeId: '',
        themes: [],
      },
      tokenMap: {
        'semantic.color.background.surface': {
          themeId: 'dark',
          type: 'color',
          value: '',
        },
      },
    });

    expect(diagnostics).toEqual([
      {
        code: 'GENERATED_ARTIFACT_FIELD_MISSING',
        message:
          'Generated token artifact is missing required field "themeRegistry.defaultThemeId". Rebuild generated token artifacts with `pnpm build:tokens`.',
        path: 'design-tokens/dist/tokens.ts',
        rule: 'CT-5',
      },
      {
        code: 'GENERATED_ARTIFACT_FIELD_MISSING',
        message:
          'Generated token artifact is missing required field "themeRegistry.themes". Rebuild generated token artifacts with `pnpm build:tokens`.',
        path: 'design-tokens/dist/tokens.ts',
        rule: 'CT-5',
      },
      {
        code: 'GENERATED_ARTIFACT_FIELD_MISSING',
        message:
          'Generated token artifact is missing required field "tokenMap.semantic.color.background.surface.value". Rebuild generated token artifacts with `pnpm build:tokens`.',
        path: 'design-tokens/dist/tokens.ts',
        rule: 'CT-5',
      },
      {
        code: 'GENERATED_ARTIFACT_FIELD_MISSING',
        message:
          'Generated token artifact is missing required field "tokenMap.semantic.color.text.secondary.value". Rebuild generated token artifacts with `pnpm build:tokens`.',
        path: 'design-tokens/dist/tokens.ts',
        rule: 'CT-5',
      },
    ]);
  });

  it('formats diagnostics into one actionable error block', () => {
    expect(
      formatStorybookArtifactConformanceDiagnostics([
        {
          code: 'GENERATED_ARTIFACT_MISSING',
          message: 'Unable to load generated token artifact.',
          path: 'design-tokens/dist/tokens.ts',
          rule: 'CT-5',
        },
        {
          code: 'GENERATED_RUNTIME_CSS_MISMATCH',
          message: 'Generated runtime CSS mismatch.',
          path: 'src/lib/tokens/tokens.css',
          rule: 'CT-6',
        },
      ])
    ).toBe(
      [
        '[CT-5] design-tokens/dist/tokens.ts GENERATED_ARTIFACT_MISSING: Unable to load generated token artifact.',
        '[CT-6] src/lib/tokens/tokens.css GENERATED_RUNTIME_CSS_MISMATCH: Generated runtime CSS mismatch.',
      ].join('\n')
    );
  });
});
