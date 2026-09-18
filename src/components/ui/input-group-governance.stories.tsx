import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from './input-group';

const meta = {
  title: 'Primitives/InputGroup',
  component: InputGroup,
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', width: '24rem' } as const;
const onAction = fn();

export const StateMatrix: Story = {
  render: () => (
    <div style={stack}>
      <InputGroup aria-label="Empty input group">
        <InputGroupAddon aria-label="Protocol">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Empty domain" placeholder="example.com" />
      </InputGroup>
      <InputGroup aria-disabled="true" aria-label="Disabled input group" data-disabled="true">
        <InputGroupAddon aria-label="Disabled protocol">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Disabled domain" disabled value="example.com" readOnly />
      </InputGroup>
      <InputGroup aria-label="Invalid input group">
        <InputGroupAddon aria-label="Invalid protocol">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-invalid aria-label="Invalid domain" value="invalid" readOnly />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Disabled domain' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Invalid domain' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  },
};

export const ButtonAction: Story = {
  render: () => (
    <InputGroup aria-label="Action input group">
      <InputGroupInput aria-label="Branch name" defaultValue="main" />
      <InputGroupAddon align="inline-end" aria-label="Branch action">
        <InputGroupButton onClick={onAction}>Checkout</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    onAction.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Checkout' }));

    await expect(onAction).toHaveBeenCalledOnce();
  },
};

export const Keyboard: Story = {
  render: () => (
    <InputGroup aria-label="Keyboard input group">
      <InputGroupInput aria-label="Keyboard branch" />
      <InputGroupAddon align="inline-end" aria-label="Keyboard action">
        <InputGroupButton onClick={onAction}>Apply</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    onAction.mockClear();
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Keyboard branch' });
    input.focus();
    await userEvent.keyboard('feature{Tab}{Enter}');

    await expect(input).toHaveValue('feature');
    await expect(onAction).toHaveBeenCalledOnce();
  },
};

export const Focus: Story = {
  render: () => (
    <InputGroup aria-label="Focused input group">
      <InputGroupAddon aria-label="Focused prefix">
        <InputGroupText>repo/</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Focused value" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Focused value' });
    input.focus();

    await expect(input).toHaveFocus();
  },
};
