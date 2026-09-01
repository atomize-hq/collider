import '../src/app/globals.css';

import type { Preview } from '@storybook/nextjs-vite';
import { createElement, type CSSProperties } from 'react';

import {
  resolveStorybookThemeId,
  storybookDefaultThemeId,
  storybookThemeItems,
} from '../src/lib/tokens/storybookTheme';

const previewSurfaceStyle: CSSProperties = {
  background: 'var(--color-background-base)',
  color: 'var(--color-text-primary)',
  minHeight: '100vh',
  padding: '1.5rem',
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Generated theme contract',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: storybookThemeItems,
      },
    },
  },
  initialGlobals: {
    theme: storybookDefaultThemeId,
  },
  decorators: [
    (Story, context) => {
      const themeId = resolveStorybookThemeId(context.globals.theme);

      return createElement(
        'div',
        {
          'data-theme': themeId,
          style: previewSurfaceStyle,
        },
        createElement(Story)
      );
    },
  ],
  parameters: {
    // Runs axe on every story in the `storybook` vitest project. Registering
    // `@storybook/addon-a11y` in main.ts alone only powers the manual panel —
    // the checks did not actually execute until the addon's preview annotations
    // were wired into `.storybook/vitest.setup.ts`.
    //
    // `todo` reports violations without failing the run. Turning this to `error`
    // is the goal, but it is gated on burning down a pre-existing backlog of 78
    // violations (24 button-name, 17 color-contrast, 5 aria-required-parent,
    // 2 label, 1 aria-prohibited-attr) that were invisible while the checks were
    // inert. Do not flip to `error` until that backlog is clear.
    a11y: { test: 'todo' },
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
