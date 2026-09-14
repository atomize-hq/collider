import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
  title: 'Primitives/DropdownMenu',
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const onSelect = fn();
const openMenuParameters = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

function Menu({ open }: { open?: boolean }) {
  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">State menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Available action</DropdownMenuItem>
        <DropdownMenuItem disabled>Unavailable action</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Destructive action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const StateMatrix: Story = {
  parameters: openMenuParameters,
  render: () => (
    <div className="p-16">
      <Menu open />
    </div>
  ),
  play: async () => {
    const body = within(document.body);
    await expect(body.getByRole('menuitem', { name: 'Unavailable action' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(body.getByRole('menuitem', { name: 'Destructive action' })).toHaveAttribute(
      'data-variant',
      'destructive'
    );
  },
};

export const SelectionAction: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Action menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onSelect('open')}>Open project</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Action menu' }));
    await userEvent.click(
      await within(document.body).findByRole('menuitem', { name: 'Open project' })
    );

    await expect(onSelect).toHaveBeenCalledWith('open');
  },
};

export const Keyboard: Story = {
  parameters: openMenuParameters,
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Keyboard menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onSelect('keyboard')}>Keyboard action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    const trigger = within(canvasElement).getByRole('button', { name: 'Keyboard menu' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(within(document.body).getByRole('menu')).toBeVisible());
    await userEvent.keyboard('{Enter}');

    await expect(onSelect).toHaveBeenCalledWith('keyboard');
    await expect(trigger).toHaveFocus();
  },
};

export const Focus: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Focused menu</Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Focused menu' });
    trigger.focus();

    await expect(trigger).toHaveFocus();
  },
};
