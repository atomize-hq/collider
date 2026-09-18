import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  title: 'Primitives/Accordion',
  component: Accordion,
  args: {
    type: 'single',
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

const onValueChange = fn();

function TwoItems() {
  return (
    <>
      <AccordionItem value="first">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>First content</AccordionContent>
      </AccordionItem>
      <AccordionItem value="second">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>Second content</AccordionContent>
      </AccordionItem>
    </>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <Accordion className="w-96" defaultValue="first" type="single">
      <TwoItems />
      <AccordionItem disabled value="disabled">
        <AccordionTrigger>Disabled section</AccordionTrigger>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'First section' })).toHaveAttribute(
      'data-state',
      'open'
    );
    await expect(canvas.getByRole('button', { name: 'Second section' })).toHaveAttribute(
      'data-state',
      'closed'
    );
    await expect(canvas.getByRole('button', { name: 'Disabled section' })).toBeDisabled();
  },
};

export const ValueAction: Story = {
  render: () => (
    <Accordion className="w-96" collapsible onValueChange={onValueChange} type="single">
      <TwoItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    onValueChange.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Second section' }));

    await expect(canvas.getByText('Second content')).toBeVisible();
    await expect(onValueChange).toHaveBeenCalledWith('second');
  },
};

export const Keyboard: Story = {
  render: () => (
    <Accordion className="w-96" collapsible type="single">
      <TwoItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'First section' });
    const second = canvas.getByRole('button', { name: 'Second section' });
    first.focus();
    await userEvent.keyboard('{ArrowDown}');

    await expect(second).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Second content')).toBeVisible();
  },
};

export const Focus: Story = {
  render: () => (
    <Accordion className="w-96" collapsible type="single">
      <TwoItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'First section' });
    trigger.focus();

    await expect(trigger).toHaveFocus();
  },
};
