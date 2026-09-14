import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckIcon } from 'lucide-react';

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from './avatar';

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: '1rem' } as const;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={row}>
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
        <AvatarBadge>
          <CheckIcon />
        </AvatarBadge>
      </Avatar>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <AvatarGroup aria-label="Reviewers">
      <Avatar>
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>CM</AvatarFallback>
      </Avatar>
      <AvatarGroupCount aria-label="Two more reviewers">+2</AvatarGroupCount>
    </AvatarGroup>
  ),
};
