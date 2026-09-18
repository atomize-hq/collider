import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  type CarouselApi,
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
const onSelectionChange = fn();

function CarouselFixture({ onChange }: { onChange?: (slide: number) => void }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(1);

  React.useEffect(() => {
    if (!api) return;
    const sync = () => {
      const selected = api.selectedScrollSnap() + 1;
      setCurrent(selected);
      onChange?.(selected);
    };
    sync();
    api.on('select', sync);
    return () => {
      api.off('select', sync);
    };
  }, [api, onChange]);

  return (
    <div className="space-y-4 p-16">
      <Carousel aria-label="Workflow phases" className="w-64" setApi={setApi}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <div className="flex h-32 items-center justify-center rounded-lg border bg-card">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <output aria-live="polite">Slide {current} of 3</output>
    </div>
  );
}

export const StateMatrix: Story = {
  render: () => <CarouselFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    );
    await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    await expect(canvas.getByText('Slide 1 of 3')).toBeVisible();
  },
};

export const SelectionAction: Story = {
  render: () => <CarouselFixture onChange={onSelectionChange} />,
  play: async ({ canvasElement }) => {
    onSelectionChange.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));

    await waitFor(() => expect(canvas.getByText('Slide 2 of 3')).toBeVisible());
    await expect(onSelectionChange).toHaveBeenCalledWith(2);
  },
};

export const Keyboard: Story = {
  render: () => <CarouselFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: 'Next slide' });
    next.focus();
    await userEvent.keyboard('{ArrowRight}');

    await waitFor(() => expect(canvas.getByText('Slide 2 of 3')).toBeVisible());
  },
};

export const Focus: Story = {
  render: () => <CarouselFixture />,
  play: async ({ canvasElement }) => {
    const next = within(canvasElement).getByRole('button', { name: 'Next slide' });
    next.focus();

    await expect(next).toHaveFocus();
  },
};
