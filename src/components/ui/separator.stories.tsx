import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Separator } from './separator';

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '20rem' }}>
      <span>Before</span>
      <Separator className="my-4" />
      <span>After</span>
    </div>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ width: '12rem' }}>
        Horizontal
        <Separator className="my-2" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: '4rem', gap: '1rem' }}>
        Left
        <Separator orientation="vertical" />
        Right
      </div>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={{ width: '20rem' }}>
      <h3>Section heading</h3>
      <Separator className="my-3" />
      <p>Related content follows a decorative separator.</p>
    </div>
  ),
};
