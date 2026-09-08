import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FileIcon, GitBranchIcon, SettingsIcon, TerminalIcon } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';

const meta = {
  title: 'Primitives/Command',
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

const frame = {
  maxWidth: '28rem',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
} as const;

export const Default: Story = {
  render: () => (
    <Command style={frame}>
      <CommandInput aria-label="Search commands" placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <TerminalIcon className="mr-2 size-4" />
            Run preflight
          </CommandItem>
          <CommandItem>
            <GitBranchIcon className="mr-2 size-4" />
            Switch branch
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <Command style={frame}>
      <CommandInput aria-label="Search commands" placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Files">
          <CommandItem>
            <FileIcon className="mr-2 size-4" />
            Open file
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <SettingsIcon className="mr-2 size-4" />
            Preferences
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem disabled>Disabled item</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // cmdk puts role="combobox" on both the Command root and the input, so a role+name
    // query is ambiguous. The placeholder is unique.
    await userEvent.type(canvas.getByPlaceholderText('Type a command…'), 'pref');
    await waitFor(() => expect(canvas.getByText('Preferences')).toBeVisible());
    expect(canvas.queryByText('Open file')).toBeNull();

    // `CommandDialog` is deliberately absent — it pulls in the dialog primitive for a
    // subcomponent nothing here uses. Enforced by upstream-policy.json.
    expect(canvas.queryByRole('dialog')).toBeNull();
  },
};

export const Docs: Story = {
  render: () => (
    <Command style={frame}>
      <CommandInput aria-label="Search" placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>First</CommandItem>
          <CommandItem>Second</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
