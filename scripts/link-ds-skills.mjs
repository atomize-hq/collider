#!/usr/bin/env node
/**
 * Point agent skill discovery at the pinned release.
 *
 * The release owns three skills plus `schemas/` and `templates/`; Collider owns
 * the rest of `.agents/skills` and its own `profiles/collider.json`. This makes
 * the release-owned half visible at `.claude/skills/<name>` as symlinks into the
 * resolved install.
 *
 * Symlinks rather than copies, deliberately. A copy is a second authority that
 * can go stale silently — which is exactly what happened to the `schemas/` fork
 * this replaces: it sat at ledger v2 while the rail had moved to v3, and nothing
 * could notice. A link cannot disagree with what it points at.
 *
 * The links carry an absolute, machine-specific path, so they are generated and
 * gitignored rather than committed. `just ds-skills-install` runs this after
 * provisioning; `--check` asserts the links resolve into the release currently
 * pinned, which is how a link left behind by an earlier release is caught.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import { resolveDsSkills } from './lib/ds-skills.mjs';

/** What the release owns. Everything else under .agents/skills stays Collider's. */
export const releaseOwnedSkills = [
  'stage-1-foundation-primitives-system',
  'storybook-rigorous-spec-system',
  'sync-quality-governor',
];
export const releaseOwnedSupportDirs = ['schemas', 'templates'];

const resolved = resolveDsSkills({ repoRoot });
if (!resolved.ok) {
  process.stderr.write(`[DS_SKILLS_UNAVAILABLE] ${resolved.message}\n`);
  process.exit(2);
}

const checking = process.argv.includes('--check');
const skillsDir = resolved.skillsDir;
const libDir = path.join(resolved.home, 'lib');
const discovery = path.join(repoRoot, '.claude', 'skills');
fs.mkdirSync(discovery, { recursive: true });

const targets = [
  ...releaseOwnedSkills.map((n) => [n, path.join(skillsDir, n)]),
  ...releaseOwnedSupportDirs.map((n) => [n, path.join(libDir, n)]),
];

const errors = [];
const done = [];
for (const [name, target] of targets) {
  const link = path.join(discovery, name);
  if (!fs.existsSync(target)) {
    errors.push(`[DS_SKILLS_ASSET_MISSING] ${resolved.release} carries no ${name} at ${target}.`);
    continue;
  }

  if (checking) {
    // Comparing the resolved target, not the link's own text: a link written
    // against a previous release resolves somewhere real, which is exactly why
    // "it exists" is not the question being asked.
    let actual = null;
    try {
      actual = fs.realpathSync(link);
    } catch {
      errors.push(
        `[DS_SKILLS_LINK_MISSING] .claude/skills/${name} does not resolve; run \`just ds-skills-install\`.`
      );
      continue;
    }
    if (actual !== fs.realpathSync(target)) {
      errors.push(
        `[DS_SKILLS_LINK_STALE] .claude/skills/${name} resolves to ${actual}, ` +
          `not the pinned ${resolved.release} at ${target}.`
      );
      continue;
    }
    done.push(name);
    continue;
  }

  // Replacing whatever is there is the point: a leftover directory from an
  // earlier release is the stale asset this exists to remove.
  fs.rmSync(link, { recursive: true, force: true });
  fs.symlinkSync(target, link);
  done.push(name);
}

for (const error of errors) process.stderr.write(`${error}\n`);
if (errors.length > 0) process.exit(2);

process.stdout.write(
  `✓ ${checking ? 'verified' : 'linked'} ${done.length} release-owned asset(s) from ${resolved.release}\n` +
    done.map((n) => `  .claude/skills/${n}\n`).join('')
);
