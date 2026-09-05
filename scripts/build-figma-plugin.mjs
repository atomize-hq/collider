#!/usr/bin/env node
/**
 * Build the Figma token-sync plugin for this repo.
 *
 * The plugin itself lives in @atomize-hq/figma-token-rail; everything specific
 * to Collider — collection name, artifact URL, `$extensions` namespace, default
 * theme, plugin name and id — is in figma/token-sync.config.json.
 *
 * Output stays at figma/plugins/collider-token-sync/ so the import path in
 * src/figma/pilot-setup.md and docs/stage1/ds-phase-2-plan.md keeps working.
 */
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const packageRoot = path.dirname(require.resolve('@atomize-hq/figma-token-rail/package.json'));
const repoRoot = process.cwd();

const result = spawnSync(
  process.execPath,
  [
    path.join(packageRoot, 'plugin/build.mjs'),
    '--config',
    path.join(repoRoot, 'figma/token-sync.config.json'),
    '--out',
    path.join(repoRoot, 'figma/plugins/collider-token-sync'),
  ],
  { stdio: 'inherit', cwd: packageRoot }
);

process.exit(result.status ?? 1);
