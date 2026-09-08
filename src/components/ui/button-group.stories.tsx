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
  // KNOWN BROKEN — characterization, not acceptance. This asserts today's defect so the
  // migration has something that visibly changes. Replace it with the desired-state
  // assertion in the same commit that migrates Select; a green test encoding the defect
  // is a sentinel, never proof the composition works.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Environment' });
    const group = trigger.closest('[data-slot="button-group"]')!;

    // Run buttonGroupVariants' own selector rather than checking an attribute on one
    // element: this is the query the two CSS rules make, so an empty result IS the
    // defect. Post-migration it returns the trigger, and the desired-state assertion
    // then has to prove the resulting width and corner radius, which this cannot.
    expect(group.querySelectorAll('[data-slot="select-trigger"]')).toHaveLength(0);
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
