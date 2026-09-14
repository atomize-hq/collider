import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  title: 'Primitives/Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '32rem' } as const;

export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle>Deploy to production</CardTitle>
        <CardDescription>Runs the full preflight gate before promoting.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Last deploy: 4 hours ago by spenquatch.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={stack}>
      <Card>
        <CardHeader>
          <CardTitle>Header only</CardTitle>
          <CardDescription>Title and description, no body.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>Header with an action</CardTitle>
            <CardDescription>The action should sit to the right of the title.</CardDescription>
          </div>
          <CardAction>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The action shares the header row without displacing the description.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>With a footer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Body copy.</p>
        </CardContent>
        <CardFooter style={{ gap: '0.5rem' }}>
          <Button size="sm">Confirm</Button>
          <Button size="sm" variant="ghost">
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText('Header with an action');
    const action = canvas.getByRole('button', { name: 'Edit' });

    expect(action.getBoundingClientRect().top).toBeLessThan(title.getBoundingClientRect().bottom);
  },
};

export const Docs: Story = {
  render: () => (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle>Card</CardTitle>
        <CardDescription>Header, content and footer regions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Body.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          Action
        </Button>
      </CardFooter>
    </Card>
  ),
};
