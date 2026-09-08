import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckIcon, FileIcon, SearchIcon } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from './chain-of-thought';

const steps = () => (
  <>
    <ChainOfThoughtStep
      description="Found 3 files defining color tokens"
      icon={SearchIcon}
      label="Searching the codebase"
      status="complete"
    />
    <ChainOfThoughtStep icon={FileIcon} label="Reading the token sources" status="active">
      <ChainOfThoughtSearchResults>
        <ChainOfThoughtSearchResult>globals.css</ChainOfThoughtSearchResult>
        <ChainOfThoughtSearchResult>tokens.css</ChainOfThoughtSearchResult>
      </ChainOfThoughtSearchResults>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep
      icon={CheckIcon}
      label="Cross-referencing the Figma variables"
      status="pending"
    />
  </>
);

const meta = {
  title: 'AI Elements/Chain Of Thought',
  component: ChainOfThought,
} satisfies Meta<typeof ChainOfThought>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  ),
};

export const VariantMatrix: Story = {
  // The step `status` axis: complete (muted), active (foreground), pending (dim).
  render: () => (
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>Step statuses</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep icon={CheckIcon} label="Complete step" status="complete" />
          <ChainOfThoughtStep icon={SearchIcon} label="Active step" status="active" />
          <ChainOfThoughtStep icon={FileIcon} label="Pending step" status="pending" />
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '32rem' }}>
      {/* collapsed */}
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
      {/* expanded */}
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  ),
};

export const Focus: Story = {
  render: () => (
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
    </div>
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
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
    </div>
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
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button');

    // Closed: step content is not visible.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText('Searching the codebase')).not.toBeInTheDocument();

    // Expand: steps mount.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText('Searching the codebase')).toBeInTheDocument();

    // Collapse again.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const CollapseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => (
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader />
        <ChainOfThoughtContent>{steps()}</ChainOfThoughtContent>
      </ChainOfThought>
    </div>
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
    <div style={{ maxWidth: '32rem' }}>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>Reasoning trace</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep icon={SearchIcon} label="Parsed the request" status="complete" />
          <ChainOfThoughtStep icon={CheckIcon} label="Produced the answer" status="active" />
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  ),
};
