import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ToolUIPart } from 'ai';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CodeBlock } from './code-block';
import {
  Sandbox,
  SandboxContent,
  SandboxHeader,
  SandboxTabContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
} from './sandbox';

const CODE = `import math

def calculate_primes(limit):
    """Find all prime numbers up to a given limit using Sieve of Eratosthenes."""
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False

    for i in range(2, int(math.sqrt(limit)) + 1):
        if sieve[i]:
            for j in range(i * i, limit + 1, i):
                sieve[j] = False

    return [i for i, is_prime in enumerate(sieve) if is_prime]

if __name__ == "__main__":
    primes = calculate_primes(50)
    print(f"Found {len(primes)} prime numbers up to 50:")
    print(primes)`;

const OUTPUT = `Found 15 prime numbers up to 50:
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]`;

const STATES: ToolUIPart['state'][] = [
  'input-streaming',
  'input-available',
  'output-available',
  'output-error',
];

const Demo = ({
  state = 'output-available',
  showOutput = false,
}: {
  state?: ToolUIPart['state'];
  showOutput?: boolean;
}) => (
  <div style={{ maxWidth: 640 }}>
    <Sandbox>
      <SandboxHeader state={state} title="primes.py" />
      <SandboxContent>
        <SandboxTabs defaultValue={showOutput ? 'output' : 'code'}>
          <SandboxTabsBar>
            <SandboxTabsList>
              <SandboxTabsTrigger value="code">Code</SandboxTabsTrigger>
              <SandboxTabsTrigger value="output">Output</SandboxTabsTrigger>
            </SandboxTabsList>
          </SandboxTabsBar>
          <SandboxTabContent value="code">
            <CodeBlock
              className="border-0"
              code={state === 'input-streaming' ? '# Generating code...' : CODE}
              language="python"
            />
          </SandboxTabContent>
          <SandboxTabContent value="output">
            <CodeBlock className="border-0" code={OUTPUT} language="log" />
          </SandboxTabContent>
        </SandboxTabs>
      </SandboxContent>
    </Sandbox>
  </div>
);

const meta = {
  title: 'AI Elements/Sandbox',
  component: Sandbox,
} satisfies Meta<typeof Sandbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 640 }}>
      {STATES.map((s) => (
        <Demo key={s} state={s} />
      ))}
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /primes\.py/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const codeTab = await canvas.findByRole('tab', { name: /code/i });
    codeTab.focus();
    await expect(codeTab).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const outputTab = await canvas.findByRole('tab', { name: /output/i });
    await waitFor(() => expect(outputTab).toHaveAttribute('data-state', 'active'));
  },
};

export const TabSwitchFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outputTab = await canvas.findByRole('tab', { name: /output/i });
    await userEvent.click(outputTab);
    await waitFor(() => expect(outputTab).toHaveAttribute('data-state', 'active'));

    // Assert on `textContent`, not `findByText`. Shiki's `log` grammar splits
    // this line into five sibling spans -- "Found ", "15", " prime numbers up
    // to ", "50", ":" -- and Testing Library's text matcher joins only an
    // element's own direct text nodes, so once highlighting lands no element
    // carries the phrase. `findByText` could therefore only ever match the
    // raw-token fallback `createRawTokens` renders before shiki resolves, and
    // the story passed only by winning that race. `textContent` traverses
    // descendants, so it holds in both states -- the same reasoning
    // `code-block.stories.tsx > AsyncHighlight` already records.
    const output = await canvas.findByRole('group', { name: /log code/i });
    await waitFor(() => expect(output).toHaveTextContent(/Found 15 prime numbers/i));
  },
};

export const CollapseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /primes\.py/i });
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'closed'));
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
