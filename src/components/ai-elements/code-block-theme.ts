import type { ThemeRegistration } from 'shiki';
import { bundledThemes } from 'shiki';

/**
 * GitHub's stock themes with the two values that failed WCAG repainted, rather
 * than the high-contrast pair.
 *
 * Contrast is measured against the ground the component actually paints on, not
 * the theme's own `editor.background`: the `pre` is transparent, so code sits on
 * the card's `bg-background` — `#171717` in dark, `#ffffff` in light. Auditing
 * every foreground in both themes against those grounds turns up exactly two
 * below 4.5:1 with scopes that render in the languages we highlight. Swapping
 * the whole theme to fix them repainted 85 scopes per mode and drifted the Figma
 * seeds; these two overrides do not.
 *
 * Both replacements are GitHub's own values, so the palettes stay in family.
 */

// 3.72:1 on #171717. Replacement is github-dark-dimmed's comment grey, which
// still reads as de-emphasised without dropping below AA. Light uses this same
// grey for comments, where it measures 4.82:1 and passes — so it is repainted in
// dark only.
const DARK_COMMENT = { from: '#6a737d', to: '#8b949e' }; // 3.72:1 -> 5.83:1

// 3.49:1 on #ffffff, and it covers `variable` — every identifier on screen —
// plus the markdown list bullet. The more visible of the two failures.
// Replacement is Primer's light `severe` orange, the nearest step up that clears
// AA; the high-contrast theme's `#702c00` clears it too, at the cost of reading
// brown rather than orange.
const LIGHT_VARIABLE = { from: '#e36209', to: '#bc4c00' }; // 3.49:1 -> 5.03:1

/**
 * Repaint every rule painted with `from`.
 *
 * Keyed on the colour rather than on a scope name because one value is shared
 * across several rules — `#e36209` alone spans four scopes in three of them —
 * and it is the value that fails, not any single scope.
 */
const repaint = (
  theme: ThemeRegistration,
  { from, to }: { from: string; to: string }
): ThemeRegistration => ({
  ...theme,
  tokenColors: theme.tokenColors?.map((rule) =>
    rule.settings?.foreground?.toLowerCase() === from
      ? { ...rule, settings: { ...rule.settings, foreground: to } }
      : rule
  ),
});

export const COLLIDER_DARK = 'collider-code-dark';
export const COLLIDER_LIGHT = 'collider-code-light';

export const loadCodeThemes = async (): Promise<ThemeRegistration[]> => {
  const [dark, light] = await Promise.all([
    bundledThemes['github-dark'](),
    bundledThemes['github-light'](),
  ]);

  return [
    { ...repaint(dark.default, DARK_COMMENT), name: COLLIDER_DARK },
    { ...repaint(light.default, LIGHT_VARIABLE), name: COLLIDER_LIGHT },
  ];
};
