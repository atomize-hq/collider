import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowLeftIcon, ArrowRightIcon, RefreshCwIcon } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';

import {
  WebPreview,
  WebPreviewBody,
  WebPreviewConsole,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  type WebPreviewConsoleLog,
} from './web-preview';

const SAMPLE_PAGE =
  'data:text/html;charset=utf-8,' +
  encodeURIComponent(
    '<html><body style="margin:0;font-family:ui-sans-serif,system-ui;background:#171717;color:#fff;padding:24px"><h1 style="margin:0 0 8px">Preview</h1><p style="margin:0;color:#a3a3a3">Sample iframe body served from a data URL.</p></body></html>'
  );

const SAMPLE_LOGS: WebPreviewConsoleLog[] = [
  { level: 'log', message: '[hmr] connected', timestamp: new Date('2026-08-18T12:00:00Z') },
  {
    level: 'warn',
    message: 'Prop `id` is not a known DOM property',
    timestamp: new Date('2026-08-18T12:00:02Z'),
  },
  {
    level: 'error',
    message: "TypeError: Cannot read properties of undefined (reading 'items')",
    timestamp: new Date('2026-08-18T12:00:04Z'),
  },
];

const Demo = ({
  defaultUrl = SAMPLE_PAGE,
  logs = SAMPLE_LOGS,
}: {
  defaultUrl?: string;
  logs?: WebPreviewConsoleLog[];
}) => (
  <div style={{ width: 640, height: 400 }}>
    <WebPreview defaultUrl={defaultUrl}>
      <WebPreviewNavigation>
        <WebPreviewNavigationButton tooltip="Back">
          <ArrowLeftIcon className="size-4" />
        </WebPreviewNavigationButton>
        <WebPreviewNavigationButton tooltip="Forward">
          <ArrowRightIcon className="size-4" />
        </WebPreviewNavigationButton>
        <WebPreviewNavigationButton tooltip="Reload">
          <RefreshCwIcon className="size-4" />
        </WebPreviewNavigationButton>
        <WebPreviewUrl />
      </WebPreviewNavigation>
      <WebPreviewBody />
      <WebPreviewConsole logs={logs} />
    </WebPreview>
  </div>
);

const meta = {
  title: 'AI Elements/Web Preview',
  component: WebPreview,
} satisfies Meta<typeof WebPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* With logs */}
      <Demo />
      {/* No logs — "No console output" state */}
      <Demo logs={[]} />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByPlaceholderText('Enter URL...');
    input.focus();
    await expect(input).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo defaultUrl="" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByPlaceholderText<HTMLInputElement>('Enter URL...');
    input.focus();
    await userEvent.type(input, 'https://example.com');
    await userEvent.keyboard('{Enter}');
    // Context URL updates on Enter; input's controlled value reflects it.
    await expect(input.value).toBe('https://example.com');
  },
};

export const ConsoleOpenFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const consoleButton = await canvas.findByRole('button', { name: /console/i });

    await expect(consoleButton).toHaveAttribute('data-state', 'closed');
    await userEvent.click(consoleButton);
    await expect(consoleButton).toHaveAttribute('data-state', 'open');
  },
};

export const ConsoleOpenTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const consoleButton = await canvas.findByRole('button', { name: /console/i });
    await userEvent.click(consoleButton);
    await expect(consoleButton).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
