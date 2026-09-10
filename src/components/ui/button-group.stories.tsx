import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from 'lucide-react';

import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <ButtonGroup>
        <Button aria-label="Align left" size="icon" variant="outline">
          <AlignLeftIcon />
        </Button>
        <Button aria-label="Align center" size="icon" variant="outline">
          <AlignCenterIcon />
        </Button>
        <Button aria-label="Align right" size="icon" variant="outline">
          <AlignRightIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup orientation="vertical">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>

      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Button variant="outline">example.com</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Copy</Button>
      </ButtonGroup>

      {/* The trailing trigger must keep its outer corners beside Radix's hidden select. */}
      <ButtonGroup>
        <Button variant="outline">Branch</Button>
        <Select>
          <SelectTrigger aria-label="Environment">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">Development</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
          </SelectContent>
        </Select>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Environment' });
    const group = trigger.closest('[data-slot="button-group"]')!;

    expect(group.querySelectorAll('[data-slot="select-trigger"]')).toHaveLength(1);
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    const style = getComputedStyle(trigger);
    expect(parseFloat(style.borderTopRightRadius)).toBeGreaterThan(0);
    expect(parseFloat(style.borderBottomRightRadius)).toBeGreaterThan(0);
    expect(parseFloat(style.borderTopLeftRadius)).toBe(0);
    expect(parseFloat(style.borderBottomLeftRadius)).toBe(0);
    // Select intentionally has w-full. The group's conditional w-fit selector must
    // not override an explicit width; slot repair is not a component redesign.
    expect(trigger).toHaveClass('w-full');
  },
};

export const Docs: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Previous</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
};
