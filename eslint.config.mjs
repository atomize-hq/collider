import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    '.next/**',
    '.agents/**',
    '.claude/**',
    'out/**',
    'src-tauri/**',
    'storybook-static/**',
    'next-env.d.ts',
    'src/components/ai-elements/reasoning.tsx',
    'src/components/ai-elements/shimmer.tsx',
  ]),
]);

export default eslintConfig;
