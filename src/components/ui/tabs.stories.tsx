import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

function Content() {
  return (
    <>
      <TabsContent value="overview">Repository overview</TabsContent>
      <TabsContent value="activity">Recent activity</TabsContent>
      <TabsContent value="settings">Workspace settings</TabsContent>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Tabs className="w-96" defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <Content />
    </Tabs>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex gap-12">
      <Tabs className="w-96" defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <Content />
      </Tabs>
      <Tabs className="w-64" defaultValue="overview" orientation="vertical">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <Content />
      </Tabs>
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <Tabs className="w-96" defaultValue="activity">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <Content />
    </Tabs>
  ),
};
