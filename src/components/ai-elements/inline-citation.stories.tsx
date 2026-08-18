import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
} from './inline-citation';

const SOURCES = [
  {
    url: 'https://example.com/token-bridge',
    title: 'shadcn ↔ Collider token bridge',
    description:
      'Aliases shadcn semantic roles onto the Collider dark palette so ai-elements utility classes render styled.',
    quote: 'The bridge lives in globals.css, not tokens.css — it is hand-authored.',
  },
  {
    url: 'https://example.com/figma-primitives',
    title: 'Primitives page — Figma',
    description:
      'The single live Figma page hosting the ai-elements component seeds bound to token variables.',
    quote: 'Only page present: Primitives (401:1040), canvas 401:1042.',
  },
  {
    url: 'https://example.com/ai-elements-registry',
    title: 'ai-elements registry',
    description:
      '48-component registry served by elements.ai-sdk.dev; fetch via curl, not the CLI.',
    quote: 'Fetch these directly instead of the interactive npx ai-elements add CLI.',
  },
];

// Wrap the demo in a <div> rather than a <p>: the hover-card body contains
// block descendants (h4/p/blockquote) that are structurally invalid inside
// <p> even when portaled — the fiber-tree nesting check flags them. Real
// consumers rendering into markdown prose should scope <InlineCitation> to
// contexts that permit block descendants of the immediate <p> ancestor.
const SentenceWithCitation = ({
  sourceUrls = SOURCES.map((s) => s.url),
}: {
  sourceUrls?: string[];
}) => (
  <div style={{ margin: 0 }}>
    The Collider token bridge translates{' '}
    <InlineCitation>
      <InlineCitationText>shadcn semantic roles</InlineCitationText>
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={sourceUrls} />
        <InlineCitationCardBody>
          <InlineCitationCarousel>
            <InlineCitationCarouselHeader>
              <InlineCitationCarouselPrev />
              <InlineCitationCarouselNext />
              <InlineCitationCarouselIndex />
            </InlineCitationCarouselHeader>
            <InlineCitationCarouselContent>
              {SOURCES.filter((s) => sourceUrls.includes(s.url)).map((s) => (
                <InlineCitationCarouselItem key={s.url}>
                  <InlineCitationSource title={s.title} url={s.url} description={s.description} />
                  <InlineCitationQuote>{s.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
              ))}
            </InlineCitationCarouselContent>
          </InlineCitationCarousel>
        </InlineCitationCardBody>
      </InlineCitationCard>
    </InlineCitation>{' '}
    onto the Collider dark palette.
  </div>
);

const meta = {
  title: 'AI Elements/Inline Citation',
  component: InlineCitation,
} satisfies Meta<typeof InlineCitation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SentenceWithCitation />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SentenceWithCitation sourceUrls={[SOURCES[0]!.url]} />
      <SentenceWithCitation />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <SentenceWithCitation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <SentenceWithCitation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};

export const OpenHoverCardFlow: Story = {
  render: () => <SentenceWithCitation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    trigger.focus();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('data-state', 'closed');

    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const HoverCardTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <SentenceWithCitation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <SentenceWithCitation />,
};
