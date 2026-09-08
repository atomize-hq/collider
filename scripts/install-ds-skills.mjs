#!/usr/bin/env node
/**
 * Provision the ds-skills release pinned in `ds-skills.release.json`.
 *
 * The trust chain (SPEC.md §10.3) is: reviewed record → verified bootstrap bytes
 * → verified payload bytes → installed executable. This script owns the first
 * two links: it downloads the bootstrap from the release's own URL and checks it
 * against the digest in the record before running it, so a replaced asset is
 * never executed. The bootstrap then enforces the payload digests baked into
 * itself.
 *
 *   node scripts/install-ds-skills.mjs            install if absent, else report
 *   node scripts/install-ds-skills.mjs --check    resolve only; acquire nothing
 *   node scripts/install-ds-skills.mjs --force    reinstall even if resolved
 *   node scripts/install-ds-skills.mjs --print    print the executable path only
 *
 * `DS_SKILLS_BASE_URL` selects a mirror to fetch from. Selection only: the
 * digest checked is the reviewed one either way.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { acquireBootstrap } from './lib/ds-skills-acquire.mjs';
import {
  installPrefix,
  platformKey,
  readReleaseRecord,
  resolveDsSkills,
} from './lib/ds-skills.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flags = new Set(process.argv.slice(2));
const quiet = flags.has('--print');

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));

async function main() {
  const record = readReleaseRecord(repoRoot);
  platformKey(record); // fail on an unsupported platform before touching the network

  const resolved = resolveDsSkills({ repoRoot, record });
  if (resolved.ok && !flags.has('--force')) return report(resolved, 'already provisioned');
  if (flags.has('--check')) fail(resolved.message);

  await acquireBootstrap({
    record,
    prefix: installPrefix(),
    baseUrl: process.env.DS_SKILLS_BASE_URL,
    note,
  });

  const after = resolveDsSkills({ repoRoot, record });
  if (!after.ok) fail(`the installer ran but the result does not resolve.\n${after.message}`);
  report(after, 'installed');
}

function report(resolution, state) {
  if (flags.has('--print')) {
    process.stdout.write(`${resolution.executable}\n`);
    return;
  }
  process.stdout.write(
    [
      `ds-skills ${resolution.release} ${state}`,
      `  executable  ${resolution.executable}`,
      `  source      ${resolution.sourceCommit}`,
      '',
    ].join('\n')
  );
}

function note(line) {
  if (!quiet) process.stdout.write(`${line}\n`);
}

function fail(message) {
  process.stderr.write(`ds-skills provisioning failed: ${message}\n`);
  process.exit(1);
}
