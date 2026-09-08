import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Message, MessageContent } from './message';

const meta = {
  title: 'AI Elements/Message',
  component: Message,
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

const columnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1rem',
};

export const Default: Story = {
  args: { from: 'assistant' },
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        Hi, I am the assistant. Ask me to scaffold a component and I will route it through the Stage
        2 round-trip loop.
      </MessageContent>
    </Message>
  ),
};

export const VariantMatrix: Story = {
  args: { from: 'user' },
  render: () => (
    <div style={columnStyle}>
      <Message from="user">
        <MessageContent>Can you scaffold the Message stories?</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          Done. Default, VariantMatrix, and Docs are wired to the proof system.
        </MessageContent>
      </Message>
    </div>
  ),
};

export const Docs: Story = {
  args: { from: 'assistant' },
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        The Message primitive: the from prop drives user vs assistant alignment and surface
        treatment.
      </MessageContent>
    </Message>
  ),
};
