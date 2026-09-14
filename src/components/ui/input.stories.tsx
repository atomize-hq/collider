import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from './input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
  args: {
    'aria-label': 'Project name',
    placeholder: 'Project name',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '18rem' } as const;

export const Default: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Input aria-label="Text input" placeholder="Text" />
      <Input aria-label="Email input" placeholder="name@example.com" type="email" />
      <Input aria-label="Password input" defaultValue="password" type="password" />
      <Input aria-label="File input" type="file" />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={stack}>
      <label htmlFor="repository">Repository</label>
      <Input id="repository" placeholder="atomize-hq/collider" />
    </div>
  ),
};
