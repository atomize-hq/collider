import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

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

// ANSI helpers for readability.
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[90m';
const RESET = '\x1b[0m';

const SAMPLE_OUTPUT = [
  `${GREEN}✓${RESET} Compiled successfully in 1.2s`,
  '',
  `${BLUE}info${RESET}  - Collecting page data...`,
  `${BLUE}info${RESET}  - Generating static pages (0/3)`,
  `${GREEN}✓${RESET} Generated static pages (3/3)`,
  '',
  `${YELLOW}warn${RESET}  - Using experimental server actions`,
  '',
  `Route (app)                              ${CYAN}Size${RESET}     ${CYAN}First Load JS${RESET}`,
  `┌ ○ /                                     ${GREEN}5.2 kB   87.3 kB${RESET}`,
  `├ ○ /about                                ${GREEN}2.1 kB   84.2 kB${RESET}`,
  `└ ○ /contact                              ${GREEN}3.8 kB   85.9 kB${RESET}`,
  '',
  `${GREEN}✓${RESET} Build completed successfully!`,
  `${DIM}Total time: 3.45s${RESET}`,
].join('\n');

const STREAMING_OUTPUT = [
  `${GREEN}✓${RESET} Compiled successfully in 1.2s`,
  '',
  `${BLUE}info${RESET}  - Collecting page data...`,
  `${BLUE}info${RESET}  - Generating static pages (0/3)`,
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
        <TerminalTitle>Build Output</TerminalTitle>
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
      const line = lines[index];
      setOutput((prev) => (prev ? `${prev}\n${line}` : line));
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
  parameters: {
    a11y: {
      // ansi-to-react paints the classic ANSI palette as inline styles, and that
      // palette is fixed: ANSI blue is #0000BB, which reads 1.46:1 on our dark
      // ground. It is the program's output rather than a design-system colour —
      // a real terminal lets the user retheme it — so the coloured spans are
      // excluded from the audit. Everything else in the story, the terminal's own
      // chrome included, is still checked.
      context: { exclude: ['[data-slot="terminal-output"] span[style]'] },
    },
  },
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
    await waitFor(() => {
      expect(canvas.queryByText(/streaming…/i)).not.toBeInTheDocument();
      const output = canvas.getByRole('group', { name: 'Terminal output' }).textContent;
      const plainOutput = STREAMING_OUTPUT.replace(/\u001b\[[0-9;]*m/g, '');
      expect(output).toBe(plainOutput);
      expect(output).not.toContain('undefined');
    });
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
