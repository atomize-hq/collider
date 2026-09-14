import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Textarea } from './textarea';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Description',
    placeholder: 'Describe the task',
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  maxWidth: '24rem',
} as const;

export const Default: Story = {};

export const Docs: Story = {
  render: () => (
    <div style={stack}>
      <label htmlFor="context">Context</label>
      <Textarea id="context" placeholder="Add the context needed to complete this task." />
    </div>
  ),
};
