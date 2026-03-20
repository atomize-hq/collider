import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Contracts/Generated Tokens',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TokenRegistry: Story = {};
