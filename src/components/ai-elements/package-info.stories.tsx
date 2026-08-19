import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  PackageInfo,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
  PackageInfoDescription,
} from './package-info';

const meta = {
  title: 'AI Elements/Package Info',
  component: PackageInfo,
  args: { name: 'next' },
} satisfies Meta<typeof PackageInfo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <PackageInfo name="next" currentVersion="15.2.4" newVersion="15.3.0" changeType="minor">
        <PackageInfoDescription>
          The React framework for the web. Minor bump includes app-router streaming improvements and
          a Turbopack fix.
        </PackageInfoDescription>
        <PackageInfoContent>
          <PackageInfoDependencies>
            <PackageInfoDependency name="react" version="^19.0.0" />
            <PackageInfoDependency name="react-dom" version="^19.0.0" />
            <PackageInfoDependency name="@next/env" version="15.3.0" />
          </PackageInfoDependencies>
        </PackageInfoContent>
      </PackageInfo>
    </div>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 480 }}>
      {/* All 5 change types, each with a version bump */}
      <PackageInfo name="react" currentVersion="18.3.1" newVersion="19.0.0" changeType="major" />
      <PackageInfo name="next" currentVersion="15.2.4" newVersion="15.3.0" changeType="minor" />
      <PackageInfo name="typescript" currentVersion="5.8.2" newVersion="5.8.3" changeType="patch" />
      <PackageInfo name="@tanstack/react-query" newVersion="5.62.0" changeType="added" />
      <PackageInfo name="lodash" currentVersion="4.17.21" changeType="removed" />
      {/* No change: just a package card */}
      <PackageInfo name="tailwindcss" currentVersion="4.0.0" />
    </div>
  ),
};

export const Docs: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <PackageInfo
        name="@radix-ui/react-accordion"
        currentVersion="1.2.0"
        newVersion="1.2.2"
        changeType="patch"
      >
        <PackageInfoDescription>
          Accessible accordion primitives. Patch fixes focus-loop when a disabled item is skipped.
        </PackageInfoDescription>
      </PackageInfo>
    </div>
  ),
};
