import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Image } from './image';

const LANDSCAPE_16x9 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiB2aWV3Qm94PSIwIDAgMzIwIDE4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeDI9IjEiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMTU1ZGZjIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMGIzYWEzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIxODAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSIxNjAiIHk9Ijk2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2VuZXJhdGVkIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const PORTRAIT_2x3 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMjQwIiB2aWV3Qm94PSIwIDAgMTYwIDI0MCI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiM3YzNhZWQiLz48Y2lyY2xlIGN4PSI4MCIgY3k9Ijk2IiByPSIzNiIgZmlsbD0iI2ZiYmYyNCIvPjxyZWN0IHg9IjIwIiB5PSIxNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNjQiIHJ4PSIxMiIgZmlsbD0iI2Y0NzJiNiIvPjwvc3ZnPg==';

const SQUARE_1x1 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMwZjc2NmUiLz48cG9seWdvbiBwb2ludHM9IjEwMCwyMCAxODAsMTgwIDIwLDE4MCIgZmlsbD0iI2YwYWJmYyIvPjwvc3ZnPg==';

const EMPTY_UINT8 = new Uint8Array();

const meta = {
  title: 'AI Elements/Image',
  component: Image,
  args: {
    base64: LANDSCAPE_16x9,
    mediaType: 'image/svg+xml',
    uint8Array: EMPTY_UINT8,
    alt: 'Generated landscape image',
  },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Image {...args} />
    </div>
  ),
};

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ width: 240 }}>
        <Image
          alt="Landscape 16:9"
          base64={LANDSCAPE_16x9}
          mediaType="image/svg+xml"
          uint8Array={EMPTY_UINT8}
        />
      </div>
      <div style={{ width: 160 }}>
        <Image
          alt="Square"
          base64={SQUARE_1x1}
          mediaType="image/svg+xml"
          uint8Array={EMPTY_UINT8}
        />
      </div>
      <div style={{ width: 120 }}>
        <Image
          alt="Portrait 2:3"
          base64={PORTRAIT_2x3}
          mediaType="image/svg+xml"
          uint8Array={EMPTY_UINT8}
        />
      </div>
    </div>
  ),
};

export const Docs: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Image {...args} />
    </div>
  ),
};
