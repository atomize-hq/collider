import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const onValueChange = fn();

function Triggers() {
  return (
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Active tab</TabsTrigger>
        <TabsTrigger value="activity">Inactive tab</TabsTrigger>
        <TabsTrigger disabled value="disabled">
          Disabled tab
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Active content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Active tab' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByRole('tab', { name: 'Inactive tab' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(canvas.getByRole('tab', { name: 'Disabled tab' })).toBeDisabled();
  },
};

export const ValueAction: Story = {
  render: () => (
    <Tabs defaultValue="overview" onValueChange={onValueChange}>
      <Triggers />
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
      <TabsContent value="settings">Settings content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    onValueChange.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Settings' }));

    await expect(canvas.getByText('Settings content')).toBeVisible();
    await expect(onValueChange).toHaveBeenCalledWith('settings');
  },
};

export const Keyboard: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <Triggers />
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
      <TabsContent value="settings">Settings content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const activity = canvas.getByRole('tab', { name: 'Activity' });
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(activity).toHaveFocus();
    await expect(activity).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('Activity content')).toBeVisible();
  },
};

export const Focus: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <Triggers />
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
      <TabsContent value="settings">Settings content</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole('tab', { name: 'Overview' });
    tab.focus();

    await expect(tab).toHaveFocus();
  },
};
