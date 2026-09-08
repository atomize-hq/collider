import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Snippet, SnippetAddon, SnippetCopyButton, SnippetInput, SnippetText } from './snippet';

const CODE = 'pnpm add ai-elements';

const onCopy = fn();

const meta = {
  title: 'AI Elements/Snippet',
  component: Snippet,
  args: { code: CODE },
} satisfies Meta<typeof Snippet>;

export default meta;

type Story = StoryObj<typeof meta>;

const stubClipboard = () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => {} },
  });
};

export const Default: Story = {
  render: () => (
    <Snippet code={CODE}>
      <SnippetAddon>
        <SnippetText>$</SnippetText>
      </SnippetAddon>
      <SnippetInput />
      <SnippetAddon align="inline-end">
        <SnippetCopyButton />
      </SnippetAddon>
    </Snippet>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: 480 }}>
      {/* Bare — no addons */}
      <Snippet code={CODE}>
        <SnippetInput />
      </Snippet>
      {/* Command prompt prefix + copy */}
      <Snippet code={CODE}>
        <SnippetAddon>
          <SnippetText>$</SnippetText>
        </SnippetAddon>
        <SnippetInput />
        <SnippetAddon align="inline-end">
          <SnippetCopyButton />
        </SnippetAddon>
      </Snippet>
      {/* Language tag on the right */}
      <Snippet code={CODE}>
        <SnippetInput />
        <SnippetAddon align="inline-end">
          <SnippetText>bash</SnippetText>
          <SnippetCopyButton />
        </SnippetAddon>
      </Snippet>
    </div>
  ),
};

export const CopyAction: Story = {
  render: () => (
    <Snippet code={CODE}>
      <SnippetAddon>
        <SnippetText>$</SnippetText>
      </SnippetAddon>
      <SnippetInput />
      <SnippetAddon align="inline-end">
        <SnippetCopyButton onCopy={onCopy} />
      </SnippetAddon>
    </Snippet>
  ),
  play: async ({ canvasElement }) => {
    onCopy.mockClear();
    stubClipboard();
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Copy' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  },
};

export const Keyboard: Story = {
  render: () => (
    <Snippet code={CODE}>
      <SnippetAddon>
        <SnippetText>$</SnippetText>
      </SnippetAddon>
      <SnippetInput />
      <SnippetAddon align="inline-end">
        <SnippetCopyButton onCopy={onCopy} />
      </SnippetAddon>
    </Snippet>
  ),
  play: async ({ canvasElement }) => {
    onCopy.mockClear();
    stubClipboard();
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Copy' });
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  },
};

export const Focus: Story = {
  render: () => (
    <Snippet code={CODE}>
      <SnippetAddon>
        <SnippetText>$</SnippetText>
      </SnippetAddon>
      <SnippetInput />
      <SnippetAddon align="inline-end">
        <SnippetCopyButton />
      </SnippetAddon>
    </Snippet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Copy' });
    button.focus();
    await expect(button).toHaveFocus();
  },
};

export const Docs: Story = {
  render: () => (
    <Snippet code={CODE}>
      <SnippetAddon>
        <SnippetText>$</SnippetText>
      </SnippetAddon>
      <SnippetInput />
      <SnippetAddon align="inline-end">
        <SnippetCopyButton />
      </SnippetAddon>
    </Snippet>
  ),
};
