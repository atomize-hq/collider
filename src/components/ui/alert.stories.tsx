import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './alert';

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem' } as const;

export const Default: Story = {
  render: () => (
    <Alert>
      <CheckCircle2Icon />
      <AlertTitle>Deployment complete</AlertTitle>
      <AlertDescription>Collider passed its preflight checks.</AlertDescription>
    </Alert>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Ready to continue</AlertTitle>
        <AlertDescription>The workspace is synchronized.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Preflight failed</AlertTitle>
        <AlertDescription>Resolve the failing checks before pushing.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        Alerts communicate important status without requiring an action.
      </AlertDescription>
    </Alert>
  ),
};
