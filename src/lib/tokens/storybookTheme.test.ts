import { describe, expect, it } from 'vitest';
import { themeRegistry } from '../../../design-tokens/dist/tokens';
import {
  resolveStorybookThemeId,
  storybookDefaultThemeId,
  storybookThemeItems,
} from './storybookTheme';

describe('storybookTheme', () => {
  it('derives toolbar items from the generated theme registry', () => {
    expect(storybookThemeItems).toEqual(
      themeRegistry.themes.map((theme) => ({
        value: theme.id,
        title: theme.id,
      }))
    );
    expect(storybookDefaultThemeId).toBe(themeRegistry.defaultThemeId);
  });

  it('falls back to the generated default theme for unknown globals', () => {
    expect(resolveStorybookThemeId(themeRegistry.defaultThemeId)).toBe(
      themeRegistry.defaultThemeId
    );
    expect(resolveStorybookThemeId('unknown-theme')).toBe(themeRegistry.defaultThemeId);
    expect(resolveStorybookThemeId(undefined)).toBe(themeRegistry.defaultThemeId);
  });
});
