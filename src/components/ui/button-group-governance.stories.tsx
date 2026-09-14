import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './button';
import { ButtonGroup } from './button-group';

const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;
const onGroupAction = fn();

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <ButtonGroup aria-label="Selection states">
        <Button aria-pressed="true" variant="secondary">
          Active
        </Button>
        <Button aria-pressed="false" variant="outline">
          Inactive
        </Button>
        <Button disabled variant="outline">
          Unavailable
        </Button>
      </ButtonGroup>

      <ButtonGroup aria-label="Vertical states" orientation="vertical">
        <Button variant="outline">Ready</Button>
        <Button disabled variant="outline">
          Disabled
        </Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Active' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(canvas.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  },
};

export const SelectionAction: Story = {
  render: () => (
    <ButtonGroup aria-label="Time range">
      <Button onClick={() => onGroupAction('day')} variant="outline">
        Day
      </Button>
      <Button onClick={() => onGroupAction('week')} variant="outline">
        Week
      </Button>
      <Button onClick={() => onGroupAction('month')} variant="outline">
        Month
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    onGroupAction.mockClear();
    const target = within(canvasElement).getByRole('button', { name: 'Week' });

    await userEvent.click(target);
    await expect(onGroupAction).toHaveBeenCalledWith('week');
  },
};

export const Keyboard: Story = {
  render: () => (
    <ButtonGroup aria-label="Run controls">
      <Button onClick={() => onGroupAction('run')} variant="outline">
        Run
      </Button>
      <Button onClick={() => onGroupAction('stop')} variant="outline">
        Stop
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    onGroupAction.mockClear();
    const run = within(canvasElement).getByRole('button', { name: 'Run' });
    run.focus();
    await expect(run).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(onGroupAction).toHaveBeenCalledWith('run');
  },
};

export const Focus: Story = {
  render: () => (
    <ButtonGroup aria-label="Focus order">
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole('button', { name: 'Previous' });
    const next = canvas.getByRole('button', { name: 'Next' });

    previous.focus();
    await expect(previous).toHaveFocus();
    await userEvent.tab();
    await expect(next).toHaveFocus();
  },
};
