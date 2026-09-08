import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StarIcon, TrashIcon } from 'lucide-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TooltipProvider } from '@/components/ui/tooltip';

import { Checkpoint, CheckpointIcon, CheckpointTrigger } from './checkpoint';

const onRestore = fn();

type DemoProps = {
  label?: string;
  triggerLabel?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

const Demo = ({
  label = 'Saved · 2m ago',
  triggerLabel = 'Restore',
  tooltip,
  icon,
  onClick,
}: DemoProps) => (
  <TooltipProvider>
    <div style={{ width: 320 }}>
      <Checkpoint>
        <CheckpointIcon>{icon}</CheckpointIcon>
        <span className="text-sm">{label}</span>
        <CheckpointTrigger tooltip={tooltip} onClick={onClick}>
          {triggerLabel}
        </CheckpointTrigger>
      </Checkpoint>
    </div>
  </TooltipProvider>
);

const meta = {
  title: 'AI Elements/Checkpoint',
  component: Checkpoint,
} satisfies Meta<typeof Checkpoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo tooltip="Restore this checkpoint" />,
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Default: bookmark icon, tooltip */}
      <Demo tooltip="Restore this checkpoint" />
      {/* No tooltip */}
      <Demo triggerLabel="Restore" />
      {/* Custom icon (star) + destructive trigger */}
      <Demo
        label="Pinned · commit 4a7b9"
        triggerLabel="Unpin"
        icon={<StarIcon className="size-4 shrink-0" />}
      />
      {/* Icon-only trigger */}
      <Demo
        label="Auto-saved draft"
        triggerLabel=""
        tooltip="Discard checkpoint"
        icon={<TrashIcon className="size-4 shrink-0" />}
      />
    </div>
  ),
};

export const ClickAction: Story = {
  render: () => <Demo triggerLabel="Restore" onClick={onRestore} />,
  play: async ({ canvasElement }) => {
    onRestore.mockClear();
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /restore/i });
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(onRestore).toHaveBeenCalledTimes(1);
    });
  },
};

export const Keyboard: Story = {
  render: () => <Demo triggerLabel="Restore" onClick={onRestore} />,
  play: async ({ canvasElement }) => {
    onRestore.mockClear();
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /restore/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(onRestore).toHaveBeenCalledTimes(1);
    });
  },
};

export const Focus: Story = {
  render: () => <Demo triggerLabel="Restore" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /restore/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Docs: Story = {
  render: () => <Demo tooltip="Restore this checkpoint" />,
};
