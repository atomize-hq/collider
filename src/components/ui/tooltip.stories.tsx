import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { InfoIcon } from 'lucide-react';

import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

function Example({ label, side = 'top' }: { label: string; side?: 'top' | 'right' | 'bottom' }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label={label} size="icon-sm" variant="outline">
            <InfoIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const Default: Story = {
  render: () => (
    <div className="p-16">
      <Example label="More information" />
    </div>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex gap-24 p-24">
      <Example label="Tooltip above" side="top" />
      <Example label="Tooltip beside" side="right" />
      <Example label="Tooltip below" side="bottom" />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div className="p-16">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover or focus</Button>
          </TooltipTrigger>
          <TooltipContent>Concise supplemental guidance</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};
