import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from './button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  title: 'Primitives/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

function Example({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Collapsible className="w-80 space-y-2" defaultOpen={defaultOpen}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Advanced options</span>
        <CollapsibleTrigger asChild>
          <Button aria-label="Toggle advanced options" size="icon-sm" variant="ghost">
            <ChevronDownIcon />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-md border p-3 text-sm text-muted-foreground">
        Additional configuration is available here.
      </CollapsibleContent>
    </Collapsible>
  );
}

export const Default: Story = {
  render: () => <Example />,
};

export const Docs: Story = {
  render: () => <Example defaultOpen />,
};
