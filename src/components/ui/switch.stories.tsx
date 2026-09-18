import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Switch } from './switch';

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  args: {
    'aria-label': 'Enable feature',
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: '1rem' } as const;

export const Default: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div style={row}>
      <Switch aria-label="Default switch" />
      <Switch aria-label="Small switch" size="sm" />
      <Switch aria-label="Checked switch" defaultChecked />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <label style={row}>
      <Switch />
      Enable automatic updates
    </label>
  ),
};
