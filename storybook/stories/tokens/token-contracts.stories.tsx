import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TokenDocsPage } from '../../tokens/token-docs-presenter';

const meta = {
  title: 'Contracts/Tokens',
  component: TokenDocsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Generated token categories and theme metadata rendered directly from CT-5 artifacts.',
      },
    },
  },
  render: () => <TokenDocsPage />,
} satisfies Meta<typeof TokenDocsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByTestId('token-docs-root')).toBeTruthy();
    expect(await canvas.findByTestId('token-docs-themes')).toBeTruthy();
    expect(await canvas.findByTestId('token-group-core')).toBeTruthy();
    expect(await canvas.findByTestId('token-group-semantic')).toBeTruthy();
    expect(await canvas.findByText('semantic.color.background.base')).toBeTruthy();
    expect(await canvas.findByTestId('token-docs-source-path')).toBeTruthy();
  },
};
