import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SearchIcon, XIcon } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group';

const meta = {
  title: 'Primitives/InputGroup',
  component: InputGroup,
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', width: '24rem' } as const;

export const Default: Story = {
  render: () => (
    <InputGroup aria-label="Repository search">
      <InputGroupAddon aria-label="Search icon">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search repositories" placeholder="Search repositories" />
    </InputGroup>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <InputGroup aria-label="URL input">
        <InputGroupAddon aria-label="URL protocol">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" placeholder="example.com" />
      </InputGroup>
      <InputGroup aria-label="Clearable search">
        <InputGroupInput aria-label="Query" defaultValue="Collider" />
        <InputGroupAddon align="inline-end" aria-label="Clear action">
          <InputGroupButton aria-label="Clear query" size="icon-xs">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup aria-label="Prompt input">
        <InputGroupAddon align="block-start" aria-label="Prompt label">
          <InputGroupText>Prompt</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea aria-label="Prompt" placeholder="Describe the task" />
      </InputGroup>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <InputGroup aria-label="Command input">
      <InputGroupAddon aria-label="Command prompt">
        <InputGroupText>$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Command" placeholder="just preflight" />
      <InputGroupAddon align="inline-end" aria-label="Keyboard shortcut">
        <InputGroupText>⌘↵</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};
