import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/app/**/*.{ts,tsx}'],
  project: ['src/**/*.{ts,tsx}'],
  ignoreDependencies: ['@vitest/coverage-v8', '@figma/code-connect'],
};

export default config;
