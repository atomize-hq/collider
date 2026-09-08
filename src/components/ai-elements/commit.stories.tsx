import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Commit,
  CommitActions,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitContent,
  CommitCopyButton,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileIcon,
  CommitFileInfo,
  CommitFilePath,
  CommitFileStatus,
  CommitFiles,
  CommitHash,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitTimestamp,
} from './commit';

const HASH = '2a56aa8f0d1c9e4b7a3d5e6f8b9c0d1e2f3a4b5c';
const TWO_DAYS_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);

type DemoProps = {
  defaultOpen?: boolean;
  fileCount?: number;
  message?: string;
};

const DEMO_FILES = [
  { path: 'src/components/ai-elements/commit.tsx', status: 'added' as const, add: 152, del: 0 },
  { path: 'src/components/ui/avatar.tsx', status: 'added' as const, add: 50, del: 0 },
  {
    path: 'src/components/ai-elements/commit.stories.tsx',
    status: 'modified' as const,
    add: 34,
    del: 12,
  },
  { path: 'docs/ai-elements-inventory.md', status: 'modified' as const, add: 4, del: 4 },
];

const Demo = ({
  defaultOpen = false,
  fileCount = DEMO_FILES.length,
  message = 'feat(ai-elements): seed Commit through Stage-2 loop',
}: DemoProps) => (
  <div style={{ width: 560 }}>
    <Commit defaultOpen={defaultOpen}>
      <CommitHeader
        actions={
          <CommitActions>
            <CommitCopyButton hash={HASH} />
          </CommitActions>
        }
      >
        <CommitAuthor>
          <CommitAuthorAvatar initials="SM" />
        </CommitAuthor>
        <CommitInfo>
          <CommitMessage>{message}</CommitMessage>
          <CommitMetadata>
            <CommitHash>{HASH.slice(0, 7)}</CommitHash>
            <CommitSeparator />
            <span>spenquatch</span>
            <CommitSeparator />
            <CommitTimestamp date={TWO_DAYS_AGO} />
          </CommitMetadata>
        </CommitInfo>
      </CommitHeader>
      <CommitContent>
        <CommitFiles>
          {DEMO_FILES.slice(0, fileCount).map((file) => (
            <CommitFile key={file.path}>
              <CommitFileInfo>
                <CommitFileStatus status={file.status} />
                <CommitFileIcon />
                <CommitFilePath>{file.path}</CommitFilePath>
              </CommitFileInfo>
              <CommitFileChanges>
                <CommitFileAdditions count={file.add} />
                <CommitFileDeletions count={file.del} />
              </CommitFileChanges>
            </CommitFile>
          ))}
        </CommitFiles>
      </CommitContent>
    </Commit>
  </div>
);

const meta = {
  title: 'AI Elements/Commit',
  component: Commit,
} satisfies Meta<typeof Commit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo />
      <Demo defaultOpen />
      <Demo message="fix: correctly handle empty diff" fileCount={1} />
    </div>
  ),
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvasElement.querySelector('[aria-expanded]') as HTMLElement | null;
    if (!trigger) throw new Error('collapsible trigger missing');
    trigger.focus();
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copyButton = canvas.getAllByRole('button').at(-1);
    if (!copyButton) throw new Error('copy button missing');
    copyButton.focus();
    await expect(copyButton).toHaveFocus();
  },
};

export const ExpandWorkflow: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvasElement.querySelector('[aria-expanded]') as HTMLElement | null;
    if (!trigger) throw new Error('collapsible trigger missing');
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
    const trigger = canvasElement.querySelector('[aria-expanded]') as HTMLElement | null;
    if (!trigger) throw new Error('collapsible trigger missing');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');
  },
};

export const Docs: Story = {
  render: () => <Demo defaultOpen />,
};
