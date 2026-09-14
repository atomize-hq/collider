import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ScrollArea, ScrollBar } from './scroll-area';

const meta = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const entries = Array.from({ length: 12 }, (_, index) => `Activity ${index + 1}`);

function VerticalExample() {
  return (
    <ScrollArea aria-label="Recent activity" className="h-40 w-64 rounded-md border">
      <div className="p-4">
        <h3 className="mb-3 text-sm font-medium">Recent activity</h3>
        {entries.map((entry) => (
          <div className="border-b py-2 text-sm last:border-b-0" key={entry}>
            {entry}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function HorizontalExample() {
  return (
    <ScrollArea aria-label="Project timeline" className="w-80 rounded-md border whitespace-nowrap">
      <div className="flex w-max gap-3 p-4">
        {entries.slice(0, 6).map((entry) => (
          <div className="w-36 rounded-md bg-muted p-4 text-sm" key={entry}>
            {entry}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export const Default: Story = {
  render: () => <VerticalExample />,
};

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-16 p-8">
      <VerticalExample />
      <HorizontalExample />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <ScrollArea aria-label="Compact activity list" className="h-28 w-56 rounded-md border">
      <div className="space-y-2 p-3 text-sm">
        {entries.slice(0, 8).map((entry) => (
          <p key={entry}>{entry}</p>
        ))}
      </div>
    </ScrollArea>
  ),
};
