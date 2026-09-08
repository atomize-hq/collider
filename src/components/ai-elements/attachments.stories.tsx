import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import {
  Attachment,
  type AttachmentData,
  AttachmentEmpty,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from './attachments';

const IMAGE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234f46e5"/><stop offset="1" stop-color="%23a855f7"/></linearGradient></defs><rect fill="url(%23g)" width="96" height="96"/><circle cx="48" cy="48" r="20" fill="%23ffffff" fill-opacity="0.9"/></svg>'
  );

const SAMPLE: AttachmentData[] = [
  { id: 'a1', type: 'file', mediaType: 'image/png', url: IMAGE_SVG, filename: 'hero.png' },
  { id: 'a2', type: 'file', mediaType: 'application/pdf', url: '', filename: 'design-spec.pdf' },
  { id: 'a3', type: 'file', mediaType: 'audio/mpeg', url: '', filename: 'meeting-notes.mp3' },
];

type DemoProps = {
  variant?: 'grid' | 'inline' | 'list';
  items?: AttachmentData[];
  onRemove?: (id: string) => void;
};

const Demo = ({ variant = 'grid', items = SAMPLE, onRemove }: DemoProps) => (
  <div style={{ width: 480 }}>
    <Attachments variant={variant}>
      {items.map((item) => (
        <Attachment
          key={item.id}
          data={item}
          onRemove={onRemove ? () => onRemove(item.id) : undefined}
        >
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  </div>
);

const meta = {
  title: 'AI Elements/Attachments',
  component: Attachments,
  args: { variant: 'grid' },
} satisfies Meta<typeof Attachments>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo onRemove={() => undefined} />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Grid — image tile + doc + audio icons */}
      <Demo variant="grid" onRemove={() => undefined} />
      {/* Inline — chip strip */}
      <Demo variant="inline" onRemove={() => undefined} />
      {/* List — row layout */}
      <Demo variant="list" onRemove={() => undefined} />
      {/* Empty state */}
      <div style={{ width: 480 }}>
        <Attachments variant="list">
          <AttachmentEmpty />
        </Attachments>
      </div>
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo variant="list" onRemove={() => undefined} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const removes = await canvas.findAllByRole('button', { name: /remove/i });
    removes[0]?.focus();
    await expect(removes[0]).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo variant="list" onRemove={() => undefined} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const removes = await canvas.findAllByRole('button', { name: /remove/i });
    removes[0]?.focus();
    await userEvent.tab();
    await expect(removes[1]).toHaveFocus();
  },
};

const RemoveFlowDemo = () => {
  const [items, setItems] = useState<AttachmentData[]>(SAMPLE);
  return (
    <Demo
      variant="list"
      items={items}
      onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
    />
  );
};

export const RemoveFlow: Story = {
  render: () => <RemoveFlowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let removes = await canvas.findAllByRole('button', { name: /remove/i });
    await expect(removes).toHaveLength(3);
    await userEvent.click(removes[0]!);
    removes = await canvas.findAllByRole('button', { name: /remove/i });
    await expect(removes).toHaveLength(2);
  },
};

export const RemoveTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <RemoveFlowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const removes = await canvas.findAllByRole('button', { name: /remove/i });
    await userEvent.click(removes[0]!);
  },
};

export const Docs: Story = {
  render: () => <Demo onRemove={() => undefined} />,
};
