import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from './code-block';

const TS_SNIPPET = `export function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;

const JSON_SNIPPET = `{
  "tool": "search",
  "args": { "query": "collider", "limit": 5 }
}`;

const BASH_SNIPPET = `pnpm install
just preflight`;

const meta = {
  title: 'AI Elements/Code Block',
  component: CodeBlock,
  // CodeBlock's `code`/`language` are required props; every story overrides via
  // `render`, so these meta-level defaults just satisfy the required-args type.
  args: { code: TS_SNIPPET, language: 'tsx' },
} satisfies Meta<typeof CodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

const columnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1.5rem',
  maxWidth: '40rem',
};

const withHeader = (filename: string) => (
  <CodeBlockHeader>
    <CodeBlockTitle>
      <CodeBlockFilename>{filename}</CodeBlockFilename>
    </CodeBlockTitle>
    <CodeBlockActions>
      <CodeBlockCopyButton />
    </CodeBlockActions>
  </CodeBlockHeader>
);

export const Default: Story = {
  render: () => (
    <CodeBlock code={TS_SNIPPET} language="tsx">
      {withHeader('greet.ts')}
    </CodeBlock>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={columnStyle}>
      {/* language axis */}
      <CodeBlock code={TS_SNIPPET} language="tsx" />
      <CodeBlock code={JSON_SNIPPET} language="json" />
      <CodeBlock code={BASH_SNIPPET} language="bash" />
      {/* line-number axis */}
      <CodeBlock code={TS_SNIPPET} language="tsx" showLineNumbers />
    </div>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={columnStyle}>
      {/* bare: highlighted code only */}
      <CodeBlock code={TS_SNIPPET} language="tsx" />
      {/* full chrome: header + filename + copy action */}
      <CodeBlock code={TS_SNIPPET} language="tsx">
        {withHeader('greet.ts')}
      </CodeBlock>
    </div>
  ),
};

// Module-scoped spies so the play function can assert the copy event fired.
const copyOk = fn();
const copyErr = fn();

export const CopyAction: Story = {
  render: () => (
    <CodeBlock code={TS_SNIPPET} language="tsx">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>greet.ts</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton onCopy={copyOk} onError={copyErr} />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    copyOk.mockClear();
    copyErr.mockClear();
    const canvas = within(canvasElement);
    const copyButton = await canvas.findByRole('button');

    // Clicking the copy control must invoke the copy path. Assert the handler
    // ran (success -> onCopy, blocked/absent clipboard -> onError) rather than
    // depending on real clipboard permissions in the test browser.
    await userEvent.click(copyButton);
    await waitFor(() => {
      expect(copyOk.mock.calls.length + copyErr.mock.calls.length).toBeGreaterThan(0);
    });
  },
};

export const AsyncHighlight: Story = {
  // Shiki upgrades the raw fallback asynchronously; snapshot timing is unstable.
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <CodeBlock code={TS_SNIPPET} language="tsx" />,
  play: async ({ canvasElement }) => {
    // The raw-token fallback renders the source text immediately and shiki then
    // upgrades it in place; the code text is present in both modes.
    await waitFor(() => {
      expect(canvasElement.textContent).toContain('greet');
    });
  },
};

export const Docs: Story = {
  render: () => (
    <CodeBlock code={JSON_SNIPPET} language="json">
      {withHeader('tool-call.json')}
    </CodeBlock>
  ),
};
