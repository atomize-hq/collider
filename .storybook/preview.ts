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
    // is the goal. The original backlog — 541 violation nodes across 78 stories,
    // invisible while the checks were inert — is down to 15, and every remaining
    // one is a colour decision rather than a code defect:
    //
    //   11  terminal   ansi-to-react's fixed ANSI palette (#0000bb at 1.46:1)
    //    2  destructive  text/error is 4.28:1 on background/surface, 4.80 on base
    //    1  sandbox    shiki github-dark's comment colour at 3.72:1
    //    1  open-in-chat  Radix aria-hides the page behind an open menu without
    //                    `inert`, so the trigger stays focusable underneath
    //
    // Do not flip to `error` until those are resolved or explicitly excluded.
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
