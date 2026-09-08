import type { ThemeRegistration } from 'shiki';
import { bundledThemes } from 'shiki';

/**
 * GitHub's stock themes with the values that failed WCAG repainted, rather than
 * the high-contrast pair.
 *
 * Contrast is measured against the ground the component actually paints on, not
 * the theme's own `editor.background`: the `pre` is transparent, so code sits on
 * the card's `bg-background` — `#171717` in dark, `#ffffff` in light. Swapping
 * the whole theme to clear the failures repainted 85 scopes per mode and drifted
 * the Figma seeds; these overrides do not.
 *
 * `code-block-theme.test.ts` audits every colour in both loaded themes against
 * those grounds, so this list is the complete set — not a sample.
 *
 * Every replacement is GitHub's own value, so the palettes stay in family.
 */

type Repaint = { from: string; to: string };

// Two kinds of failure show up, and they have different fixes.
//
// The first is a colour that was always meant to sit on the editor ground and is
// simply too close to ours. The replacement is the nearest sibling that clears
// AA.
//
// The second is a colour chosen to sit on a *background the rule declares
// itself* — GitHub paints `carriage-return` and the git-status markup as chips.
// Shiki's dual-theme mode drops per-token backgrounds entirely (it emits only
// `color` and `--shiki-dark`), so those foregrounds land on our ground with the
// contrast they were designed against gone, at 1.22:1 and 1.46:1. Promoting the
// rule's own background to its foreground keeps the chip's identity — the red
// marker stays red — and clears AA, because that colour was picked to stand
// against the editor ground in the first place.
//
// The three diff rules (`markup.deleted` / `inserted` / `changed`) also declare
// backgrounds, but their foregrounds already clear AA on our ground, so they are
// left alone; promotion there would paint deleted text `#86181d` at 1.6:1.

const DARK_REPAINTS: Repaint[] = [
  { from: '#6a737d', to: '#8b949e' }, // comment: 3.72:1 -> 5.83:1
  { from: '#24292e', to: '#f97583' }, // carriage-return: 1.22:1 -> 6.74:1
  { from: '#2f363d', to: '#79b8ff' }, // markup.ignored/untracked: 1.46:1 -> 8.63:1
];

const LIGHT_REPAINTS: Repaint[] = [
  // Covers `variable` — every identifier on screen — plus the markdown list
  // bullet, so it is the most visible of the failures. Replacement is Primer's
  // light `severe` orange, the nearest step up that clears AA; the
  // high-contrast theme's `#702c00` clears it too, at the cost of reading brown.
  { from: '#e36209', to: '#bc4c00' }, // variable: 3.49:1 -> 5.03:1
  { from: '#fafbfc', to: '#d73a49' }, // carriage-return: 1.04:1 -> 4.57:1
  { from: '#f6f8fa', to: '#005cc5' }, // markup.ignored/untracked: 1.06:1 -> 6.29:1
];

/**
 * Repaint every rule painted with one of the `from` colours.
 *
 * Keyed on the colour rather than on a scope name because one value is shared
 * across several rules — `#e36209` alone spans four scopes in three of them —
 * and it is the value that fails, not any single scope.
 */
const repaint = (theme: ThemeRegistration, repaints: Repaint[]): ThemeRegistration => {
  const byColor = new Map(repaints.map(({ from, to }) => [from, to]));

  return {
    ...theme,
    tokenColors: theme.tokenColors?.map((rule) => {
      const replacement = byColor.get(rule.settings?.foreground?.toLowerCase() ?? '');
      return replacement
        ? { ...rule, settings: { ...rule.settings, foreground: replacement } }
        : rule;
    }),
  };
};

export const COLLIDER_DARK = 'collider-code-dark';
export const COLLIDER_LIGHT = 'collider-code-light';

/** The stock themes these are derived from, exported for the contrast audit. */
export const STOCK_CODE_THEMES = { dark: 'github-dark', light: 'github-light' } as const;

export const loadCodeThemes = async (): Promise<ThemeRegistration[]> => {
  const [dark, light] = await Promise.all([
    bundledThemes[STOCK_CODE_THEMES.dark](),
    bundledThemes[STOCK_CODE_THEMES.light](),
  ]);

  return [
    { ...repaint(dark.default, DARK_REPAINTS), name: COLLIDER_DARK },
    { ...repaint(light.default, LIGHT_REPAINTS), name: COLLIDER_LIGHT },
  ];
};
