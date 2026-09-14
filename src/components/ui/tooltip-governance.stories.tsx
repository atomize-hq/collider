import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

const onOpenChange = fn();

function Example({ label, open }: { label: string; open?: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <Button variant="outline">{label}</Button>
        </TooltipTrigger>
        <TooltipContent>{label} content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <div className="flex gap-24 p-16">
      <Example label="Closed tooltip" open={false} />
      <Example label="Open tooltip" open />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Closed tooltip' })).toHaveAttribute(
      'data-state',
      'closed'
    );
    await expect(canvas.getByRole('button', { name: 'Open tooltip' })).toHaveAttribute(
      'data-state',
      'instant-open'
    );
    await expect(within(document.body).getByRole('tooltip')).toHaveTextContent(
      'Open tooltip content'
    );
  },
};

export const OpenAction: Story = {
  render: () => (
    <div className="p-16">
      <TooltipProvider>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger asChild>
            <Button variant="outline">Action tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Action content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    onOpenChange.mockClear();
    const trigger = within(canvasElement).getByRole('button', { name: 'Action tooltip' });
    await userEvent.hover(trigger);

    await expect(await within(document.body).findByRole('tooltip')).toBeVisible();
    await expect(onOpenChange).toHaveBeenCalledWith(true);
  },
};

export const Keyboard: Story = {
  render: () => (
    <div className="p-16">
      <Example label="Keyboard tooltip" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Keyboard tooltip' });
    trigger.focus();
    await expect(await within(document.body).findByRole('tooltip')).toBeVisible();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(within(document.body).queryByRole('tooltip')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const Focus: Story = {
  render: () => (
    <div className="p-16">
      <Example label="Focused tooltip" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Focused tooltip' });
    trigger.focus();

    await expect(trigger).toHaveFocus();
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toBeVisible();

    const themeSurface = canvasElement.querySelector<HTMLElement>('[data-theme]');
    await expect(themeSurface).not.toBeNull();
    const tooltipStyle = getComputedStyle(tooltip);
    const themeStyle = getComputedStyle(themeSurface as HTMLElement);
    await expect(tooltipStyle.backgroundColor).toBe(themeStyle.color);
    await expect(tooltipStyle.color).toBe(themeStyle.backgroundColor);
  },
};
