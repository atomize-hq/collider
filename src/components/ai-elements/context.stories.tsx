import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from './context';

const MAX_TOKENS = 200_000;
const MODEL_ID = 'anthropic:claude-sonnet-4';

const makeUsage = (input: number, output: number, reasoning = 0, cacheRead = 0) => ({
  inputTokens: input,
  outputTokens: output,
  totalTokens: input + output + reasoning,
  inputTokenDetails: {
    noCacheTokens: input - cacheRead,
    cacheReadTokens: cacheRead,
    cacheWriteTokens: 0,
    textTokens: input,
  },
  outputTokenDetails: {
    textTokens: output - reasoning,
    reasoningTokens: reasoning,
  },
});

const Demo = ({
  usedTokens = 45_000,
  usage = makeUsage(35_000, 8_000, 2_000, 12_000),
}: {
  usedTokens?: number;
  usage?: ReturnType<typeof makeUsage>;
}) => (
  <Context maxTokens={MAX_TOKENS} modelId={MODEL_ID} usage={usage} usedTokens={usedTokens}>
    <ContextTrigger />
    <ContextContent>
      <ContextContentHeader />
      <ContextContentBody>
        <ContextInputUsage />
        <ContextOutputUsage />
        <ContextReasoningUsage />
        <ContextCacheUsage />
      </ContextContentBody>
      <ContextContentFooter />
    </ContextContent>
  </Context>
);

const meta = {
  title: 'AI Elements/Context',
  component: Context,
  args: { maxTokens: MAX_TOKENS, usedTokens: 45_000 },
} satisfies Meta<typeof Context>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
    >
      <Demo usage={makeUsage(6_000, 2_000)} usedTokens={8_000} />
      <Demo usage={makeUsage(60_000, 30_000, 4_000, 20_000)} usedTokens={90_000} />
      <Demo usage={makeUsage(140_000, 40_000, 8_000, 30_000)} usedTokens={180_000} />
      <Demo usage={makeUsage(150_000, 50_000, 10_000, 30_000)} usedTokens={200_000} />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();

    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');

    await userEvent.unhover(trigger);
    await expect(trigger).toHaveFocus();
  },
};

export const OpenHoverCardFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const HoverCardTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
