import { themeRegistry, type ThemeId } from '../../../design-tokens/dist/tokens';

export const storybookThemeItems = themeRegistry.themes.map((theme) => ({
  value: theme.id,
  title: theme.id,
}));

export const storybookDefaultThemeId = themeRegistry.defaultThemeId;

const availableThemeIds = new Set<ThemeId>(themeRegistry.themes.map((theme) => theme.id));

export function resolveStorybookThemeId(value: unknown): ThemeId {
  if (typeof value === 'string' && availableThemeIds.has(value as ThemeId)) {
    return value as ThemeId;
  }

  return storybookDefaultThemeId;
}
