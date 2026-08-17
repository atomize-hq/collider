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
