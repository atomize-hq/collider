import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import project from '../ds-skills.project.json';

export const repoRoot = path.resolve(__dirname, '..');
export function readJson(root: string, relative: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}
export function writeJson(root: string, relative: string, value: unknown) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
export function runInstalled(root: string, command: string[], extra: string[] = []) {
  return spawnSync(
    process.execPath,
    [
      path.join(repoRoot, '.ds-skills/project.mjs'),
      ...command,
      '--config',
      path.join(root, 'ds-skills.project.json'),
      '--root',
      root,
      '--json',
      ...extra,
    ],
    { cwd: root, encoding: 'utf8' }
  );
}
export function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-evidence-test-'));
  for (const relative of ['src', 'storybook', 'design-tokens', '.storybook']) {
    fs.cpSync(path.join(repoRoot, relative), path.join(root, relative), { recursive: true });
  }
  for (const relative of [
    'figma/token-sync.config.json',
    'figma/token-rail.baseline.json',
    'artifacts/storybook/proof-coverage.json',
  ]) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, relative), target);
  }
  writeJson(root, 'ds-skills.project.json', project);
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Evidence fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '--no-gpg-sign',
      '-m',
      'Isolated test inputs',
    ],
    { cwd: root }
  );
  return root;
}

// Synthetic review evidence for an isolated test Git root only. This never writes
// canonical review state and is not an observed Chromatic publication.
export function syntheticReview(root: string, outcome = 'passed') {
  if (root === repoRoot) throw new Error('Synthetic review is forbidden in the real consumer');
  const inventory = readJson(root, project.storybook.inventory) as {
    inventoryVersion: string;
    components: { componentId: string; implementedStoryRefs: { storyId: string }[] }[];
  };
  const componentIds = inventory.components.map((c) => c.componentId);
  const storyIds = [
    ...new Set(inventory.components.flatMap((c) => c.implementedStoryRefs.map((r) => r.storyId))),
  ];
  const componentTiers = Object.fromEntries(
    componentIds.map((id) => [id, readJson(root, `storybook/component-specs/${id}.json`).tier])
  );
  const status = {
    statusVersion: '1',
    branch: { name: 'test/synthetic-not-published' },
    revision: {
      gitSha: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    },
    proofInventory: {
      path: project.storybook.inventory,
      inventoryVersion: inventory.inventoryVersion,
      selectedComponentIds: componentIds,
      selectedStoryIds: storyIds,
    },
    build: { url: 'https://example.invalid/synthetic-test-not-a-publication' },
    review: {
      diffOutcome: outcome,
      mode: 'claim-required',
      requiredForClaim: true,
      scope: { componentIds, storyIds, componentTiers },
    },
    check: {
      name: project.storybook.chromatic.checkName,
      conclusion:
        outcome === 'passed'
          ? 'success'
          : outcome === 'failed'
            ? 'failure'
            : outcome === 'changed'
              ? 'neutral'
              : 'skipped',
    },
    generatedAt: new Date().toISOString(),
  };
  writeJson(root, project.storybook.chromatic.status, status);
  return status;
}
