import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CopyIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from './artifact';

const SAMPLE_CODE = `export const greet = (name: string) => {
  return \`Hello, \${name}!\`;
};`;

const onClose = fn();
const onCopy = fn();

const meta = {
  title: 'AI Elements/Artifact',
  component: Artifact,
} satisfies Meta<typeof Artifact>;

export default meta;

type Story = StoryObj<typeof meta>;

const Demo = ({
  withDescription = true,
  withActions = true,
}: {
  withDescription?: boolean;
  withActions?: boolean;
}) => (
  <div style={{ width: 480 }}>
    <Artifact>
      <ArtifactHeader>
        <div>
          <ArtifactTitle>greet.ts</ArtifactTitle>
          {withDescription && <ArtifactDescription>Generated 2 minutes ago</ArtifactDescription>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {withActions && (
            <ArtifactActions>
              <ArtifactAction icon={CopyIcon} label="Copy" onClick={onCopy} tooltip="Copy" />
              <ArtifactAction icon={DownloadIcon} label="Download" tooltip="Download" />
              <ArtifactAction icon={RefreshCwIcon} label="Regenerate" tooltip="Regenerate" />
            </ArtifactActions>
          )}
          <ArtifactClose onClick={onClose} />
        </div>
      </ArtifactHeader>
      <ArtifactContent>
        <pre style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
          {SAMPLE_CODE}
        </pre>
      </ArtifactContent>
    </Artifact>
  </div>
);

export const Default: Story = {
  render: () => <Demo />,
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Full: title + description + actions + close */}
      <Demo />
      {/* Compact: title + close only */}
      <Demo withActions={false} withDescription={false} />
      {/* Title + description only */}
      <Demo withActions={false} />
    </div>
  ),
};

export const CopyAction: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onCopy.mockClear();
    const canvas = within(canvasElement);
    const copyButton = await canvas.findByRole('button', { name: 'Copy' });
    await userEvent.click(copyButton);
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    onClose.mockClear();
    const canvas = within(canvasElement);
    const closeButton = await canvas.findByRole('button', { name: 'Close' });
    closeButton.focus();
    await expect(closeButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  },
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copyButton = await canvas.findByRole('button', { name: 'Copy' });
    copyButton.focus();
    await expect(copyButton).toHaveFocus();
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
