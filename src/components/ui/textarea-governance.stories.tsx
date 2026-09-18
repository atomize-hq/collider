import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Textarea } from './textarea';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem' } as const;
const onChange = fn();

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Textarea aria-label="Placeholder textarea" placeholder="Placeholder" />
      <Textarea aria-label="Filled textarea" defaultValue="Filled" />
      <Textarea aria-label="Disabled textarea" disabled value="Disabled" readOnly />
      <Textarea aria-invalid aria-label="Invalid textarea" defaultValue="Invalid" />
      <Textarea aria-label="Read-only textarea" readOnly value="Read only" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox', { name: 'Disabled textarea' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Invalid textarea' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await expect(canvas.getByRole('textbox', { name: 'Read-only textarea' })).toHaveAttribute(
      'readonly'
    );
  },
};

export const ChangeAction: Story = {
  render: () => <Textarea aria-label="Action textarea" onChange={onChange} />,
  play: async ({ canvasElement }) => {
    onChange.mockClear();
    const textarea = within(canvasElement).getByRole('textbox', { name: 'Action textarea' });

    await userEvent.type(textarea, 'Multiline context');

    await expect(textarea).toHaveValue('Multiline context');
    await expect(onChange).toHaveBeenCalled();
  },
};

export const Keyboard: Story = {
  render: () => <Textarea aria-label="Keyboard textarea" />,
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', { name: 'Keyboard textarea' });
    textarea.focus();
    await userEvent.keyboard('First line{Enter}Second line');

    await expect(textarea).toHaveFocus();
    await expect(textarea).toHaveValue('First line\nSecond line');
  },
};

export const Focus: Story = {
  render: () => <Textarea aria-label="Focused textarea" />,
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', { name: 'Focused textarea' });
    textarea.focus();

    await expect(textarea).toHaveFocus();
  },
};
