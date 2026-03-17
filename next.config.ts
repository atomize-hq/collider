import type { NextConfig } from 'next';

// Static export is only needed for the Tauri production bundle.
// Normal `next build` + `next start` use the default SSR/Node server.
const isTauriBuild = process.env.TAURI === 'true';

const nextConfig: NextConfig = {
  ...(isTauriBuild && { output: 'export', distDir: 'out' }),
};

export default nextConfig;
