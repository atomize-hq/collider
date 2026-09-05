import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta = {
  title: 'Primitives/HoverCard',
  component: HoverCard,
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '4rem' }}>
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>
          <Button variant="link">@spenquatch</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <h4 className="text-sm font-semibold">Collider</h4>
          <p className="text-sm text-muted-foreground">
            Next.js + Tauri desktop app with a token-driven design system.
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', padding: '4rem' }}>
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>
          <Button variant="link">Aligned start</Button>
        </HoverCardTrigger>
        <HoverCardContent align="start">
          <p className="text-sm">Content aligned to the start edge.</p>
        </HoverCardContent>
      </HoverCard>

      {/* The portal is a Collider deviation. Upstream renders content inline, which makes
          the h4/p below descendants of this <p> — invalid HTML that reflows
          unpredictably. Inline citations render inside paragraphs, so this case is real
          rather than theoretical. The play function proves the portal escaped. */}
      <p className="text-sm">
        Sources say{' '}
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <button className="underline" type="button">
              this claim
            </button>
          </HoverCardTrigger>
          <HoverCardContent>
            <h4 className="text-sm font-semibold">Citation</h4>
            <blockquote className="text-sm text-muted-foreground">
              Block content cannot legally nest inside a paragraph.
            </blockquote>
          </HoverCardContent>
        </HoverCard>{' '}
        is well supported.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'this claim' });

    await userEvent.hover(trigger);

    const content = await waitFor(() => within(document.body).getByText('Citation'));

    // The deviation, asserted: content must not be a descendant of the paragraph that
    // holds the trigger. Dropping the Portal wrapper puts it back inside and fails here.
    expect(trigger.closest('p')).not.toBeNull();
    expect(trigger.closest('p')!.contains(content)).toBe(false);
  },
};

export const Docs: Story = {
  render: () => (
    <div style={{ padding: '4rem' }}>
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>
          <Button variant="link">Hover me</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <p className="text-sm">Popover content.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};
