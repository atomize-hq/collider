import { describe, expect, it } from 'vitest';
import { loadTokenDocsModel, normalizeTokenDocsModule } from './token-docs-loader';

describe('normalizeTokenDocsModule', () => {
  it('groups tokens by family and sorts themes and token ids lexically', () => {
    const model = normalizeTokenDocsModule({
      themeRegistry: {
        defaultThemeId: 'dark',
        themes: [
          { id: 'light', extends: 'dark', required: false },
          { id: 'dark', extends: null, required: true },
        ],
      },
      tokenMap: {
        'semantic.color.text.primary': { themeId: 'dark', type: 'color', value: '#ffffff' },
        'core.color.white': { themeId: 'dark', type: 'color', value: '#ffffff' },
        'motion.duration.quick': { themeId: 'dark', type: 'duration', value: '150ms' },
      },
    });

    expect(model.themes).toEqual([
      { extends: null, id: 'dark', isDefault: true, required: true },
      { extends: 'dark', id: 'light', isDefault: false, required: false },
    ]);
    expect(model.groups.map((group) => group.family)).toEqual(['core', 'motion', 'semantic']);
    expect(model.groups[0]?.tokens).toEqual([
      {
        cssVar: '--core-color-white',
        id: 'core.color.white',
        themeId: 'dark',
        type: 'color',
        value: '#ffffff',
      },
    ]);
  });

  it('fails clearly when required token artifact fields are missing', () => {
    expect(() =>
      normalizeTokenDocsModule({
        themeRegistry: {
          themes: [{ id: 'dark', extends: null, required: true }],
        },
        tokenMap: {},
      })
    ).toThrow(
      'Generated token docs error: themeRegistry.defaultThemeId must be a non-empty string.'
    );

    expect(() =>
      normalizeTokenDocsModule({
        themeRegistry: {
          defaultThemeId: 'dark',
          themes: [{ id: 'dark', extends: null, required: true }],
        },
        tokenMap: {
          'semantic.color.text.primary': { themeId: 'dark', type: 'color' },
        },
      })
    ).toThrow(
      'Generated token docs error: tokenMap.semantic.color.text.primary.value is required.'
    );
  });
});

describe('loadTokenDocsModel', () => {
  it('wraps generated artifact import failures with a descriptive error', async () => {
    await expect(
      loadTokenDocsModel(() => Promise.reject(new Error('module not found')))
    ).rejects.toThrow(
      'Failed to import generated token artifacts from design-tokens/dist/tokens.ts. Run "pnpm build:tokens" and ensure the artifact exists. module not found'
    );
  });
});
