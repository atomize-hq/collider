import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableGroup,
  EnvironmentVariableName,
  EnvironmentVariableRequired,
  EnvironmentVariableValue,
  EnvironmentVariables,
  EnvironmentVariablesContent,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
} from './environment-variables';

const onShowValuesChange = fn();

type DemoProps = {
  defaultShowValues?: boolean;
  onShowValuesChange?: (show: boolean) => void;
  showValues?: boolean;
};

const Demo = ({ defaultShowValues, onShowValuesChange, showValues }: DemoProps) => (
  <div style={{ width: 480 }}>
    <EnvironmentVariables
      defaultShowValues={defaultShowValues}
      onShowValuesChange={onShowValuesChange}
      showValues={showValues}
    >
      <EnvironmentVariablesHeader>
        <EnvironmentVariablesTitle />
        <EnvironmentVariablesToggle />
      </EnvironmentVariablesHeader>
      <EnvironmentVariablesContent>
        <EnvironmentVariable name="OPENAI_API_KEY" value="sk-proj-6yk1exampleApiKey">
          <EnvironmentVariableGroup>
            <EnvironmentVariableName />
            <EnvironmentVariableRequired />
          </EnvironmentVariableGroup>
          <EnvironmentVariableGroup>
            <EnvironmentVariableValue />
            <EnvironmentVariableCopyButton aria-label="Copy OPENAI_API_KEY" />
          </EnvironmentVariableGroup>
        </EnvironmentVariable>
        <EnvironmentVariable name="NEXT_PUBLIC_APP_URL" value="https://collider.local">
          <EnvironmentVariableName />
          <EnvironmentVariableValue />
        </EnvironmentVariable>
      </EnvironmentVariablesContent>
    </EnvironmentVariables>
  </div>
);

const meta = {
  title: 'AI Elements/Environment Variables',
  component: EnvironmentVariables,
} satisfies Meta<typeof EnvironmentVariables>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo />
      <Demo defaultShowValues />
      <Demo showValues />
    </div>
  ),
};

export const VisibilityAction: Story = {
  render: () => <Demo onShowValuesChange={onShowValuesChange} />,
  play: async ({ canvasElement }) => {
    onShowValuesChange.mockClear();
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('switch', { name: /toggle value visibility/i });
    await userEvent.click(toggle);
    await waitFor(() => {
      expect(onShowValuesChange).toHaveBeenCalledWith(true);
    });
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('switch', { name: /toggle value visibility/i });
    toggle.focus();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('data-state', 'checked');
  },
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('switch', { name: /toggle value visibility/i });
    toggle.focus();
    await expect(toggle).toHaveFocus();
  },
};

export const Docs: Story = {
  render: () => <Demo defaultShowValues />,
};
