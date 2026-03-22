import path from 'node:path';
import fs from 'node:fs';
import { build } from 'esbuild';

const repoRoot = path.resolve(process.cwd());
const pluginRoot = path.join(repoRoot, 'figma/plugins/collider-token-sync');
const uiHtml = fs.readFileSync(path.join(pluginRoot, 'ui.html'), 'utf8');

await build({
  entryPoints: [path.join(pluginRoot, 'code.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2017',
  sourcemap: true,
  outfile: path.join(pluginRoot, 'code.js'),
  define: {
    __html__: JSON.stringify(uiHtml),
  },
  loader: {
    '.html': 'text',
  },
  logLevel: 'info',
});

process.stdout.write(
  `✓ Built Figma plugin at ${path.relative(repoRoot, pluginRoot)} (import manifest.json into Figma)\n`
);
