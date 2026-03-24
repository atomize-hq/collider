import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Reasoning, ReasoningContent, ReasoningTrigger } from './ThinkingIndicator';

const figmaDesignUrl = 'https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A';

const meta = {
  title: 'AI Elements/Thinking Indicator',
  component: Reasoning,
  args: { defaultOpen: true, isStreaming: false },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    duration: { control: 'number' },
    isStreaming: { control: 'boolean' },
  },
  parameters: {
    controls: { include: ['isStreaming', 'defaultOpen', 'duration'] },
    design: { type: 'figma', url: figmaDesignUrl },
    layout: 'padded',
  },
  render: (args) => (
    <Reasoning {...args}>
      <ReasoningTrigger />
      <ReasoningContent>
        {
          'Let me think about this step by step.\n\nFirst, I need to understand what the user is asking for.'
        }
      </ReasoningContent>
    </Reasoning>
  ),
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');
    expect(trigger).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(canvas.getByText('Reasoning')).toBeVisible();
  },
};

export const Docs: Story = {
  render: () => (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>AI Elements primitive</p>
        <h1 data-testid="thinking-indicator-docs-heading" style={headingStyle}>
          Thinking Indicator
        </h1>
        <p style={ledeStyle}>
          A collapsible reasoning panel that auto-opens while the model streams its thinking and
          closes when reasoning completes. Composed from Reasoning, ReasoningTrigger, and
          ReasoningContent.
        </p>
      </section>
      <section style={docsGridStyle}>
        <article style={cardStyle}>
          <h2 style={cardHeadingStyle}>Public contract</h2>
          <ul style={listStyle}>
            <li>
              <strong>isStreaming</strong>: auto-opens while true, closes when false
            </li>
            <li>
              <strong>duration</strong>: seconds elapsed, shown when not streaming
            </li>
            <li>
              <strong>open / onOpenChange</strong>: controlled open state
            </li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h2 style={cardHeadingStyle}>Preview</h2>
          <Reasoning defaultOpen>
            <ReasoningTrigger />
            <ReasoningContent>Let me reason through this…</ReasoningContent>
          </Reasoning>
        </article>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const contractItems = canvas.getAllByRole('listitem');
    await expect(canvas.getByTestId('thinking-indicator-docs-heading')).toHaveTextContent(
      'Thinking Indicator'
    );
    expect(contractItems).toHaveLength(3);
    expect(contractItems[0]).toHaveTextContent('isStreaming');
    expect(contractItems[1]).toHaveTextContent('duration');
    expect(contractItems[2]).toHaveTextContent('open');
  },
};

const variantCombos = [
  { label: 'streaming / open', isStreaming: true },
  { label: 'done / open', isStreaming: false, defaultOpen: true },
  { label: 'done / closed', isStreaming: false, defaultOpen: false },
  { label: 'done / duration', isStreaming: false, defaultOpen: true, duration: 3 },
] as const;

export const VariantMatrix: Story = {
  render: () => (
    <section style={matrixStyle}>
      {variantCombos.map((combo) => (
        <article key={combo.label} style={matrixItemStyle}>
          <p style={matrixKickerStyle}>{combo.label}</p>
          <Reasoning {...combo}>
            <ReasoningTrigger />
            <ReasoningContent>Let me think step by step…</ReasoningContent>
          </Reasoning>
        </article>
      ))}
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole('button')).toHaveLength(4);
    expect(canvas.getByText('Thinking…')).toBeVisible();
    expect(canvas.getByText('Thought for 3s')).toBeVisible();
  },
};

const stateCombos = [
  { state: 'streaming', isStreaming: true },
  { state: 'expanded', isStreaming: false, defaultOpen: true },
  { state: 'collapsed', isStreaming: false, defaultOpen: false },
  { state: 'duration', isStreaming: false, defaultOpen: true, duration: 5 },
] as const;

export const StateMatrix: Story = {
  render: () => (
    <section style={matrixStyle}>
      {stateCombos.map((combo) => (
        <article key={combo.state} style={matrixItemStyle}>
          <p style={matrixKickerStyle}>{combo.state}</p>
          <Reasoning {...combo}>
            <ReasoningTrigger />
            <ReasoningContent>Reasoning content here…</ReasoningContent>
          </Reasoning>
        </article>
      ))}
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole('button')).toHaveLength(4);
    expect(canvas.getByText('Thought for 5s')).toBeVisible();
  },
};

export const Motion: Story = {
  args: { defaultOpen: true, isStreaming: false },
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: (args) => (
    <section style={motionStyle}>
      <article style={matrixCardStyle}>
        <p style={matrixKickerStyle}>Collapsible height transition</p>
        <Reasoning {...args}>
          <ReasoningTrigger />
          <ReasoningContent>
            {'Let me reason through this step by step.\n\nFirst, I need to understand the problem.'}
          </ReasoningContent>
        </Reasoning>
      </article>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');
    const root = trigger.closest('[data-state]');
    expect(root).toHaveAttribute('data-state', 'open');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

const pageStyle = { display: 'grid', gap: '1.5rem', maxWidth: '72rem' };
const heroStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1.25rem',
};
const eyebrowStyle = {
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase' as const,
};
const headingStyle = { fontSize: '1.875rem', margin: 0 };
const ledeStyle = {
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  margin: 0,
  maxWidth: '44rem',
};
const docsGridStyle = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
};
const cardStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1rem',
};
const cardHeadingStyle = { margin: 0 };
const listStyle = { display: 'grid', gap: '0.5rem', margin: 0, paddingLeft: '1.25rem' };
const matrixStyle = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
};
const matrixCardStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1rem',
};
const matrixItemStyle = {
  display: 'grid',
  gap: '0.5rem',
  padding: '0.25rem 0',
};
const matrixKickerStyle = {
  color: 'var(--color-text-tertiary)',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase' as const,
};
const motionStyle = { display: 'grid', justifyItems: 'start' };
