import { defineConfig, defineProject } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      // Unit tests — Node environment, no browser
      defineProject({
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['node_modules', 'src-tauri'],
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
      }),
      // Storybook component tests — browser via Playwright
      defineProject({
        plugins: [storybookTest()],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      }),
    ],
  },
});
