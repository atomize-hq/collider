import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    '.next/**',
    // Vendored ai-elements registry payload: 80 upstream demo components and
    // their references, copied byte-for-byte so a re-sync is a clean diff. Same
    // policy .prettierignore applies to them, and the same one this config
    // applies to the vendored components in src/components/ai-elements. The
    // rest of .agents/ is ours and is linted.
    '.agents/skills/ai-elements/references/**',
    '.agents/skills/ai-elements/scripts/**',
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
