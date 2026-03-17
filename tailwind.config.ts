import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './storybook/stories/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: 'var(--color-background-base)',
          surface: 'var(--color-background-surface)',
          elevated: 'var(--color-background-elevated)',
          overlay: 'var(--color-background-overlay)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          dim: 'var(--color-text-dim)',
          success: 'var(--color-text-success)',
          error: 'var(--color-text-error)',
          warning: 'var(--color-text-warning)',
          caution: 'var(--color-text-caution)',
          info: 'var(--color-text-info)',
          ai: 'var(--color-text-ai)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
