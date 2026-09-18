import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Progress } from './progress';

const meta = {
  title: 'Primitives/Progress',
  component: Progress,
  args: {
    'aria-label': 'Upload progress',
    value: 50,
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', width: '20rem' } as const;

export const Default: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      {[0, 25, 50, 75, 100].map((value) => (
        <Progress aria-label={`${value}% complete`} key={value} value={value} />
      ))}
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={stack}>
      <span>Indexing repository: 68%</span>
      <Progress aria-label="Indexing repository" value={68} />
    </div>
  ),
};
