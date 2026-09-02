import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ToolUIPart } from 'ai';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from './tool';

const SEARCH_INPUT = { query: 'collider design tokens', limit: 5 };

const SEARCH_OUTPUT = {
  results: [
    { title: 'Design tokens', url: 'https://example.com/tokens' },
    { title: 'Token bridge', url: 'https://example.com/bridge' },
  ],
  count: 2,
};

const ERROR_TEXT = 'Rate limit exceeded (429). Retry after 30s.';

// Full tool-call status axis, ordered as a live call progresses.
const STATUS_STATES: ToolUIPart['state'][] = [
  'input-streaming',
  'input-available',
  'approval-requested',
  'approval-responded',
  'output-available',
  'output-denied',
  'output-error',
];

const meta = {
  title: 'AI Elements/Tool',
  component: Tool,
} satisfies Meta<typeof Tool>;

export default meta;

type Story = StoryObj<typeof meta>;

const columnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1rem',
  maxWidth: '36rem',
};

export const Default: Story = {
  render: () => (
    <Tool defaultOpen>
      <ToolHeader type="tool-search" state="output-available" />
      <ToolContent>
        <ToolInput input={SEARCH_INPUT} />
        <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
      </ToolContent>
    </Tool>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={columnStyle}>
      {STATUS_STATES.map((state) => (
        <Tool key={state}>
          <ToolHeader type="tool-search" state={state} />
        </Tool>
      ))}
    </div>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={columnStyle}>
      {/* collapsed: header only */}
      <Tool>
        <ToolHeader type="tool-search" state="output-available" />
      </Tool>
      {/* expanded: success output */}
      <Tool defaultOpen>
        <ToolHeader type="tool-search" state="output-available" />
        <ToolContent>
          <ToolInput input={SEARCH_INPUT} />
          <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
        </ToolContent>
      </Tool>
      {/* expanded: error output */}
      <Tool defaultOpen>
        <ToolHeader type="tool-search" state="output-error" />
        <ToolContent>
          <ToolInput input={SEARCH_INPUT} />
          <ToolOutput output={undefined} errorText={ERROR_TEXT} />
        </ToolContent>
      </Tool>
    </div>
  ),
};

export const Focus: Story = {
  render: () => (
    <Tool defaultOpen>
      <ToolHeader type="tool-search" state="output-available" />
      <ToolContent>
        <ToolInput input={SEARCH_INPUT} />
        <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
      </ToolContent>
    </Tool>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Bare CodeBlocks render no buttons, so the header trigger is the only button.
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Tool defaultOpen={false}>
      <ToolHeader type="tool-search" state="output-available" />
      <ToolContent>
        <ToolInput input={SEARCH_INPUT} />
        <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
      </ToolContent>
    </Tool>
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
    <Tool defaultOpen={false}>
      <ToolHeader type="tool-search" state="output-available" />
      <ToolContent>
        <ToolInput input={SEARCH_INPUT} />
        <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
      </ToolContent>
    </Tool>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    // Closed: collapsible content (Parameters/Result labels) is not mounted.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText('Parameters')).not.toBeInTheDocument();

    // Expand: both the input and output sections mount.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText('Parameters')).toBeInTheDocument();
    await expect(canvas.getByText('Result')).toBeInTheDocument();

    // Collapse again.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CollapseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => (
    <Tool defaultOpen>
      <ToolHeader type="tool-search" state="output-available" />
      <ToolContent>
        <ToolInput input={SEARCH_INPUT} />
        <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
      </ToolContent>
    </Tool>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const ToolCallLifecycle: Story = {
  // The `input-available` (Running) badge pulses; skip the visual-regression snapshot.
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={columnStyle}>
      {/* pending: input still streaming, nothing to show yet. The panel is still
          rendered — the header's `aria-controls` has to resolve to something. */}
      <Tool defaultOpen>
        <ToolHeader type="tool-search" state="input-streaming" />
        <ToolContent />
      </Tool>
      {/* running: input resolved, awaiting output */}
      <Tool defaultOpen>
        <ToolHeader type="tool-search" state="input-available" />
        <ToolContent>
          <ToolInput input={SEARCH_INPUT} />
        </ToolContent>
      </Tool>
      {/* completed: output available */}
      <Tool defaultOpen>
        <ToolHeader type="tool-search" state="output-available" />
        <ToolContent>
          <ToolInput input={SEARCH_INPUT} />
          <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The lifecycle renders all three status labels; assert the terminal one.
    await waitFor(() => {
      expect(canvasElement.textContent).toContain('Completed');
    });
  },
};

export const Docs: Story = {
  render: () => (
    <Tool defaultOpen>
      {/* dynamic-tool branch: name comes from `toolName`, not the `tool-*` type */}
      <ToolHeader type="dynamic-tool" toolName="web_search" state="output-available" />
      <ToolContent>
        <ToolInput input={SEARCH_INPUT} />
        <ToolOutput output={SEARCH_OUTPUT} errorText={undefined} />
      </ToolContent>
    </Tool>
  ),
};
