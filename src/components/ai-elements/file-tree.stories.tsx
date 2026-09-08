import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { FileTree, FileTreeFile, FileTreeFolder } from './file-tree';

const onExpandedChange = fn();
const onSelect = fn();

type DemoProps = {
  defaultExpanded?: Set<string>;
  expanded?: Set<string>;
  onExpandedChange?: (expanded: Set<string>) => void;
  onSelect?: (path: string) => void;
  selectedPath?: string;
};

const TreeNodes = () => (
  <>
    <FileTreeFolder name="src" path="src">
      <FileTreeFolder name="components" path="src/components">
        <FileTreeFile name="button.tsx" path="src/components/button.tsx" />
        <FileTreeFile name="input.tsx" path="src/components/input.tsx" />
      </FileTreeFolder>
      <FileTreeFolder name="lib" path="src/lib">
        <FileTreeFile name="utils.ts" path="src/lib/utils.ts" />
      </FileTreeFolder>
      <FileTreeFile name="app.tsx" path="src/app.tsx" />
    </FileTreeFolder>
    <FileTreeFile name="package.json" path="package.json" />
  </>
);

const Demo = ({
  defaultExpanded,
  expanded,
  onExpandedChange,
  onSelect,
  selectedPath,
}: DemoProps) => (
  <div style={{ width: 440 }}>
    <FileTree
      aria-label="Project files"
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      onSelect={onSelect}
      selectedPath={selectedPath}
    >
      <TreeNodes />
    </FileTree>
  </div>
);

const ControlledDemo = () => {
  const [expanded, setExpanded] = useState(new Set(['src']));
  const [selectedPath, setSelectedPath] = useState<string>();
  return (
    <Demo
      expanded={expanded}
      onExpandedChange={setExpanded}
      onSelect={setSelectedPath}
      selectedPath={selectedPath}
    />
  );
};

const getFileTreeItem = (canvasElement: HTMLElement, name: string) => {
  const item = within(canvasElement)
    .getAllByRole('treeitem')
    .find(
      (candidate) =>
        candidate.getAttribute('aria-expanded') === null && candidate.textContent?.trim() === name
    );

  if (!item) {
    throw new Error(`File tree item not found: ${name}`);
  }

  return item;
};

const meta = {
  title: 'AI Elements/File Tree',
  component: FileTree,
} satisfies Meta<typeof FileTree>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Demo
      defaultExpanded={new Set(['src', 'src/components'])}
      selectedPath="src/components/button.tsx"
    />
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo />
      <Demo defaultExpanded={new Set(['src'])} />
      <Demo
        defaultExpanded={new Set(['src', 'src/components'])}
        selectedPath="src/components/input.tsx"
      />
      <ControlledDemo />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const SelectionAction: Story = {
  render: () => (
    <Demo
      defaultExpanded={new Set(['src', 'src/components'])}
      onExpandedChange={onExpandedChange}
      onSelect={onSelect}
    />
  ),
  play: async ({ canvasElement }) => {
    onExpandedChange.mockClear();
    onSelect.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(getFileTreeItem(canvasElement, 'button.tsx'));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith('src/components/button.tsx'));
    await userEvent.click(canvas.getByRole('button', { name: /collapse components/i }));
    await waitFor(() => expect(onExpandedChange).toHaveBeenCalled());
  },
};

export const Keyboard: Story = {
  render: () => <Demo defaultExpanded={new Set()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /expand src/i });
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Focus: Story = {
  render: () => <Demo defaultExpanded={new Set(['src'])} />,
  play: async ({ canvasElement }) => {
    const file = getFileTreeItem(canvasElement, 'app.tsx');
    file.focus();
    await expect(file).toHaveFocus();
  },
};

export const SelectionWorkflow: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /expand components/i }));
    const file = getFileTreeItem(canvasElement, 'button.tsx');
    await userEvent.click(file);
    await expect(file).toHaveAttribute('aria-selected', 'true');
  },
};

export const ExpandTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <Demo defaultExpanded={new Set()} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /expand src/i }));
  },
};

export const Docs: Story = {
  render: () => (
    <Demo
      defaultExpanded={new Set(['src', 'src/components'])}
      selectedPath="src/components/button.tsx"
    />
  ),
};
