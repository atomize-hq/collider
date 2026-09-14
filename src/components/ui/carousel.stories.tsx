import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';

const meta = {
  title: 'Primitives/Carousel',
  component: Carousel,
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

const slides = ['Plan', 'Build', 'Review'];

function Slide({ label }: { label: string }) {
  return (
    <div className="flex h-36 items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm">
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Example({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <Carousel
      aria-label={`${orientation} workflow carousel`}
      className="w-64"
      orientation={orientation}
    >
      <CarouselContent className={orientation === 'vertical' ? 'h-36' : undefined}>
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Slide label={slide} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export const Default: Story = {
  render: () => (
    <div className="p-16">
      <Example />
    </div>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-28 p-16">
      <Example />
      <Example orientation="vertical" />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div className="p-16">
      <Carousel aria-label="Project phases" className="w-64">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <Slide label={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
