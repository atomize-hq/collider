import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ToolUIPart } from 'ai';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from './confirmation';

type Approval =
  | { id: string; approved?: never; reason?: never }
  | { id: string; approved: boolean; reason?: string };

const REQUESTED: Approval = { id: 'call_1' };
const ACCEPTED: Approval = { id: 'call_1', approved: true };
const REJECTED: Approval = { id: 'call_1', approved: false };

type DemoProps = {
  approval?: Approval;
  state?: ToolUIPart['state'];
  onApprove?: () => void;
  onReject?: () => void;
};

const Demo = ({
  approval = REQUESTED,
  state = 'approval-requested',
  onApprove,
  onReject,
}: DemoProps) => (
  <div style={{ width: 420 }}>
    <Confirmation approval={approval} state={state}>
      <ConfirmationTitle>
        Allow the assistant to send an email to <b>customer@example.com</b>?
      </ConfirmationTitle>
      <ConfirmationRequest>
        <ConfirmationTitle> The email cannot be recalled once sent.</ConfirmationTitle>
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <ConfirmationTitle> Email was sent.</ConfirmationTitle>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <ConfirmationTitle> Cancelled by user.</ConfirmationTitle>
      </ConfirmationRejected>
      <ConfirmationActions>
        <ConfirmationAction variant="outline" onClick={onReject}>
          Reject
        </ConfirmationAction>
        <ConfirmationAction onClick={onApprove}>Approve</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  </div>
);

const meta = {
  title: 'AI Elements/Confirmation',
  component: Confirmation,
  args: { approval: REQUESTED, state: 'approval-requested' },
} satisfies Meta<typeof Confirmation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Demo />,
};

export const StateMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Demo approval={REQUESTED} state="approval-requested" />
      <Demo approval={ACCEPTED} state="approval-responded" />
      <Demo approval={REJECTED} state="approval-responded" />
    </div>
  ),
};

export const Focus: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const approve = await canvas.findByRole('button', { name: /approve/i });
    approve.focus();
    await expect(approve).toHaveFocus();
  },
};

export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reject = await canvas.findByRole('button', { name: /reject/i });
    reject.focus();
    await userEvent.tab();
    const approve = await canvas.findByRole('button', { name: /approve/i });
    await expect(approve).toHaveFocus();
  },
};

const ApproveFlowDemo = () => {
  const [state, setState] = useState<ToolUIPart['state']>('approval-requested');
  const [approval, setApproval] = useState<Approval>(REQUESTED);
  return (
    <Demo
      approval={approval}
      state={state}
      onApprove={() => {
        setApproval(ACCEPTED);
        setState('approval-responded');
      }}
      onReject={() => {
        setApproval(REJECTED);
        setState('approval-responded');
      }}
    />
  );
};

export const ApproveFlow: Story = {
  render: () => <ApproveFlowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const approve = await canvas.findByRole('button', { name: /approve/i });
    await userEvent.click(approve);
    await expect(await canvas.findByText(/email was sent/i)).toBeInTheDocument();
  },
};

export const ResponseTransition: Story = {
  parameters: { chromatic: { pauseAnimationAtEnd: true } },
  render: () => <ApproveFlowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const approve = await canvas.findByRole('button', { name: /approve/i });
    await userEvent.click(approve);
  },
};

export const Docs: Story = {
  render: () => <Demo />,
};
