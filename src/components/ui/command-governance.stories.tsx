import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from './command';

const meta = {
  title: 'Primitives/Command',
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

const onSelect = fn();
const frame = { width: '20rem', border: '1px solid var(--border)', borderRadius: '0.5rem' };

export const StateMatrix: Story = {
  render: () => (
    <Command label="Available commands" style={frame}>
      <CommandInput aria-label="Available commands" placeholder="Available" />
      <CommandList>
        <CommandGroup heading="Actions">
          <CommandItem>Run preflight</CommandItem>
          <CommandItem disabled>Unavailable action</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Unavailable action')).toHaveAttribute('aria-disabled', 'true');
  },
};

export const SelectionAction: Story = {
  render: () => (
    <Command label="Selectable commands" style={frame}>
      <CommandList>
        <CommandItem onSelect={() => onSelect('run')}>Run preflight</CommandItem>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    await userEvent.click(within(canvasElement).getByText('Run preflight'));
    await expect(onSelect).toHaveBeenCalledWith('run');
  },
};

export const Keyboard: Story = {
  render: () => (
    <Command label="Keyboard commands" style={frame}>
      <CommandInput aria-label="Keyboard commands" placeholder="Type a command…" />
      <CommandList>
        <CommandItem onSelect={() => onSelect('run')}>Run preflight</CommandItem>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    const input = within(canvasElement).getByRole('combobox', { name: 'Keyboard commands' });
    input.focus();
    await expect(input).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(onSelect).toHaveBeenCalledWith('run');
  },
};

export const Focus: Story = {
  render: () => (
    <Command label="Focused command" style={frame}>
      <CommandInput aria-label="Focused command" placeholder="Search…" />
      <CommandList>
        <CommandItem>First result</CommandItem>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Focused command' });
    input.focus();
    await expect(input).toHaveFocus();
  },
};
