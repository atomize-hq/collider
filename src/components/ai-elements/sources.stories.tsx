import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Source, Sources, SourcesContent, SourcesTrigger } from './sources';

const SAMPLE_SOURCES = [
  { title: 'Design tokens — Collider', href: 'https://example.com/tokens' },
  { title: 'shadcn token bridge', href: 'https://example.com/bridge' },
  { title: 'ai-elements registry', href: 'https://example.com/registry' },
];

const withSources = () => (
  <SourcesContent>
    {SAMPLE_SOURCES.map((s) => (
      <Source key={s.href} href={s.href} title={s.title} />
    ))}
  </SourcesContent>
);

const meta = {
  title: 'AI Elements/Sources',
  component: Sources,
} satisfies Meta<typeof Sources>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sources defaultOpen>
      <SourcesTrigger count={SAMPLE_SOURCES.length} />
      {withSources()}
    </Sources>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* collapsed */}
      <Sources defaultOpen={false}>
        <SourcesTrigger count={SAMPLE_SOURCES.length} />
        {withSources()}
      </Sources>
      {/* expanded */}
      <Sources defaultOpen>
        <SourcesTrigger count={SAMPLE_SOURCES.length} />
        {withSources()}
      </Sources>
    </div>
  ),
};

export const Focus: Story = {
  render: () => (
    <Sources defaultOpen>
      <SourcesTrigger count={SAMPLE_SOURCES.length} />
      {withSources()}
    </Sources>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The disclosure trigger is the only button; Source items are links.
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Sources defaultOpen={false}>
      <SourcesTrigger count={SAMPLE_SOURCES.length} />
      {withSources()}
    </Sources>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const ExpandCollapseFlow: Story = {
  render: () => (
    <Sources defaultOpen={false}>
      <SourcesTrigger count={SAMPLE_SOURCES.length} />
      {withSources()}
    </Sources>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    // Closed: source links are not mounted.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText('shadcn token bridge')).not.toBeInTheDocument();

    // Expand: the source list mounts.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText('shadcn token bridge')).toBeInTheDocument();

    // Collapse again.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CollapseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => (
    <Sources defaultOpen>
      <SourcesTrigger count={SAMPLE_SOURCES.length} />
      {withSources()}
    </Sources>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Docs: Story = {
  render: () => (
    <Sources defaultOpen>
      <SourcesTrigger count={2} />
      <SourcesContent>
        <Source href="https://example.com/tokens" title="Design tokens — Collider" />
        <Source href="https://example.com/bridge" title="shadcn token bridge" />
      </SourcesContent>
    </Sources>
  ),
};
