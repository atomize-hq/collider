import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CopyIcon, MoreHorizontalIcon, SettingsIcon, Trash2Icon } from 'lucide-react';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
  title: 'Primitives/DropdownMenu',
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const openMenuParameters = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open actions" size="icon-sm" variant="outline">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <CopyIcon /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon /> Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const VariantMatrix: Story = {
  parameters: openMenuParameters,
  render: () => (
    <div className="p-16">
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Workspace menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuItem>
            <CopyIcon /> Copy path <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Show hidden files</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="compact">
            <DropdownMenuRadioItem value="compact">Compact density</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="comfortable">Comfortable density</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Open in</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Editor</DropdownMenuItem>
              <DropdownMenuItem>Terminal</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2Icon /> Delete workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>First action</DropdownMenuItem>
        <DropdownMenuItem disabled>Unavailable action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
