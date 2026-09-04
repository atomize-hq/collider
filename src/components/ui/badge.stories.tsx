import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckCircle2Icon, CircleIcon, XCircleIcon } from 'lucide-react';

import { Badge } from './badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

const row = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  flexWrap: 'wrap',
} as const;

export const Default: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={row}>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div style={row}>
        <Badge className="gap-1" variant="success">
          <CheckCircle2Icon className="size-3" />
          Success
        </Badge>
        <Badge className="gap-1" variant="error">
          <XCircleIcon className="size-3" />
          Error
        </Badge>
        <Badge className="gap-1" variant="warning">
          <CircleIcon className="size-3" />
          Warning
        </Badge>
      </div>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={row}>
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
