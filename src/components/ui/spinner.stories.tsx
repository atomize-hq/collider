import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Spinner } from './spinner';

const meta = {
  title: 'Primitives/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: '1rem' } as const;

export const Default: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div style={row}>
      <Spinner aria-label="Small loading indicator" className="size-3" />
      <Spinner aria-label="Default loading indicator" />
      <Spinner aria-label="Large loading indicator" className="size-6" />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={row}>
      <Spinner />
      <span>Loading results</span>
    </div>
  ),
};
