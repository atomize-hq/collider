import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Input } from './input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '18rem' } as const;
const onChange = fn();

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Input aria-label="Placeholder input" placeholder="Placeholder" />
      <Input aria-label="Filled input" defaultValue="Filled" />
      <Input aria-label="Disabled input" disabled value="Disabled" readOnly />
      <Input aria-invalid aria-label="Invalid input" defaultValue="Invalid" />
      <Input aria-label="Read-only input" readOnly value="Read only" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox', { name: 'Disabled input' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Invalid input' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await expect(canvas.getByRole('textbox', { name: 'Read-only input' })).toHaveAttribute(
      'readonly'
    );
  },
};

export const ChangeAction: Story = {
  render: () => <Input aria-label="Action input" onChange={onChange} />,
  play: async ({ canvasElement }) => {
    onChange.mockClear();
    const input = within(canvasElement).getByRole('textbox', { name: 'Action input' });

    await userEvent.type(input, 'Collider');

    await expect(input).toHaveValue('Collider');
    await expect(onChange).toHaveBeenCalled();
  },
};

export const Keyboard: Story = {
  render: () => <Input aria-label="Keyboard input" />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Keyboard input' });
    input.focus();
    await userEvent.keyboard('Keyboard entry');

    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('Keyboard entry');
  },
};

export const Focus: Story = {
  render: () => <Input aria-label="Focused input" />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Focused input' });
    input.focus();

    await expect(input).toHaveFocus();
  },
};
