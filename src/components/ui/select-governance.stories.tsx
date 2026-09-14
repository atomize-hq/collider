import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const meta = {
  title: 'Primitives/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '18rem' } as const;
const onSelectionChange = fn();

// Scoped to stories that open the listbox. Radix implements modality by setting
// `aria-hidden` on the background without `inert`, so axe reports the hidden trigger
// even though focus is held inside the portalled listbox.
const openSelectParameters = {
  a11y: {
    config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
  },
};

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Select>
        <SelectTrigger aria-label="Empty model selection">
          <SelectValue placeholder="Nothing selected" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="sonnet">
        <SelectTrigger aria-label="Selected model">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sonnet">Claude Sonnet</SelectItem>
        </SelectContent>
      </Select>

      <Select disabled>
        <SelectTrigger aria-label="Disabled model selection">
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger aria-invalid aria-label="Invalid model selection">
          <SelectValue placeholder="Selection required" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Selected model' })).toHaveTextContent(
      'Claude Sonnet'
    );
    await expect(canvas.getByRole('combobox', { name: 'Disabled model selection' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Invalid model selection' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  },
};

export const SelectionAction: Story = {
  parameters: openSelectParameters,
  render: () => (
    <div style={{ maxWidth: '18rem' }}>
      <Select onValueChange={onSelectionChange}>
        <SelectTrigger aria-label="Action model">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
          <SelectItem value="sonnet">Claude Sonnet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    onSelectionChange.mockClear();
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Action model' });

    await userEvent.click(trigger);
    await userEvent.click(within(document.body).getByRole('option', { name: 'Claude Sonnet' }));

    await waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith('sonnet'));
    await expect(trigger).toHaveTextContent('Claude Sonnet');
  },
};

export const Keyboard: Story = {
  parameters: openSelectParameters,
  render: () => (
    <div style={{ maxWidth: '18rem' }}>
      <Select defaultValue="opus">
        <SelectTrigger aria-label="Keyboard model">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
          <SelectItem value="sonnet">Claude Sonnet</SelectItem>
          <SelectItem value="haiku">Claude Haiku</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Keyboard model' });
    trigger.focus();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(within(document.body).getByRole('option', { name: 'Claude Opus' })).toBeVisible()
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(trigger).toHaveTextContent('Claude Sonnet'));
    await expect(trigger).toHaveFocus();
  },
};

export const Focus: Story = {
  render: () => (
    <div style={{ maxWidth: '18rem' }}>
      <Select>
        <SelectTrigger aria-label="Focused model">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Focused model' });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};
