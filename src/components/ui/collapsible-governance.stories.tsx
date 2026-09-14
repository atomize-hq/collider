import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  title: 'Primitives/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem' } as const;
const onOpenChange = fn();

function Example({ label, open }: { label: string; open?: boolean }) {
  return (
    <Collapsible open={open}>
      <CollapsibleTrigger asChild>
        <Button variant="outline">{label}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>Disclosure content for {label}.</CollapsibleContent>
    </Collapsible>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Example label="Closed disclosure" open={false} />
      <Example label="Open disclosure" open />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Closed disclosure' })).toHaveAttribute(
      'data-state',
      'closed'
    );
    await expect(canvas.getByRole('button', { name: 'Open disclosure' })).toHaveAttribute(
      'data-state',
      'open'
    );
    await expect(canvas.getByText('Disclosure content for Open disclosure.')).toBeVisible();
  },
};

export const ToggleAction: Story = {
  render: () => (
    <Collapsible onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>Action content</CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    onOpenChange.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle details' }));

    await expect(canvas.getByText('Action content')).toBeVisible();
    await expect(onOpenChange).toHaveBeenCalledWith(true);
  },
};

export const Keyboard: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline">Keyboard disclosure</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>Keyboard content</CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Keyboard disclosure' });
    trigger.focus();
    await userEvent.keyboard(' ');

    await expect(trigger).toHaveFocus();
    await expect(canvas.getByText('Keyboard content')).toBeVisible();
  },
};

export const Focus: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline">Focused disclosure</Button>
      </CollapsibleTrigger>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Focused disclosure' });
    trigger.focus();

    await expect(trigger).toHaveFocus();
  },
};
