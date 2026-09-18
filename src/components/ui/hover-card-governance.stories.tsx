import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta = {
  title: 'Primitives/HoverCard',
  component: HoverCard,
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

function Example({ open, label }: { open?: boolean; label: string }) {
  return (
    <HoverCard closeDelay={0} open={open} openDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="link">{label}</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <h4 className="text-sm font-semibold">Collider</h4>
        <p className="text-sm text-muted-foreground">Token-driven desktop interface.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '4rem', padding: '4rem' }}>
      <Example label="Closed state" open={false} />
      <Example label="Open state" open />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Closed state' })).toHaveAttribute(
      'data-state',
      'closed'
    );
    await expect(canvas.getByRole('button', { name: 'Open state' })).toHaveAttribute(
      'data-state',
      'open'
    );
    await expect(within(document.body).getByText('Token-driven desktop interface.')).toBeVisible();
  },
};

export const Keyboard: Story = {
  render: () => (
    <div style={{ padding: '4rem' }}>
      <Example label="Keyboard trigger" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Keyboard trigger' });
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await expect(
      await within(document.body).findByText('Token-driven desktop interface.')
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(document.body).queryByText('Token-driven desktop interface.')).toBeNull()
    );
    await expect(trigger).toHaveFocus();
  },
};

export const Focus: Story = {
  render: () => (
    <div style={{ padding: '4rem' }}>
      <Example label="Focused trigger" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Focused trigger' });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};
