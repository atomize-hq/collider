import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const onAction = fn();
const row = { display: 'flex', alignItems: 'center', gap: '0.75rem' } as const;

export const StateMatrix: Story = {
  render: () => (
    <div style={row}>
      <Button aria-pressed="true" variant="secondary">
        Active
      </Button>
      <Button aria-pressed="false" variant="outline">
        Inactive
      </Button>
      <Button disabled>Disabled</Button>
      <Button aria-invalid>Invalid</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Active' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(canvas.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Invalid' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  },
};

export const SelectionAction: Story = {
  render: () => <Button onClick={() => onAction('save')}>Save changes</Button>,
  play: async ({ canvasElement }) => {
    onAction.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save changes' }));
    await expect(onAction).toHaveBeenCalledWith('save');
  },
};

export const Keyboard: Story = {
  render: () => <Button onClick={() => onAction('run')}>Run preflight</Button>,
  play: async ({ canvasElement }) => {
    onAction.mockClear();
    const button = within(canvasElement).getByRole('button', { name: 'Run preflight' });
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onAction).toHaveBeenCalledWith('run');
  },
};

export const Focus: Story = {
  render: () => <Button variant="outline">Focused action</Button>,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Focused action' });
    button.focus();
    await expect(button).toHaveFocus();
  },
};
