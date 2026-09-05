import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowRightIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const row = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  flexWrap: 'wrap',
} as const;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem' } as const;

export const Default: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <div style={row}>
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <div style={row}>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        {/* `icon-sm` is a Collider addition, not upstream — ai-elements toolbars need a
            32px icon button and would otherwise set h-8 w-8 at every call site. */}
        <Button aria-label="Add" size="icon-sm">
          <PlusIcon />
        </Button>
        <Button aria-label="Delete" size="icon">
          <Trash2Icon />
        </Button>
      </div>

      <div style={row}>
        <Button disabled>Disabled</Button>
        <Button disabled variant="destructive">
          Disabled destructive
        </Button>
        <Button variant="outline">
          Trailing icon
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={row}>
      <Button variant="default">Save</Button>
      {/* Solid destructive reads on `--destructive-surface`, never on `--destructive`,
          which is a text colour and gives 2.89:1 under white. */}
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  ),
};
