import { describe, expect, it } from 'vitest';
import type { ThemeRegistration } from 'shiki';
import { bundledThemes, createHighlighter } from 'shiki';

import { themeOverrides, tokenMap } from '../../../design-tokens/dist/tokens';
import {
  COLLIDER_DARK,
  COLLIDER_LIGHT,
  loadCodeThemes,
  STOCK_CODE_THEMES,
} from './code-block-theme';

/**
 * The a11y gate can only see a colour a story actually renders, and no story
 * contains a code comment — which is exactly where the first contrast bug hid.
 * This audits the themes themselves: every colour they can paint, whether or not
 * a fixture happens to use it.
 */

const AA_BODY = 4.5; // Code renders at 14px, non-bold, so the body threshold applies.

const GROUND_TOKEN = 'semantic.color.background.base';

const channel = (value: number) => {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) => {
  const digits = hex.replace('#', '');
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((d) => d + d)
          .join('')
      : digits;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: string, b: string) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * The ground comes from the token artifact rather than a literal, so moving
 * `background.base` re-runs the audit against the new value instead of silently
 * invalidating it. `CodeBlockContainer` paints `bg-background`, which the
 * `globals.css` bridge aliases onto this token.
 */
const groundFor = (themeId: 'dark' | 'light') => {
  const entry = themeOverrides[themeId as keyof typeof themeOverrides]?.[GROUND_TOKEN];
  const value = (entry ?? tokenMap[GROUND_TOKEN]).value;
  expect(value, `${GROUND_TOKEN} is missing from the token artifact for "${themeId}"`).toMatch(
    /^#[0-9a-f]{6}$/i
  );
  return value;
};

/** Every colour the theme can paint, mapped to the scopes that would paint it. */
const paintedColors = (theme: ThemeRegistration) => {
  const byColor = new Map<string, string[]>();

  const record = (color: string | undefined, scope: string) => {
    if (!color) {
      return;
    }
    const scopes = byColor.get(color) ?? [];
    scopes.push(scope);
    byColor.set(color, scopes);
  };

  // Tokens matching no rule fall back to the editor foreground, so it paints
  // too even though it is not a rule.
  record(theme.fg ?? theme.colors?.['editor.foreground'], '(unscoped default)');

  for (const rule of theme.tokenColors ?? []) {
    const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope ?? '(no scope)'];
    record(rule.settings?.foreground, scopes.join(', '));
  }

  return byColor;
};

const failuresAgainst = (theme: ThemeRegistration, ground: string) =>
  [...paintedColors(theme)]
    .map(([color, scopes]) => ({ color, ratio: contrast(color, ground), scopes }))
    .filter(({ ratio }) => ratio < AA_BODY)
    .sort((a, b) => a.ratio - b.ratio);

const format = (failures: ReturnType<typeof failuresAgainst>) =>
  failures
    .map(({ color, ratio, scopes }) => `  ${ratio.toFixed(2)}:1  ${color}  ${scopes.join(' / ')}`)
    .join('\n');

const THEMES = [
  { colliderName: COLLIDER_DARK, stock: STOCK_CODE_THEMES.dark, themeId: 'dark' },
  { colliderName: COLLIDER_LIGHT, stock: STOCK_CODE_THEMES.light, themeId: 'light' },
] as const;

describe('code block syntax themes', () => {
  it.each(THEMES)(
    'paints no colour below AA on the $themeId ground',
    async ({ colliderName, themeId }) => {
      const theme = (await loadCodeThemes()).find((candidate) => candidate.name === colliderName);
      expect(theme, `loadCodeThemes() no longer returns "${colliderName}"`).toBeDefined();

      const ground = groundFor(themeId);
      const failures = failuresAgainst(theme as ThemeRegistration, ground);

      expect(
        failures,
        `Syntax colours below ${AA_BODY}:1 on ${ground}:\n${format(failures)}\n\n` +
          'Add the colour to the repaint list in code-block-theme.ts.'
      ).toEqual([]);
    }
  );

  // Without this the audit above could pass because the measurement is wrong
  // rather than because the themes are sound. The stock themes are the same
  // input with the repaints removed, so they must still fail.
  it.each(THEMES)(
    'measures something the stock $themeId theme fails',
    async ({ stock, themeId }) => {
      const theme = (await bundledThemes[stock]()).default;

      expect(failuresAgainst(theme, groundFor(themeId)).length).toBeGreaterThan(0);
    }
  );

  /**
   * The audit assumes every foreground lands on our ground. That holds only
   * because shiki's dual-theme mode discards per-token backgrounds — five
   * GitHub rules declare one. If a future change moved us to single-theme
   * highlighting those grounds would come back, and measuring against
   * `background.base` alone would start reporting the wrong number.
   */
  it('emits no per-token background, so every colour lands on our ground', async () => {
    const highlighter = await createHighlighter({
      langs: ['diff'],
      themes: await loadCodeThemes(),
    });
    const { tokens } = highlighter.codeToTokens('+ added\n- removed\n', {
      lang: 'diff',
      themes: { dark: COLLIDER_DARK, light: COLLIDER_LIGHT },
    });

    const painted = tokens.flat();
    expect(painted.length).toBeGreaterThan(0);
    for (const token of painted) {
      expect(token.bgColor).toBeUndefined();
      expect(token.htmlStyle).not.toHaveProperty('background-color');
    }
  });
});
