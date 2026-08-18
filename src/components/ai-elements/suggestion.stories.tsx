import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Suggestion, Suggestions } from './suggestion';

const SUGGESTIONS = [
  'Explain the token bridge',
  'Show the Figma variables',
  'List the ai-elements primitives',
];

// Module-scoped so play functions can assert the selection callback fired.
const onSelect = fn();

const meta = {
  title: 'AI Elements/Suggestion',
  component: Suggestions,
} satisfies Meta<typeof Suggestions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Suggestions>
      {SUGGESTIONS.map((suggestion) => (
        <Suggestion key={suggestion} suggestion={suggestion} />
      ))}
    </Suggestions>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <Suggestions>
      <Suggestion suggestion="Outline (default)" />
      <Suggestion suggestion="Secondary" variant="secondary" />
      <Suggestion suggestion="Ghost" variant="ghost" />
      <Suggestion disabled suggestion="Disabled" />
    </Suggestions>
  ),
};

export const ClickAction: Story = {
  render: () => (
    <Suggestions>
      {SUGGESTIONS.map((suggestion) => (
        <Suggestion key={suggestion} onClick={onSelect} suggestion={suggestion} />
      ))}
    </Suggestions>
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    const canvas = within(canvasElement);
    const target = await canvas.findByRole('button', { name: 'Explain the token bridge' });

    // Clicking a suggestion emits its text to onClick.
    await userEvent.click(target);
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('Explain the token bridge');
    });
  },
};

export const Keyboard: Story = {
  render: () => (
    <Suggestions>
      {SUGGESTIONS.map((suggestion) => (
        <Suggestion key={suggestion} onClick={onSelect} suggestion={suggestion} />
      ))}
    </Suggestions>
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    const canvas = within(canvasElement);
    const target = await canvas.findByRole('button', { name: 'Show the Figma variables' });

    // Native button: focus + Enter activates the suggestion.
    target.focus();
    await expect(target).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('Show the Figma variables');
    });
  },
};

export const Focus: Story = {
  render: () => (
    <Suggestions>
      {SUGGESTIONS.map((suggestion) => (
        <Suggestion key={suggestion} suggestion={suggestion} />
      ))}
    </Suggestions>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = await canvas.findByRole('button', { name: 'Explain the token bridge' });
    target.focus();
    await expect(target).toHaveFocus();
  },
};

export const Docs: Story = {
  render: () => (
    <Suggestions>
      <Suggestion suggestion="Summarize this thread" />
      <Suggestion suggestion="What changed in the last commit?" />
      <Suggestion suggestion="Draft a follow-up" />
    </Suggestions>
  ),
};
