import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Application/library roots remain intentional public entrypoints while the app
  // is assembled. Reusable design-system tooling is installed, not authored here.
  // The sole remaining local script is the application-wide LOC guard. Generated
  // plugin output and the removed token-build tree are not source entrypoints.
  entry: [
    'src/app/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'scripts/validate-loc.mjs',
    'storybook/**/*.{ts,tsx}',
    '.storybook/**/*.{ts,tsx}',
  ],
  project: ['src/**/*.{ts,tsx}', 'storybook/**/*.{ts,tsx}'],
  // Duplicate-export findings are advisory under the current engineering policy.
  // Entrypoint and diagnostic policy are audited separately from tool removal.
  rules: {
    duplicates: 'warn',
  },
  ignoreDependencies: [
    '@vitest/coverage-v8',
    // Consumed only through CSS, which knip does not trace: globals.css does
    // `@import 'tailwindcss'` and the build runs it via @tailwindcss/postcss.
    // Nothing imports it from TS since tailwind.config.ts was removed — that
    // config was dead weight under Tailwind v4, which has no `@config`
    // directive here and never loaded it.
    'tailwindcss',
  ],
};

export default config;
