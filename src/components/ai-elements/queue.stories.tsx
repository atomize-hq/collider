import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckIcon, ListTodoIcon, XIcon } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';

import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from './queue';

type SectionState = 'open' | 'closed';

type DemoProps = {
  queuedState?: SectionState;
  completedState?: SectionState;
  queuedItems?: Array<{ id: string; title: string; description?: string; attachment?: string }>;
  completedItems?: Array<{ id: string; title: string }>;
};

const QUEUED = [
  {
    id: 'q1',
    title: 'Draft the launch announcement',
    description: 'Finalize release notes · ship Thu',
  },
  {
    id: 'q2',
    title: 'Reply to design-review thread',
    attachment: 'rfc-notes.md',
  },
];

const COMPLETED = [{ id: 'c1', title: 'Ship attachments seed rebuild' }];

const Demo = ({
  queuedState = 'open',
  completedState = 'closed',
  queuedItems = QUEUED,
  completedItems = COMPLETED,
}: DemoProps) => (
  <div style={{ width: 360 }}>
    <Queue>
      <QueueSection defaultOpen={queuedState === 'open'}>
        <QueueSectionTrigger>
          <QueueSectionLabel
            icon={<ListTodoIcon className="size-4" />}
            count={queuedItems.length}
            label="Queued"
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {queuedItems.map((item) => (
              <QueueItem key={item.id}>
                <div className="flex items-start gap-2">
                  <QueueItemIndicator />
                  <QueueItemContent>{item.title}</QueueItemContent>
                  <QueueItemActions>
                    <QueueItemAction aria-label={`Remove ${item.title}`}>
                      <XIcon size={14} />
                    </QueueItemAction>
                  </QueueItemActions>
                </div>
                {item.description && (
                  <QueueItemDescription>{item.description}</QueueItemDescription>
                )}
                {item.attachment && (
                  <QueueItemAttachment>
                    <QueueItemFile>{item.attachment}</QueueItemFile>
                  </QueueItemAttachment>
                )}
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
      <QueueSection defaultOpen={completedState === 'open'}>
        <QueueSectionTrigger>
          <QueueSectionLabel
            icon={<CheckIcon className="size-4" />}
            count={completedItems.length}
            label="Completed"
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {completedItems.map((item) => (
              <QueueItem key={item.id}>
                <div className="flex items-start gap-2">
                  <QueueItemIndicator completed />
                  <QueueItemContent completed>{item.title}</QueueItemContent>
                </div>
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  </div>
);

const meta = {
  title: 'AI Elements/Queue',
  component: Queue,
} satisfies Meta<typeof Queue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* All pending, both sections open */}
      <Demo queuedState="open" completedState="open" completedItems={[]} />
      {/* Mixed, default state */}
      <Demo />
      {/* All completed, queued empty */}
      <Demo
        queuedItems={[]}
        completedState="open"
        completedItems={[
          { id: 'c1', title: 'Draft the launch announcement' },
          { id: 'c2', title: 'Reply to design-review thread' },
        ]}
      />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /2 Queued/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo queuedState="closed" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /2 Queued/i });
    trigger.focus();
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const ExpandCollapseFlow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /2 Queued/i });
    await expect(trigger).toHaveAttribute('data-state', 'open');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const ChevronRotate: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo queuedState="closed" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /2 Queued/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
