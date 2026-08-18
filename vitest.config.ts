import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';

export default defineConfig({
  optimizeDeps: {
    // Pre-bundle deps that stories pull in so the Storybook browser project does
    // not re-optimize and reload mid-test on a cold cache (e.g. CI / just preflight).
    include: [
      '@storybook/nextjs-vite',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-use-controllable-state',
      '@radix-ui/react-select',
      '@radix-ui/react-scroll-area',
      'motion/react',
      'shiki',
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    projects: [
      // Unit tests — Node environment, no browser
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}', 'storybook/**/*.test.{ts,tsx}'],
          exclude: ['node_modules', 'src-tauri'],
        },
      },
      // Storybook component tests — browser via Playwright
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.resolve(__dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
