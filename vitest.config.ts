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
      '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-progress',
      '@radix-ui/react-tooltip',
      'embla-carousel-react',
      'cmdk',
      'nanoid',
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
        plugins: [
          storybookTest({ configDir: path.resolve(__dirname, '.storybook') }),
          storybookCache('dark'),
        ],
        test: {
          name: 'storybook',
          // Vitest defaults `testTimeout` to 15s in browser mode and 5s elsewhere,
          // so these two projects inherit 15s. That is not enough here. The token
          // contract stories render the whole generated registry -- 653 tokens --
          // and the a11y addon then runs axe over every node of it: measured on
          // this machine, `Contracts/Tokens > Docs` costs 6.90s with axe and 0.42s
          // without, so ~94% of it is the audit. A GitHub runner is ~3.7x slower
          // (25.0s there against 6.90s here, 11.3s against 2.92s for
          // `Contracts/Generated Tokens`), which put the first over the 15s budget
          // and left the second with 25% headroom -- one slow runner from the same
          // failure. Raising the budget keeps the audit whole rather than trimming
          // what axe sees; the next slowest file on CI is 5.4s for 7 tests, so
          // nothing else is near this.
          testTimeout: 60_000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      // The same stories again in the light theme. axe's contrast rule is the
      // one check whose result depends on the theme, so a single-theme run
      // gates only half the token system.
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.resolve(__dirname, '.storybook') }),
          storybookCache('light'),
        ],
        test: {
          name: 'storybook-light',
          // Same budget, same reason as the `storybook` project above.
          testTimeout: 60_000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.light.ts'],
        },
      },
    ],
  },
});

// Storybook 10.2.19 derives its optimizer cache from configDir alone. These two
// concurrent browser projects share configDir, but must not write the same cache.
// A post hook overrides the addon's config hook; assertions and timeouts stay intact.
function storybookCache(theme: 'dark' | 'light') {
  return {
    name: `collider-storybook-${theme}-cache`,
    enforce: 'post' as const,
    config: () => ({
      cacheDir: path.resolve(__dirname, `node_modules/.cache/collider-storybook-${theme}`),
    }),
  };
}
