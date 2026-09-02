import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceExpandButton,
  StackTraceFrames,
  StackTraceHeader,
} from './stack-trace';

const SAMPLE_TRACE = `TypeError: Cannot read properties of undefined (reading 'push')
    at Array.push (<anonymous>)
    at loadCommits (/Users/spm/app/src/components/ai-elements/commit.tsx:154:22)
    at CommitFeed (/Users/spm/app/src/components/ai-elements/commit-feed.tsx:42:5)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:16305:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:20074:13)
    at beginWork (node_modules/react-dom/cjs/react-dom.development.js:21587:16)
    at Object.invokeGuardedCallbackImpl (node_modules/react-dom/cjs/react-dom.development.js:4157:14)`;

const SHORT_TRACE = `Error: Something went wrong
    at doStuff (/app/index.ts:12:9)`;

const onFilePathClick = fn();

type DemoProps = {
  trace?: string;
  defaultOpen?: boolean;
  showInternalFrames?: boolean;
  withFilePathClick?: boolean;
};

const Demo = ({
  trace = SAMPLE_TRACE,
  defaultOpen = false,
  showInternalFrames = true,
  withFilePathClick = false,
}: DemoProps) => (
  <div style={{ width: 640 }}>
    <StackTrace
      defaultOpen={defaultOpen}
      onFilePathClick={withFilePathClick ? onFilePathClick : undefined}
      trace={trace}
    >
      <StackTraceHeader
        actions={
          <StackTraceActions>
            <StackTraceCopyButton />
            <StackTraceExpandButton />
          </StackTraceActions>
        }
      >
        <StackTraceError>
          <StackTraceErrorType />
          <StackTraceErrorMessage />
        </StackTraceError>
      </StackTraceHeader>
      <StackTraceContent>
        <StackTraceFrames showInternalFrames={showInternalFrames} />
      </StackTraceContent>
    </StackTrace>
  </div>
);

const meta = {
  title: 'AI Elements/Stack Trace',
  component: StackTrace,
  args: { trace: SAMPLE_TRACE },
} satisfies Meta<typeof StackTrace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo />
      <Demo defaultOpen />
      <Demo defaultOpen showInternalFrames={false} />
      <Demo trace={SHORT_TRACE} defaultOpen />
    </div>
  ),
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[aria-expanded]') as HTMLElement | null;
    if (!trigger) throw new Error('collapsible trigger missing');
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
    const copyButton = canvas.getAllByRole('button').at(0);
    if (!copyButton) throw new Error('copy button missing');
    copyButton.focus();
    await expect(copyButton).toHaveFocus();
  },
};

export const ExpandWorkflow: Story = {
  render: () => <Demo withFilePathClick />,
  play: async ({ canvasElement }) => {
    onFilePathClick.mockClear();
    const trigger = canvasElement.querySelector('[aria-expanded]') as HTMLElement | null;
    if (!trigger) throw new Error('collapsible trigger missing');
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const ExpandTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[aria-expanded]') as HTMLElement | null;
    if (!trigger) throw new Error('collapsible trigger missing');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo defaultOpen />,
};
