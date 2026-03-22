import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import policyDoc from './reusable-component-promotion-policy.md?raw';
import {
  evaluateReusableComponentPromotionDecision,
  recommendChangeClassFromFiles,
  reusableComponentPromotionChangeClassEnvVar,
  reusableComponentPromotionConsumerEnvVar,
  reusableComponentPromotionEnforcementEnvVar,
  reusableComponentPromotionInputChangeClasses,
  reusableComponentPromotionUsage,
  runReusableComponentPromotionGate,
} from '../scripts/lib/reusable-component-promotion-gate.mjs';
import { createReusableComponentStatus } from '../scripts/lib/reusable-component-status.mjs';

const chromaticFixtureDir = path.join(repoRoot, 'scripts/fixtures/chromatic-status');

describe('reusable component promotion policy doc', () => {
  it('freezes the consumer contexts and unknown-class fallback rules', () => {
    expect(policyDoc).toContain('`local` is advisory-only.');
    expect(policyDoc).toContain(
      '`ci` may block only when the requested change class is explicitly `reusable-component-advancement`.'
    );
    expect(policyDoc).toContain('`handoff` is advisory-only.');
    expect(policyDoc).toContain(
      '`release` is the only consumer allowed to claim full reusable-component harness readiness.'
    );
    expect(policyDoc).toContain('`unknown` is allowed only as an advisory input.');
    expect(policyDoc).toContain('`review.requiredForClaim=true`');
    expect(policyDoc).toContain('Parity remains advisory for `local`, `ci`, and `handoff`');
  });
});

describe('recommendChangeClassFromFiles', () => {
  it('keeps touched-file heuristics advisory and bounded', () => {
    expect(recommendChangeClassFromFiles(['storybook/component-specs/button.json'])).toBe(
      'reusable-component-advancement'
    );
    expect(
      recommendChangeClassFromFiles(['storybook/stories/pilot-recipe-contract.stories.tsx'])
    ).toBe('proof-only');
    expect(recommendChangeClassFromFiles(['src/figma/parity-policy.md'])).toBe('token-only');
    expect(recommendChangeClassFromFiles(['README.md'])).toBe('docs-only');
    expect(recommendChangeClassFromFiles(['package.json', 'README.md'])).toBe('other');
  });
});

describe('evaluateReusableComponentPromotionDecision', () => {
  it('keeps heuristic-only reusable-component detection advisory in local mode', () => {
    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: '2026-03-21T20:00:00.000Z',
    });

    const result = evaluateReusableComponentPromotionDecision(status, {
      changedFiles: ['storybook/component-specs/button.json'],
      consumer: 'local',
      requestedChangeClass: 'unknown',
    });

    expect(result.outcome).toBe('advisory');
    expect(result.enforcementMode).toBe('advisory');
    expect(result.effectiveChangeClass).toBe('reusable-component-advancement');
    expect(result.advisoryReasons).toContain(
      'change-class-heuristic:reusable-component-advancement'
    );
  });

  it('keeps current repo posture non-blocking in CI with parity satisfied and review informational', () => {
    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: '2026-03-21T20:00:00.000Z',
    });

    const result = evaluateReusableComponentPromotionDecision(status, {
      consumer: 'ci',
      requestedChangeClass: 'reusable-component-advancement',
    });

    expect(result.outcome).toBe('advisory');
    expect(result.enforcementMode).toBe('blocking');
    expect(result.blockingReasons).toEqual([]);
    expect(result.advisoryReasons).toContain('ct10b-review-informational');
  });

  it('blocks CI when mapping becomes incomplete for an explicit reusable-component advancement', () => {
    const workspace = copyBaseWorkspace();
    replaceWorkspaceFile(
      workspace,
      'artifacts/harness/reusable-component-mapping-status.json',
      'scripts/fixtures/reusable-component-mapping/incomplete-link/artifacts/harness/reusable-component-mapping-status.json'
    );
    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: '2026-03-21T20:30:00.000Z',
      rootDir: workspace,
    });

    const result = evaluateReusableComponentPromotionDecision(status, {
      consumer: 'ci',
      requestedChangeClass: 'reusable-component-advancement',
    });

    expect(result.outcome).toBe('block');
    expect(result.blockingReasons).toContain('mapping-rail-unsatisfied');
  });

  it('blocks CI on stale claim-required review for an explicit reusable-component advancement', () => {
    const workspace = copyBaseWorkspace();
    const chromaticStatus = readJson(
      path.join(chromaticFixtureDir, 'invalid-stale-generated-at.chromatic-status.json')
    );
    chromaticStatus.review.mode = 'claim-required';
    chromaticStatus.review.requiredForClaim = true;
    writeJson(path.join(workspace, 'artifacts/chromatic/status.json'), chromaticStatus);

    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: '2026-03-21T20:25:00.000Z',
      rootDir: workspace,
    });
    const result = evaluateReusableComponentPromotionDecision(status, {
      consumer: 'ci',
      requestedChangeClass: 'reusable-component-advancement',
    });

    expect(result.outcome).toBe('block');
    expect(result.blockingReasons).toContain('review-rail-stale');
  });

  it('blocks release while parity remains deferred', () => {
    const workspace = copyBaseWorkspace();
    replaceWorkspaceFile(
      workspace,
      'src/figma/sync-ledger.json',
      'scripts/fixtures/sync-ledger/valid.sync-ledger.json'
    );
    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: '2026-03-21T20:00:00.000Z',
      rootDir: workspace,
    });

    const result = evaluateReusableComponentPromotionDecision(status, {
      consumer: 'release',
      requestedChangeClass: 'reusable-component-advancement',
    });

    expect(result.outcome).toBe('block');
    expect(result.blockingReasons).toContain('parity-rail-deferred');
  });

  it('demotes blocking overrides for narrower change classes', () => {
    const status = createReusableComponentStatus({
      changeClass: 'token-only',
      now: '2026-03-21T20:05:00.000Z',
    });

    const result = evaluateReusableComponentPromotionDecision(status, {
      consumer: 'ci',
      requestedChangeClass: 'token-only',
      requestedEnforcement: 'blocking',
    });

    expect(result.outcome).toBe('advisory');
    expect(result.enforcementMode).toBe('advisory');
    expect(result.advisoryReasons).toContain('consumer-policy-blocking-disallowed');
  });
});

