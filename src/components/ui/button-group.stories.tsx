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

      {/* The composition the primitive claims to support and currently does not.
          buttonGroupVariants ships two rules aimed at `[data-slot=select-trigger]`
          — one rounds the trailing corners, one shrinks the trigger to fit. Only the
          v4 Select emits that slot; ours emits none, so both rules are inert and the
          trigger renders full-width with square corners. `just check-contract` reports
          this as CONTRACT_SLOT_DEAD. */}
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

    // Pins the dead slot. Our Select emits no `data-slot`, so ButtonGroup's rules cannot
    // reach it. After the v4 migration this becomes `toBe('select-trigger')` and the
    // width rule takes effect.
    expect(trigger.getAttribute('data-slot')).toBeNull();
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
