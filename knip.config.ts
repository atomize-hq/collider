import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Real code roots. src/components + src/lib are the design-system and token
  // library surface — consumed incrementally by pages, stories, the Figma plugin,
  // and build scripts — so they are treated as entry points rather than dead code
  // while the app is still being assembled. scripts/, design-tokens/build/,
  // figma/plugins/ and storybook/ are non-src roots knip must know about so the
  // dependencies they use are not falsely reported as unused.
  entry: [
    'src/app/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'scripts/**/*.mjs',
    'design-tokens/build/**/*.mjs',
    'figma/plugins/**/*.{ts,tsx}',
    'storybook/**/*.{ts,tsx}',
    '.storybook/**/*.{ts,tsx}',
  ],
  project: [
    'src/**/*.{ts,tsx}',
    'scripts/**/*.mjs',
    'design-tokens/**/*.mjs',
    'figma/plugins/**/*.{ts,tsx}',
    'storybook/**/*.{ts,tsx}',
  ],
  // Duplicate exports are intentional backward-compat aliases (e.g. the
  // component-mapping "completeness" names alias the older "status" names during
  // an in-progress rename). Report them, but don't fail the gate on style.
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
    // Planned UI stack installed ahead of the components that will import it.
    // Remove from here (or from package.json) as each one gets wired up.
    'lucide-react',
    'motion',
    'streamdown',
    '@streamdown/cjk',
    '@streamdown/code',
    '@streamdown/math',
    '@streamdown/mermaid',
    '@radix-ui/react-use-controllable-state',
  ],
};

export default config;
