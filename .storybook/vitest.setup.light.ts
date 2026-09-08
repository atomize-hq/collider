import { setProjectAnnotations } from '@storybook/nextjs-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

// The same annotations as `vitest.setup.ts`, with the theme global flipped to
// light. Contrast is the one axe rule whose result depends entirely on the
// theme, so auditing only the default theme leaves half the token system
// ungated — `semantic.color.text.error` passed in dark while failing on every
// light ground, and Shiki's `variable` colour sat at 3.49:1 on white, neither of
// which the dark run could see.
setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
  { initialGlobals: { theme: 'light' } },
]);
