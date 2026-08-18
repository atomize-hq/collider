import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ChatStatus } from 'ai';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputButton,
} from './prompt-input';

const MODELS = [
  { id: 'sonnet', label: 'Sonnet 5' },
  { id: 'opus', label: 'Opus 5' },
];

type ComposerDemoProps = {
  status?: ChatStatus;
  initialMessages?: string[];
};

const ComposerDemo = ({ status = 'ready', initialMessages = [] }: ComposerDemoProps) => {
  const [messages, setMessages] = useState<string[]>(initialMessages);
  const [model, setModel] = useState<string>('sonnet');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: 480 }}>
      <div
        data-testid="composer-log"
        style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
      >
        {messages.length} sent
      </div>
      <PromptInput onSubmit={(m) => setMessages((prev) => [...prev, m.text])}>
        <PromptInputTextarea />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputButton tooltip="Add attachment">
              <PlusIcon className="size-4" />
            </PromptInputButton>
            <PromptInputSelect onValueChange={setModel} value={model}>
              <PromptInputSelectTrigger>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {MODELS.map((m) => (
                  <PromptInputSelectItem key={m.id} value={m.id}>
                    {m.label}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};

const meta = {
  title: 'AI Elements/Prompt Input',
  component: PromptInput,
  args: {
    onSubmit: () => {},
  },
} satisfies Meta<typeof PromptInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ComposerDemo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ComposerDemo status="ready" />
      <ComposerDemo status="submitted" />
      <ComposerDemo status="streaming" />
      <ComposerDemo status="error" />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <ComposerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByRole('textbox');
    textarea.focus();
    await expect(textarea).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <ComposerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByRole('textbox');
    textarea.focus();
    await userEvent.type(textarea, 'Hello world');
    await expect(textarea).toHaveValue('Hello world');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('composer-log')).toHaveTextContent('1 sent');
  },
};

export const Workflow: Story = {
  render: () => <ComposerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByRole('textbox');
    const submit = canvas.getByRole('button', { name: /submit/i });

    await userEvent.type(textarea, 'First message');
    await userEvent.click(submit);
    await expect(canvas.getByTestId('composer-log')).toHaveTextContent('1 sent');
    await expect(textarea).toHaveValue('');

    await userEvent.type(textarea, 'Second message');
    await userEvent.click(submit);
    await expect(canvas.getByTestId('composer-log')).toHaveTextContent('2 sent');
  },
};

export const SubmitStatusMotion: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <ComposerDemo status="submitted" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stop = await canvas.findByRole('button', { name: /stop/i });
    await expect(stop).toBeInTheDocument();
  },
};

export const Docs: Story = {
  render: () => <ComposerDemo />,
};
