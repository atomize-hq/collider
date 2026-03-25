/**
 * Fixture story file for infrastructure tests.
 * This is NOT a real component — it provides story IDs that the
 * storybook-proof-structure and proof-coverage validators need
 * when testing against the thinking-indicator fixture data.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

function Placeholder() {
  return <div>fixture</div>;
}

const meta = {
  title: 'AI Elements/Thinking Indicator',
  component: Placeholder,
} satisfies Meta<typeof Placeholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const VariantMatrix: Story = {};
export const StateMatrix: Story = {};
export const Motion: Story = {};
export const Docs: Story = {};
