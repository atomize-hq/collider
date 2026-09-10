import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    '.next/**',
    // Receipt-sealed installed product outputs are checked by ds-skills, not rewritten here.
    '.agents/skills/**',
    '.agents/schemas/**',
    '.agents/templates/**',
    '.ds-skills/project.mjs',
    '.claude/**',
    'out/**',
    'src-tauri/**',
    'storybook-static/**',
    'next-env.d.ts',
    'src/components/ai-elements/reasoning.tsx',
    'src/components/ai-elements/shimmer.tsx',
    // Vendored ai-elements: intentional invalidate-during-render ref pattern in
    // the shiki token pipeline trips react-hooks/refs; kept as upstream ships it.
    'src/components/ai-elements/code-block-body.tsx',
  ]),
]);

export default eslintConfig;
