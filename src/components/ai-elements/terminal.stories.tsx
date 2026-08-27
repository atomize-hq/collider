import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Terminal,
  TerminalActions,
  TerminalClearButton,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
} from './terminal';

const SAMPLE_OUTPUT = [
  '\x1b[32m$\x1b[0m pnpm build',
  'Building...',
  '\x1b[36mvite\x1b[0m v5.4.0 building for production...',
  '\x1b[32m✓\x1b[0m 142 modules transformed.',
  'dist/index.html                     0.42 kB',
  'dist/assets/index-B3g9jK6X.css      12.14 kB',
  'dist/assets/index-Bqz8P0Yp.js      184.30 kB',
  '\x1b[32m✓\x1b[0m built in 2.14s',
].join('\n');

const STREAMING_OUTPUT = [
  '\x1b[32m$\x1b[0m pnpm test',
  '\x1b[36m›\x1b[0m Running Jest...',
  '\x1b[33m PASS \x1b[0m src/components/Button.test.tsx',
  '\x1b[33m PASS \x1b[0m src/utils/format.test.ts',
].join('\n');

const onCopy = fn();
const onClear = fn();

const Demo = ({
  output = SAMPLE_OUTPUT,
  isStreaming = false,
  clearable = true,
}: {
  output?: string;
  isStreaming?: boolean;
  clearable?: boolean;
}) => (
  <div style={{ width: 640 }}>
    <Terminal isStreaming={isStreaming} onClear={clearable ? onClear : undefined} output={output}>
      <TerminalHeader>
        <TerminalTitle />
        <div className="flex items-center gap-1">
          <TerminalStatus>streaming…</TerminalStatus>
          <TerminalActions>
            <TerminalCopyButton onCopy={onCopy} />
            {clearable && <TerminalClearButton />}
          </TerminalActions>
        </div>
      </TerminalHeader>
      <TerminalContent />
    </Terminal>
  </div>
);

const StreamingDemo = () => {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    const lines = STREAMING_OUTPUT.split('\n');
    let cancelled = false;
    let index = 0;
    const tick = () => {
      if (cancelled) {
        return;
      }
      setOutput((prev) => (prev ? `${prev}\n${lines[index]}` : lines[index]));
      index += 1;
      if (index < lines.length) {
        window.setTimeout(tick, 220);
      } else {
        setIsStreaming(false);
      }
    };
    window.setTimeout(tick, 120);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Demo
      clearable
      isStreaming={isStreaming}
      output={output || '\x1b[90m$\x1b[0m Waiting for output…'}
    />
  );
};

const meta = {
  title: 'AI Elements/Terminal',
  component: Terminal,
  args: { output: SAMPLE_OUTPUT },
} satisfies Meta<typeof Terminal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Idle, clearable */}
      <Demo />
      {/* Streaming with status */}
      <Demo isStreaming output={STREAMING_OUTPUT} />
      {/* No onClear → clear button hides */}
      <Demo clearable={false} />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = await canvas.findAllByRole('button');
    const copyButton = buttons[0];
    copyButton.focus();
    await expect(copyButton).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onClear.mockClear();
    const canvas = within(canvasElement);
    const buttons = await canvas.findAllByRole('button');
    const clearButton = buttons[1];
    clearButton.focus();
    await expect(clearButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onClear).toHaveBeenCalled();
  },
};

export const CopyFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onCopy.mockClear();
    const writeText = fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const canvas = within(canvasElement);
    const buttons = await canvas.findAllByRole('button');
    const copyButton = buttons[0];
    await userEvent.click(copyButton);
    await expect(writeText).toHaveBeenCalledWith(SAMPLE_OUTPUT);
    await expect(onCopy).toHaveBeenCalled();
  },
};

export const StreamingTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <StreamingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/streaming…/i);
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
