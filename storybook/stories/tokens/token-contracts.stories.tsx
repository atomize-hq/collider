import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TokenDocsPage } from '../../tokens/token-docs-presenter';

const meta = {
  title: 'Contracts/Tokens',
  component: TokenDocsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Generated token categories and theme metadata rendered directly from CT-5 artifacts.',
      },
    },
  },
  render: () => <TokenDocsPage />,
} satisfies Meta<typeof TokenDocsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  // Chromatic cannot capture this story, and no layout change fixes it. The
  // registry is 653 tokens, which renders 1200x88,925px -- ~107M pixels
  // against Chromatic's 25,000,000px limit, so at this width the story would
  // have to fit in ~20,833px. Build 22 reported it, and
  // `Contracts/Generated Tokens` at 1200x43,080px, as the build's only two
  // component errors.
  //
  // Not snapshotting it costs nothing real: a whole-registry visual diff
  // repaints on any token change, so it could never isolate a regression. The
  // contract this story exists to prove is structural, asserted below, and the
  // a11y gate still audits every node of it in `Test All`.
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByTestId('token-docs-root')).toBeTruthy();
    expect(await canvas.findByTestId('token-docs-themes')).toBeTruthy();
    expect(await canvas.findByTestId('token-group-core')).toBeTruthy();
    expect(await canvas.findByTestId('token-group-semantic')).toBeTruthy();
    expect(await canvas.findByText('semantic.color.background.base')).toBeTruthy();
    expect(await canvas.findByTestId('token-docs-source-path')).toBeTruthy();
  },
};
