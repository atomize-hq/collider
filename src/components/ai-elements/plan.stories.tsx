import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from './plan';

const STEPS = [
  'Introduce a compat shim so callers can migrate gradually.',
  'Backfill legacy sessions into the new token store.',
  'Cut over the login endpoint behind a feature flag.',
  'Retire the compat shim after two release trains.',
];

type DemoProps = {
  isStreaming?: boolean;
  defaultOpen?: boolean;
};

const Demo = ({ isStreaming = false, defaultOpen = true }: DemoProps) => (
  <div style={{ width: 480 }}>
    <Plan isStreaming={isStreaming} defaultOpen={defaultOpen}>
      <PlanHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <PlanTitle>Refactor authentication flow</PlanTitle>
          <PlanDescription>
            Break the migration into safe, reversible steps we can ship one at a time.
          </PlanDescription>
        </div>
        <PlanAction>
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 20 }}>
          {STEPS.map((step) => (
            <li key={step} style={{ fontSize: 14, lineHeight: 1.5 }}>
              {step}
            </li>
          ))}
        </ol>
      </PlanContent>
      <PlanFooter>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          4 steps · updated 2m ago
        </span>
      </PlanFooter>
    </Plan>
  </div>
);

const meta = {
  title: 'AI Elements/Plan',
  component: Plan,
  args: { isStreaming: false, defaultOpen: true },
} satisfies Meta<typeof Plan>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Idle · Open */}
      <Demo isStreaming={false} defaultOpen />
      {/* Idle · Closed */}
      <Demo isStreaming={false} defaultOpen={false} />
      {/* Streaming · Open (title + description shimmer) */}
      <Demo isStreaming defaultOpen />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /toggle plan/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /toggle plan/i });
    trigger.focus();
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const ExpandCollapseFlow: Story = {
  render: () => <Demo defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /toggle plan/i });
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
  },
};

export const ExpandTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /toggle plan/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
