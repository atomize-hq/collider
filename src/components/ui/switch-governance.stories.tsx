import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Switch } from './switch';

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem' } as const;
const onCheckedChange = fn();

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Switch aria-label="Unchecked switch" />
      <Switch aria-label="Checked switch" defaultChecked />
      <Switch aria-label="Disabled switch" disabled />
      <Switch aria-label="Disabled checked switch" defaultChecked disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('switch', { name: 'Unchecked switch' })).not.toBeChecked();
    await expect(canvas.getByRole('switch', { name: 'Checked switch' })).toBeChecked();
    await expect(canvas.getByRole('switch', { name: 'Disabled switch' })).toBeDisabled();
  },
};

export const CheckedAction: Story = {
  render: () => <Switch aria-label="Action switch" onCheckedChange={onCheckedChange} />,
  play: async ({ canvasElement }) => {
    onCheckedChange.mockClear();
    const toggle = within(canvasElement).getByRole('switch', { name: 'Action switch' });

    await userEvent.click(toggle);

    await expect(toggle).toBeChecked();
    await expect(onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const Keyboard: Story = {
  render: () => <Switch aria-label="Keyboard switch" />,
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Keyboard switch' });
    toggle.focus();
    await userEvent.keyboard(' ');

    await expect(toggle).toHaveFocus();
    await expect(toggle).toBeChecked();
  },
};

export const Focus: Story = {
  render: () => <Switch aria-label="Focused switch" />,
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Focused switch' });
    toggle.focus();

    await expect(toggle).toHaveFocus();
  },
};
