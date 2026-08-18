import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from './task';

const TITLE = 'Searching the codebase';

const items = () => (
  <>
    <TaskItem>Scanning the repository for token definitions</TaskItem>
    <TaskItem>
      Reading{' '}
      <TaskItemFile>
        <span>globals.css</span>
      </TaskItemFile>{' '}
      for the shadcn bridge
    </TaskItem>
    <TaskItem>Cross-referencing against the Figma variables</TaskItem>
  </>
);

const meta = {
  title: 'AI Elements/Task',
  component: Task,
} satisfies Meta<typeof Task>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Task defaultOpen>
      <TaskTrigger title={TITLE} />
      <TaskContent>{items()}</TaskContent>
    </Task>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '32rem' }}>
      {/* collapsed */}
      <Task defaultOpen={false}>
        <TaskTrigger title={TITLE} />
        <TaskContent>{items()}</TaskContent>
      </Task>
      {/* expanded */}
      <Task defaultOpen>
        <TaskTrigger title={TITLE} />
        <TaskContent>{items()}</TaskContent>
      </Task>
    </div>
  ),
};

export const Focus: Story = {
  render: () => (
    <Task defaultOpen>
      <TaskTrigger title={TITLE} />
      <TaskContent>{items()}</TaskContent>
    </Task>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Task defaultOpen={false}>
      <TaskTrigger title={TITLE} />
      <TaskContent>{items()}</TaskContent>
    </Task>
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
    <Task defaultOpen={false}>
      <TaskTrigger title={TITLE} />
      <TaskContent>{items()}</TaskContent>
    </Task>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    // Closed: task items are not mounted.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText(/Scanning the repository/i)).not.toBeInTheDocument();

    // Expand: the item list mounts.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText(/Scanning the repository/i)).toBeInTheDocument();

    // Collapse again.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CollapseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => (
    <Task defaultOpen>
      <TaskTrigger title={TITLE} />
      <TaskContent>{items()}</TaskContent>
    </Task>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Docs: Story = {
  render: () => (
    <Task defaultOpen>
      <TaskTrigger title="Ran 3 steps" />
      <TaskContent>
        <TaskItem>Parsed the request</TaskItem>
        <TaskItem>
          Edited{' '}
          <TaskItemFile>
            <span>tool.tsx</span>
          </TaskItemFile>
        </TaskItem>
        <TaskItem>Verified in Storybook</TaskItem>
      </TaskContent>
    </Task>
  ),
};
