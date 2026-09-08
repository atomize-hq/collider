import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Reasoning, ReasoningContent, ReasoningTrigger } from './reasoning';

const TRACE =
  'Working through the request step by step: first parse the intent, then pick the tool, then answer.';

const meta = {
  title: 'AI Elements/Reasoning',
  component: Reasoning,
} satisfies Meta<typeof Reasoning>;

export default meta;

type Story = StoryObj<typeof meta>;

const columnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1.5rem',
  maxWidth: '32rem',
};

export const Default: Story = {
  render: () => (
    <Reasoning defaultOpen duration={4}>
      <ReasoningTrigger />
      <ReasoningContent>{TRACE}</ReasoningContent>
    </Reasoning>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={columnStyle}>
      {/* streaming: shimmer trigger, auto-opened */}
      <Reasoning isStreaming>
        <ReasoningTrigger />
        <ReasoningContent>{TRACE}</ReasoningContent>
      </Reasoning>
      {/* settled + expanded */}
      <Reasoning defaultOpen duration={6}>
        <ReasoningTrigger />
        <ReasoningContent>{TRACE}</ReasoningContent>
      </Reasoning>
      {/* settled + collapsed */}
      <Reasoning defaultOpen={false} duration={6}>
        <ReasoningTrigger />
        <ReasoningContent>{TRACE}</ReasoningContent>
      </Reasoning>
    </div>
  ),
};

export const Focus: Story = {
  render: () => (
    <Reasoning defaultOpen duration={4}>
      <ReasoningTrigger />
      <ReasoningContent>{TRACE}</ReasoningContent>
    </Reasoning>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Reasoning defaultOpen={false} duration={4}>
      <ReasoningTrigger />
      <ReasoningContent>{TRACE}</ReasoningContent>
    </Reasoning>
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
    <Reasoning defaultOpen={false} duration={4}>
      <ReasoningTrigger />
      <ReasoningContent>{TRACE}</ReasoningContent>
    </Reasoning>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    // Closed: content is not mounted.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText(/step by step/i)).not.toBeInTheDocument();

    // Expand: content becomes visible.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText(/step by step/i)).toBeInTheDocument();

    // Collapse again.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CollapseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => (
    <Reasoning defaultOpen duration={4}>
      <ReasoningTrigger />
      <ReasoningContent>{TRACE}</ReasoningContent>
    </Reasoning>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const StreamingStates: Story = {
  // Infinite shimmer while streaming; skip the visual-regression snapshot.
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={columnStyle}>
      {/* pending / streaming */}
      <Reasoning isStreaming>
        <ReasoningTrigger />
        <ReasoningContent>{TRACE}</ReasoningContent>
      </Reasoning>
      {/* settled */}
      <Reasoning defaultOpen duration={5}>
        <ReasoningTrigger />
        <ReasoningContent>{TRACE}</ReasoningContent>
      </Reasoning>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <Reasoning defaultOpen duration={3}>
      <ReasoningTrigger />
      <ReasoningContent>{TRACE}</ReasoningContent>
    </Reasoning>
  ),
};
