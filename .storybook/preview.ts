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
    // Every story is audited and a violation FAILS the run. This started as 541
    // violation nodes across 78 stories, invisible because the addon's preview
    // annotations were never wired into `.storybook/vitest.setup.ts`, so the
    // checks had never once executed.
    //
    // Two exclusions are recorded at the story level rather than here, each with
    // its measurement and reason: ansi-to-react's fixed ANSI palette in Terminal,
    // and Radix's `aria-hidden`-without-`inert` menu modality in Open in Chat.
    // Nothing else is suppressed — keep it that way, and fix the finding instead
    // of widening the exclusions.
    a11y: { test: 'error' },
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