describe('runReusableComponentPromotionGate', () => {
  it('writes the CT-12B artifact and produces advisory output for heuristic-only CI runs', async () => {
    const workspace = copyBaseWorkspace();
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();

    const exitCode = await runReusableComponentPromotionGate({
      changedFiles: ['storybook/component-specs/button.json'],
      consumer: 'ci',
      changeClass: 'unknown',
      now: '2026-03-21T20:00:00.000Z',
      rootDir: workspace,
      stderr,
      stdout,
    });

    expect(exitCode).toBe(0);
    expect(stderr.read()).toBe('');
    expect(stdout.read()).toContain('Decision: advisory');
    expect(
      fs.existsSync(path.join(workspace, 'artifacts/harness/reusable-component-status.json'))
    ).toBe(true);
  });
});

describe('reusable component promotion gate CLI and workflow contract', () => {
  it('registers the package script, just recipe, and CI job', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
    const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

    expect(packageJson.scripts?.['govern:reusable-component-promotion']).toBe(
      'node scripts/govern-reusable-component-promotion.mjs'
    );
    expect(justfile).toContain('reusable-component-promotion:');
    expect(workflow).toContain('reusable-component-promotion:');
    expect(workflow).toContain('needs: chromatic-review');
    expect(workflow).toContain('name: reusable-component-status-${{ github.sha }}');
  });

  it('rejects positional arguments and honors the public env vars', () => {
    const result = spawnSync('node', ['scripts/govern-reusable-component-promotion.mjs', 'oops'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        [reusableComponentPromotionConsumerEnvVar]: 'ci',
        [reusableComponentPromotionChangeClassEnvVar]: 'unknown',
        [reusableComponentPromotionEnforcementEnvVar]: 'advisory',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(reusableComponentPromotionUsage);
    expect(reusableComponentPromotionInputChangeClasses).toContain('unknown');
  });
});

function copyBaseWorkspace() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'reusable-component-promotion-'));
  for (const repoRelativePath of [
    'src/figma/sync-ledger.json',
    'storybook/story-inventory.json',
    'storybook/component-specs/button.json',
    'artifacts/storybook/proof-coverage.json',
    'artifacts/chromatic/status.json',
    'artifacts/harness/reusable-component-mapping-status.json',
  ]) {
    const sourcePath = path.join(repoRoot, repoRelativePath);
    const targetPath = path.join(workspace, repoRelativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.cpSync(sourcePath, targetPath);
  }
  return workspace;
}

function replaceWorkspaceFile(
  workspace: string,
  targetRepoRelativePath: string,
  fixtureRepoRelativePath: string
) {
  const sourcePath = path.join(repoRoot, fixtureRepoRelativePath);
  const targetPath = path.join(workspace, targetRepoRelativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(sourcePath, targetPath);
}

function createWritableBuffer() {
  let value = '';
  return {
    write(chunk: string) {
      value += chunk;
    },
    read() {
      return value;
    },
  };
}

function readJson(targetPath: string) {
  return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
}

function writeJson(targetPath: string, value: unknown) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(value, null, 2));
}
