import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { loadPilotRecipeDocsModel } from '../../../src/lib/tokens/pilotRecipeDocs';
import { PilotRecipeContractPage } from './pilotRecipeContractPage';

const docsModel = loadPilotRecipeDocsModel();

const meta = {
  title: 'Contracts/Pilot Recipe',
  parameters: {
    layout: 'padded',
  },
  render: () => <PilotRecipeContractPage model={docsModel} />,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThinkingIndicatorRecipe: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstAxis = docsModel.variantAxes[0];

    await expect(canvas.getByRole('heading', { name: docsModel.componentId })).toBeVisible();
    await expect(canvas.getByText(docsModel.sourceFile)).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Variant Axes' })).toBeVisible();
    await expect(canvas.getByText(firstAxis.name)).toBeVisible();
    await expect(canvas.getByText(firstAxis.values.join(', '))).toBeVisible();
  },
};

export const Documentation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstAxis = docsModel.variantAxes[0];

    await expect(canvas.getByRole('heading', { name: docsModel.componentId })).toBeVisible();
    await expect(canvas.getByText(docsModel.sourceFile)).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Variant Axes' })).toBeVisible();
    await expect(canvas.getByText(firstAxis.name)).toBeVisible();
    await expect(canvas.getByText(firstAxis.values.join(', '))).toBeVisible();
    await expect(canvas.getByText('disabled -> rest, focus -> rest, hover -> rest')).toBeVisible();
  },
};
