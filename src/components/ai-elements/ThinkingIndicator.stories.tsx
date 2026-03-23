import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import type { CSSProperties } from 'react';

import { ThinkingIndicator } from './ThinkingIndicator';

const figmaDesignUrl = 'https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A';

const meta = {
  title: 'AI Elements/Thinking Indicator',
  component: ThinkingIndicator,
  args: {
    intent: 'primary',
    label: 'Thinking',
    size: 'md',
  },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
    },
    label: {
      control: 'text',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
  },
  parameters: {
    controls: {
      include: ['intent', 'label', 'size'],
    },
    design: {
      type: 'figma',
      url: figmaDesignUrl,
    },
    layout: 'padded',
  },
  render: (args) => <ThinkingIndicator {...args} />,
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

const variantCombos = [
  { intent: 'primary', label: 'Primary', size: 'sm' },
  { intent: 'primary', label: 'Primary', size: 'md' },
  { intent: 'secondary', label: 'Secondary', size: 'sm' },
  { intent: 'secondary', label: 'Secondary', size: 'md' },
] as const;

const stateCombos = [
  { state: 'rest', label: 'Rest' },
  { state: 'hover', label: 'Hover' },
  { state: 'focus', label: 'Focus' },
  { state: 'disabled', label: 'Disabled' },
] as const;

export const Default: Story = {
  args: {
    intent: 'primary',
    label: 'Thinking',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator = await canvas.findByRole('status', { name: 'Thinking' });

    expect(indicator).toBeVisible();
    expect(within(indicator).getByText('Thinking')).toBeVisible();
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
          A display-only loader for assistant wait states. The recipe contract is driven by intent,
          size, and an optional label.
        </p>
      </section>

      <section style={docsGridStyle}>
        <article style={cardStyle}>
          <h2 style={cardHeadingStyle}>Public contract</h2>
          <ul style={listStyle}>
            <li>
              <strong>intent</strong>: primary or secondary
            </li>
            <li>
              <strong>size</strong>: sm or md
            </li>
            <li>
              <strong>label</strong>: optional accessible label
            </li>
          </ul>
        </article>

        <article style={cardStyle}>
          <h2 style={cardHeadingStyle}>Preview</h2>
          <ThinkingIndicator intent="primary" label="Thinking" size="md" />
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
    expect(contractItems[0]).toHaveTextContent('intent');
    expect(contractItems[0]).toHaveTextContent('primary or secondary');
    expect(contractItems[1]).toHaveTextContent('size');
    expect(contractItems[1]).toHaveTextContent('sm or md');
    expect(contractItems[2]).toHaveTextContent('label');
    expect(contractItems[2]).toHaveTextContent('optional accessible label');
  },
};

export const VariantMatrix: Story = {
  render: () => (
    <section style={matrixStyle}>
      {variantCombos.map((combo) => (
        <article key={`${combo.intent}-${combo.size}`} style={matrixCardStyle}>
          <p style={matrixKickerStyle}>
            {combo.intent} / {combo.size}
          </p>
          <ThinkingIndicator {...combo} />
        </article>
      ))}
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getAllByRole('status')).toHaveLength(4);
    expect(canvas.getByText('secondary / md')).toBeVisible();
  },
};

export const StateMatrix: Story = {
  render: () => (
    <section style={matrixStyle}>
      {stateCombos.map((combo) => (
        <article key={combo.state} style={matrixCardStyle}>
          <p style={matrixKickerStyle}>{combo.state}</p>
          <ThinkingIndicator data-state={combo.state} label={combo.label} />
        </article>
      ))}
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getAllByRole('status')).toHaveLength(4);
    expect(canvas.getByText('Disabled')).toBeVisible();
  },
};

export const Motion: Story = {
  args: {
    intent: 'primary',
    label: 'Thinking',
    size: 'md',
  },
  parameters: {
    chromatic: {
      pauseAnimationAtEnd: true,
    },
  },
  render: (args) => (
    <section style={motionStyle}>
      <div style={motionCardStyle}>
        <p style={matrixKickerStyle}>slower pulse timing for review</p>
        <ThinkingIndicator {...args} style={slowMotionStyle} />
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator = await canvas.findByRole('status', { name: 'Thinking' });
    const glyph = indicator.querySelector<HTMLElement>('[data-slot="glyph"]');
    const dot = indicator.querySelector<HTMLElement>('[data-slot="dot"]');

    expect(glyph).not.toBeNull();
    expect(dot).not.toBeNull();
    expect(indicator.style.getPropertyValue('--thinking-indicator-duration')).toBe('1800ms');
    expect(window.getComputedStyle(dot as HTMLElement).animationName).toContain(
      'thinking-indicator-pulse'
    );
    expect(window.getComputedStyle(dot as HTMLElement).animationDuration).not.toBe('0s');
  },
};

const slowMotionStyle = {
  '--thinking-indicator-duration': '1800ms',
} as CSSProperties;

const pageStyle = {
  display: 'grid',
  gap: '1.5rem',
  maxWidth: '72rem',
};

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

const headingStyle = {
  fontSize: '1.875rem',
  margin: 0,
};

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

const cardHeadingStyle = {
  margin: 0,
};

const listStyle = {
  display: 'grid',
  gap: '0.5rem',
  margin: 0,
  paddingLeft: '1.25rem',
};

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

const matrixKickerStyle = {
  color: 'var(--color-text-tertiary)',
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  fontSize: '0.75rem',
};

const motionStyle = {
  display: 'grid',
  justifyItems: 'start',
};

const motionCardStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1.5rem',
};
