import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { ScrollArea, ScrollBar } from './scroll-area';

const meta = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const rows = Array.from({ length: 20 }, (_, index) => `Log entry ${index + 1}`);
const onViewportKeyDown = fn();

function ScrollFixture({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <ScrollArea
      aria-label={horizontal ? 'Horizontal logs' : 'Vertical logs'}
      className={horizontal ? 'w-72 rounded-md border' : 'h-36 w-64 rounded-md border'}
    >
      <div className={horizontal ? 'flex w-max gap-3 p-3' : 'space-y-2 p-3'}>
        {rows.map((row) => (
          <div className={horizontal ? 'w-32 rounded bg-muted p-3 text-sm' : 'text-sm'} key={row}>
            {row}
          </div>
        ))}
      </div>
      {horizontal && <ScrollBar orientation="horizontal" />}
    </ScrollArea>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-12 p-8">
      <ScrollFixture />
      <ScrollFixture horizontal />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const vertical = canvas
      .getByLabelText('Vertical logs')
      .querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    const horizontal = canvas
      .getByLabelText('Horizontal logs')
      .querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');

    await expect(vertical).not.toBeNull();
    await expect(horizontal).not.toBeNull();
    await waitFor(() =>
      expect((vertical as HTMLElement).scrollHeight).toBeGreaterThan(
        (vertical as HTMLElement).clientHeight
      )
    );
    await waitFor(() =>
      expect((horizontal as HTMLElement).scrollWidth).toBeGreaterThan(
        (horizontal as HTMLElement).clientWidth
      )
    );
  },
};

export const ScrollAction: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onClick={(event) => {
          const root = event.currentTarget.parentElement;
          root?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')?.scrollTo({
            top: 160,
          });
        }}
      >
        Scroll down
      </Button>
      <ScrollFixture />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await expect(viewport).not.toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Scroll down' }));

    await waitFor(() => expect((viewport as HTMLElement).scrollTop).toBeGreaterThan(0));
  },
};

export const Keyboard: Story = {
  render: () => (
    <ScrollArea
      aria-label="Keyboard logs"
      className="h-36 w-64 rounded-md border"
      onKeyDown={onViewportKeyDown}
    >
      <div className="space-y-2 p-3">
        {rows.map((row) => (
          <div className="text-sm" key={row}>
            {row}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    onViewportKeyDown.mockClear();
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await expect(viewport).not.toBeNull();
    (viewport as HTMLElement).focus();
    await userEvent.keyboard('{PageDown}');

    await expect(onViewportKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'PageDown' })
    );
  },
};

export const Focus: Story = {
  render: () => <ScrollFixture />,
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await expect(viewport).not.toBeNull();
    (viewport as HTMLElement).focus();

    await expect(viewport).toHaveFocus();
  },
};
