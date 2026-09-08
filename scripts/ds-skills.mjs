#!/usr/bin/env node
/**
 * Run the pinned `ds-skills` release.
 *
 * Every rail invocation in `package.json` goes through here, so there is exactly
 * one place that decides which executable runs. That decision is
 * `resolveDsSkills`: the version-specific path named by `ds-skills.release.json`,
 * whose identity files are read before anything is executed.
 *
 * There is no fallback. A missing release fails the caller and prints the install
 * command — it never degrades to an ambient `ds-skills`, and never to the
 * implementation this migration removed. A gate that silently runs something else
 * is worse than a gate that stops.
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import { resolveDsSkills } from './lib/ds-skills.mjs';

const args = process.argv.slice(2);
if (args.length === 0) {
  process.stderr.write('Usage: node scripts/ds-skills.mjs <command> [options]\n');
  process.exit(2);
}

const resolved = resolveDsSkills({ repoRoot });
if (!resolved.ok) {
  process.stderr.write(`[DS_SKILLS_UNAVAILABLE] ${resolved.message}\n`);
  // 2, not 1: "the tool is absent" is an inability to evaluate, which is the
  // same distinction the CLI itself draws between exit 1 and exit 2.
  process.exit(2);
}

const result = spawnSync(resolved.executable, args, { stdio: 'inherit' });
if (result.error) {
  process.stderr.write(`[DS_SKILLS_UNAVAILABLE] ${resolved.executable}: ${result.error.message}\n`);
  process.exit(2);
}

process.exit(result.status ?? 2);
