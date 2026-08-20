import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Test,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  TestResults,
  TestResultsContent,
  TestResultsDuration,
  TestResultsHeader,
  TestResultsProgress,
  TestResultsSummary,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
  TestSuiteStats,
} from './test-results';

type DemoProps = {
  defaultOpen?: boolean;
  suiteStatus?: 'passed' | 'failed' | 'running' | 'skipped';
  summary?: { passed: number; failed: number; skipped: number; total: number; duration?: number };
};

const DEFAULT_SUMMARY = { passed: 12, failed: 1, skipped: 2, total: 15, duration: 843 };

const Demo = ({
  defaultOpen = true,
  suiteStatus = 'failed',
  summary = DEFAULT_SUMMARY,
}: DemoProps) => (
  <div style={{ width: 520 }}>
    <TestResults summary={summary}>
      <TestResultsHeader>
        <TestResultsSummary />
        <TestResultsDuration />
      </TestResultsHeader>
      <TestResultsContent>
        <TestResultsProgress />
        <TestSuite defaultOpen={defaultOpen} name="unit tests" status={suiteStatus}>
          <TestSuiteName>
            <span>unit tests</span>
            <TestSuiteStats
              failed={suiteStatus === 'failed' ? 1 : 0}
              passed={suiteStatus === 'passed' ? 4 : 3}
              skipped={suiteStatus === 'skipped' ? 1 : 0}
            />
          </TestSuiteName>
          <TestSuiteContent>
            <Test duration={41} name="formats durations below one second" status="passed" />
            <Test duration={77} name="reports the completed test count" status="passed" />
            {suiteStatus === 'failed' && (
              <Test name="surfaces the failing assertion" status="failed">
                <div className="flex-1">
                  <span>surfaces the failing assertion</span>
                  <TestError>
                    <TestErrorMessage>Expected 3 passed tests, received 2.</TestErrorMessage>
                    <TestErrorStack>AssertionError: expected 2 to be 3</TestErrorStack>
                  </TestError>
                </div>
              </Test>
            )}
          </TestSuiteContent>
        </TestSuite>
      </TestResultsContent>
    </TestResults>
  </div>
);

const meta = {
  title: 'AI Elements/Test Results',
  component: TestResults,
} satisfies Meta<typeof TestResults>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo suiteStatus="passed" summary={{ passed: 15, failed: 0, skipped: 0, total: 15 }} />
      <Demo
        defaultOpen={false}
        suiteStatus="running"
        summary={{ passed: 8, failed: 0, skipped: 0, total: 15, duration: 1250 }}
      />
      <Demo
        suiteStatus="skipped"
        summary={{ passed: 0, failed: 0, skipped: 3, total: 3, duration: 32 }}
      />
    </div>
  ),
};

export const Keyboard: Story = {
  render: () => <Demo defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /unit tests/i });
    trigger.focus();
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /unit tests/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const ExpandCollapseFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /unit tests/i });
    await expect(trigger).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const SuiteExpandTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /unit tests/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => (
    <Demo
      suiteStatus="passed"
      summary={{ passed: 4, failed: 0, skipped: 0, total: 4, duration: 226 }}
    />
  ),
};
