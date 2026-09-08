import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'Primitives/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '18rem' } as const;

// The open state lives here rather than in the matrix: Radix marks everything outside
// the open listbox `aria-hidden`, so a story holding several Selects fails
// `aria-hidden-focus` on the siblings the moment one opens.
export const Default: Story = {
  parameters: {
    a11y: {
      // Scoped to this story, the only one that opens the listbox. Same Radix mechanism
      // the Open In Chat story documents: modality is implemented by setting
      // `aria-hidden` on everything behind the open listbox without `inert`, so the
      // trigger underneath stays focusable in the DOM and axe reads that as
      // hidden-but-reachable. Focus is in fact held inside the listbox. At meta level
      // this would also disable the rule for the closed-state stories, where the
      // exception does not apply and a real violation could hide.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
  },
  render: () => (
    <div style={{ maxWidth: '18rem' }}>
      <Select>
        <SelectTrigger aria-label="Model">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
          <SelectItem value="sonnet">Claude Sonnet</SelectItem>
          <SelectItem value="haiku">Claude Haiku</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Content is portalled, so it renders outside canvasElement — query the document.
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }));
    await waitFor(() => expect(within(document.body).getByText('Claude Sonnet')).toBeVisible());
  },
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Select>
        <SelectTrigger aria-label="Placeholder state">
          <SelectValue placeholder="Nothing selected" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="sonnet">
        <SelectTrigger aria-label="Selected state">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
          <SelectItem value="sonnet">Claude Sonnet</SelectItem>
        </SelectContent>
      </Select>

      <Select disabled>
        <SelectTrigger aria-label="Disabled state">
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger aria-label="Grouped options">
          <SelectValue placeholder="Grouped" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Frontier</SelectLabel>
            <SelectItem value="opus">Claude Opus</SelectItem>
            <SelectItem value="sonnet">Claude Sonnet</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Fast</SelectLabel>
            <SelectItem value="haiku">Claude Haiku</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={{ maxWidth: '18rem' }}>
      <Select defaultValue="opus">
        <SelectTrigger aria-label="Model">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opus">Claude Opus</SelectItem>
          <SelectItem value="sonnet">Claude Sonnet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
