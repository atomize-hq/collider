import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';

import { JSXPreview, JSXPreviewContent, JSXPreviewError } from './jsx-preview';

const SIMPLE_JSX = `<div class="rounded border border-slate-500 p-4">
  <h1 class="text-lg font-semibold">Hello world</h1>
  <p class="text-sm text-slate-400">Rendered from a JSX string at runtime.</p>
</div>`;

const CARD_JSX = `<div class="rounded-lg border p-4 space-y-2">
  <div class="text-sm font-medium">Card title</div>
  <div class="text-xs text-slate-500">Nested content — supports multiple tags at once.</div>
  <div class="flex gap-2">
    <span class="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">tag</span>
    <span class="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">demo</span>
  </div>
</div>`;

const INVALID_JSX = `<div>Broken<`;

const STREAMING_JSX = `<div class="p-2 rounded border"><p>Streaming still comes through`;

const Demo = ({
  jsx = SIMPLE_JSX,
  isStreaming = false,
}: {
  jsx?: string;
  isStreaming?: boolean;
}) => (
  <div style={{ width: 520 }}>
    <JSXPreview isStreaming={isStreaming} jsx={jsx}>
      <JSXPreviewContent />
      <JSXPreviewError />
    </JSXPreview>
  </div>
);

const meta = {
  title: 'AI Elements/JSX Preview',
  component: JSXPreview,
  args: { jsx: SIMPLE_JSX },
} satisfies Meta<typeof JSXPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo jsx={SIMPLE_JSX} />
      <Demo jsx={CARD_JSX} />
      <Demo isStreaming jsx={STREAMING_JSX} />
    </div>
  ),
};

export const Async: Story = {
  render: () => <Demo jsx={INVALID_JSX} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      const alert = await canvas.findByText(/./i, { selector: 'span' });
      await expect(alert).toBeInTheDocument();
    });
  },
};

export const Docs: Story = {
  render: () => <Demo jsx={CARD_JSX} />,
};
