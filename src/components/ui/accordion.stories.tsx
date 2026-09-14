import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  title: 'Primitives/Accordion',
  component: Accordion,
  args: {
    type: 'single',
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

function Items({ labelPrefix = '' }: { labelPrefix?: string }) {
  const label = (value: string) => `${labelPrefix}${value}`;

  return (
    <>
      <AccordionItem value="architecture">
        <AccordionTrigger>{label('Architecture')}</AccordionTrigger>
        <AccordionContent>Collider owns the desktop presentation layer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="governance">
        <AccordionTrigger>{label('Governance')}</AccordionTrigger>
        <AccordionContent>Preflight validates the local component contract.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="disabled" disabled>
        <AccordionTrigger>{label('Unavailable section')}</AccordionTrigger>
        <AccordionContent>This section is unavailable.</AccordionContent>
      </AccordionItem>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Accordion className="w-96" collapsible type="single">
      <Items />
    </Accordion>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-12">
      <Accordion className="w-full" defaultValue="architecture" type="single">
        <Items labelPrefix="Single: " />
      </Accordion>
      <Accordion className="w-full" defaultValue={['architecture', 'governance']} type="multiple">
        <Items labelPrefix="Multiple: " />
      </Accordion>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <Accordion className="w-96" collapsible defaultValue="architecture" type="single">
      <Items />
    </Accordion>
  ),
};
