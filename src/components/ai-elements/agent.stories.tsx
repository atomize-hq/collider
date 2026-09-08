import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Tool } from 'ai';
import { expect, userEvent, within } from 'storybook/test';

import {
  Agent,
  AgentContent,
  AgentHeader,
  AgentInstructions,
  AgentOutput,
  AgentTool,
  AgentTools,
} from './agent';

const TOOLS: Record<string, Tool> = {
  search: {
    description: 'Search the web for recent information about a topic.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query' },
        limit: { type: 'number', description: 'Max results to return' },
      },
      required: ['query'],
    },
  } as unknown as Tool,
  read: {
    description: 'Read the contents of a file at the given absolute path.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute file path' },
      },
      required: ['path'],
    },
  } as unknown as Tool,
};

const OUTPUT_SCHEMA = `type ResearchBrief = {
  summary: string;
  citations: Array<{ title: string; url: string }>;
  confidence: 'low' | 'medium' | 'high';
};`;

type DemoProps = {
  showModel?: boolean;
  showInstructions?: boolean;
  toolValues?: Array<'search' | 'read'>;
  showOutput?: boolean;
  defaultOpenTool?: string;
};

const Demo = ({
  showModel = true,
  showInstructions = true,
  toolValues = ['search', 'read'],
  showOutput = true,
  defaultOpenTool,
}: DemoProps) => (
  <div style={{ width: 520 }}>
    <Agent>
      <AgentHeader name="Research Assistant" model={showModel ? 'claude-opus-4' : undefined} />
      <AgentContent>
        {showInstructions && (
          <AgentInstructions>
            You are a careful research assistant. Cite every claim and prefer recent, primary
            sources over aggregators.
          </AgentInstructions>
        )}
        {toolValues.length > 0 && (
          <AgentTools type="single" collapsible defaultValue={defaultOpenTool}>
            {toolValues.map((key) => (
              <AgentTool key={key} value={key} tool={TOOLS[key]} />
            ))}
          </AgentTools>
        )}
        {showOutput && <AgentOutput schema={OUTPUT_SCHEMA} />}
      </AgentContent>
    </Agent>
  </div>
);

const meta = {
  title: 'AI Elements/Agent',
  component: Agent,
} satisfies Meta<typeof Agent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Full */}
      <Demo />
      {/* Minimal: no model, no instructions */}
      <Demo showModel={false} showInstructions={false} />
      {/* No tools, no output */}
      <Demo toolValues={[]} showOutput={false} />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /search the web/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /search the web/i });
    trigger.focus();
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const ExpandToolFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /search the web/i });
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
  },
};

export const ExpandTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /search the web/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo defaultOpenTool="search" />,
};
