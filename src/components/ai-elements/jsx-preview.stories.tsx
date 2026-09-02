import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';

import { JSXPreview, JSXPreviewContent, JSXPreviewError } from './jsx-preview';

const SHOWCASE_JSX = `<div className="rounded-lg border bg-card p-6 shadow-sm">
  <div className="flex items-center gap-4 mb-4">
    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
      <span className="text-primary-foreground text-xl font-bold">AI</span>
    </div>
    <div>
      <h2 className="text-lg font-semibold">AI-Generated Component</h2>
      <p className="text-sm text-muted-foreground">Rendered from JSX string</p>
    </div>
  </div>
  <div className="space-y-3">
    <p className="text-sm">This component was dynamically rendered from a JSX string. The JSXPreview component supports streaming mode, automatically closing unclosed tags as content arrives.</p>
    <div className="flex gap-2">
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">React</span>
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Streaming</span>
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">Dynamic</span>
    </div>
  </div>
  <div className="mt-4 pt-4 border-t">
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground">Generated just now</span>
      <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
        Learn more
      </button>
    </div>
  </div>
</div>`;

const CARD_JSX = `<div className="rounded-lg border p-4 space-y-2">
  <div className="text-sm font-medium">Card title</div>
  <div className="text-xs text-muted-foreground">Nested content — supports multiple tags at once.</div>
  <div className="flex gap-2">
    <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">tag</span>
    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">demo</span>
  </div>
</div>`;

const INVALID_JSX = `<div>Broken<`;

const STREAMING_JSX = `<div className="p-2 rounded border"><p>Streaming still comes through`;

const Demo = ({
  jsx = SHOWCASE_JSX,
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
  args: { jsx: SHOWCASE_JSX },
} satisfies Meta<typeof JSXPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo jsx={SHOWCASE_JSX} />
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
  render: () => <Demo jsx={SHOWCASE_JSX} />,
};
