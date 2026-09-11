import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StarIcon, TrashIcon } from 'lucide-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TooltipProvider } from '@/components/ui/tooltip';

import { Checkpoint, CheckpointIcon, CheckpointTrigger } from './checkpoint';

const onRestore = fn();

type DemoProps = {
  label?: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  tooltip?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

const Demo = ({
  label = 'Saved · 2m ago',
  triggerLabel = 'Restore',
  triggerIcon,
  tooltip,
  icon,
  onClick,
}: DemoProps) => (
  <TooltipProvider>
    <div style={{ width: 320 }}>
      <Checkpoint>
        <CheckpointIcon>{icon}</CheckpointIcon>
        <span className="shrink-0 text-sm whitespace-nowrap">{label}</span>
        <CheckpointTrigger
          aria-label={triggerIcon ? triggerLabel : undefined}
          size={triggerIcon ? 'icon-sm' : 'sm'}
          tooltip={tooltip}
          onClick={onClick}
        >
          {triggerIcon ?? triggerLabel}
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Saved · 2m ago');
    const trigger = canvas.getByRole('button', { name: 'Restore' });
    const row = label.parentElement!;
    const separator = row.lastElementChild!;
    const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
    await expect(Number.isFinite(lineHeight)).toBe(true);
    await expect(label.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight + 1);
    await expect(separator.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(trigger.getBoundingClientRect().right).toBeLessThanOrEqual(
      separator.getBoundingClientRect().left
    );
    await expect(separator.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right + 1
    );
  },
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
        triggerLabel="Discard checkpoint"
        triggerIcon={<TrashIcon />}
        tooltip="Discard checkpoint"
        icon={<TrashIcon className="size-4 shrink-0" />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const discard = canvas.getByRole('button', { name: 'Discard checkpoint' });
    await expect(discard).toBeVisible();
    await expect(discard.querySelector('svg')).toBeVisible();
  },
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
