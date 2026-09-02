import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@/components/ui/button';

import {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInLabel,
  OpenInScira,
  OpenInSeparator,
  OpenInT3,
  OpenInTrigger,
  OpenInv0,
} from './open-in-chat';

const QUERY = 'Explain the ai-elements token bridge';

const Demo = ({ query = QUERY }: { query?: string }) => (
  <OpenIn query={query}>
    <OpenInTrigger />
    <OpenInContent>
      <OpenInLabel>Continue elsewhere</OpenInLabel>
      <OpenInSeparator />
      <OpenInChatGPT />
      <OpenInClaude />
      <OpenInCursor />
      <OpenInScira />
      <OpenInT3 />
      <OpenInv0 />
    </OpenInContent>
  </OpenIn>
);

const meta = {
  title: 'AI Elements/Open In Chat',
  component: OpenIn,
  args: { query: QUERY },
  parameters: {
    a11y: {
      // Radix implements menu modality by setting `aria-hidden` on everything
      // behind the open menu, without `inert` — so the trigger underneath stays
      // focusable in the DOM and axe reads that as hidden-but-reachable. Focus is
      // in fact held inside the menu. This is Radix's mechanism, not ours, and it
      // cannot be fixed from here.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
  },
} satisfies Meta<typeof OpenIn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Default trigger */}
      <Demo />
      {/* Custom trigger */}
      <OpenIn query={QUERY}>
        <OpenInTrigger>
          <Button size="sm" type="button" variant="secondary">
            Send to another chat…
          </Button>
        </OpenInTrigger>
        <OpenInContent>
          <OpenInChatGPT />
          <OpenInClaude />
        </OpenInContent>
      </OpenIn>
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /open in chat/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /open in chat/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();

    // Enter opens the dropdown.
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('data-state', 'open');

    // Escape closes and returns focus to the trigger.
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await expect(trigger).toHaveFocus();
  },
};

export const OpenMenuFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /open in chat/i });

    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');

    // The Claude provider link resolves to claude.ai/new with query encoded.
    // asChild makes the menuitem the <a> itself, so read href directly.
    const claudeLink = await within(document.body).findByRole('menuitem', {
      name: /open in claude/i,
    });
    await expect(claudeLink).toBeInTheDocument();
    await expect(claudeLink).toHaveAttribute('href', expect.stringContaining('claude.ai/new'));
  },
};

export const MenuOpenTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /open in chat/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
