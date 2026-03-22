import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  chromaticStatusExpectedGitShaEnvVar,
  chromaticStatusMaxAgeMinutesEnvVar,
  chromaticStatusRootDirEnvVar,
  chromaticStatusTargetEnvVar,
  evaluateChromaticStatus,
  runChromaticStatusValidation,
} from '../scripts/lib/chromatic-status-validator.mjs';

const fixtureDir = path.join(repoRoot, 'scripts/fixtures/chromatic-status');
const cliPath = path.join(repoRoot, 'scripts/validate-chromatic-status.mjs');
const fixedNow = new Date('2026-03-21T12:30:00.000Z');

const validFixtures = [
  'valid-passed.chromatic-status.json',
  'valid-changed.chromatic-status.json',
  'valid-failed.chromatic-status.json',
  'valid-deferred.chromatic-status.json',
];

const invalidFixtures = [
  {
    file: 'invalid-stale-generated-at.chromatic-status.json',
    error: '[CT-10B_CHROMATIC_STATUS_STALE]',
  },
  {
    file: 'invalid-mismatched-revision.chromatic-status.json',
    error: '[CT-10B_CHROMATIC_STATUS_GIT_SHA_MISMATCH]',
    expectedGitSha: '1111111111111111111111111111111111111111',
  },
  {
    file: 'invalid-missing-proof-scope.chromatic-status.json',
    error: '[CT-10B_CHROMATIC_STATUS_INVALID_STRING_ARRAY]',
  },
  {
    file: 'invalid-malformed-build-url.chromatic-status.json',
    error: '[CT-10B_CHROMATIC_STATUS_INVALID_BUILD_URL]',
  },
  {
    file: 'invalid-check-conclusion.chromatic-status.json',
    error: '[CT-10B_CHROMATIC_STATUS_CHECK_CONCLUSION_MISMATCH]',
  },
];

describe('evaluateChromaticStatus', () => {
  it.each(validFixtures)('accepts %s', (fixtureName) => {
    const result = evaluateChromaticStatus(loadFixture(fixtureName), {
      maxAgeMinutes: 1440,
      now: fixedNow,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it.each(invalidFixtures)(
    'rejects %s with machine-readable output',
    ({ file, error, expectedGitSha }) => {
      const result = evaluateChromaticStatus(loadFixture(file), {
        expectedGitSha,
        maxAgeMinutes: 1440,
        now: fixedNow,
      });

      expect(result.ok).toBe(false);
      expect(result.errors.some((message) => message.includes(error))).toBe(true);
    }
  );
});

describe('runChromaticStatusValidation', () => {
  it('passes on a valid artifact and prints the published thread summary', async () => {
    const now = new Date('2026-03-21T12:30:00.000Z');
    const workspace = createWorkspace({
      fixtureName: 'valid-passed.chromatic-status.json',
      generatedAt: '2026-03-21T12:25:00.000Z',
    });
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();

    const exitCode = await runChromaticStatusValidation({
      expectedGitSha: '1111111111111111111111111111111111111111',
      rootDir: workspace,
      now,
      stdout,
      stderr,
    });

    expect(exitCode).toBe(0);
    expect(stderr.read()).toBe('');
    expect(stdout.read()).toContain('✓ Chromatic status artifact valid:');
    expect(stdout.read()).toContain('Published review threads: THR-03, THR-06');
  });

  it('fails on an invalid artifact and reports the broken repo-owned field', async () => {
    const workspace = createWorkspace({
      fixtureName: 'invalid-check-conclusion.chromatic-status.json',
      generatedAt: '2026-03-21T12:25:00.000Z',
    });
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();

    const exitCode = await runChromaticStatusValidation({
      rootDir: workspace,
      stdout,
      stderr,
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe('');
    expect(stderr.read()).toContain('[CT-10B_CHROMATIC_STATUS_CHECK_CONCLUSION_MISMATCH]');
  });
});

describe('chromatic status validator CLI contract', () => {
  it('passes via the package CLI entrypoint', () => {
    const workspace = createWorkspace({
      fixtureName: 'valid-passed.chromatic-status.json',
      generatedAt: new Date().toISOString(),
    });

    const result = spawnSync('node', [cliPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        [chromaticStatusRootDirEnvVar]: workspace,
        [chromaticStatusExpectedGitShaEnvVar]: '1111111111111111111111111111111111111111',
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('✓ Chromatic status artifact valid:');
  });

  it('fails via the package CLI entrypoint on an invalid artifact', () => {
    const workspace = createWorkspace({
      fixtureName: 'invalid-malformed-build-url.chromatic-status.json',
      generatedAt: new Date().toISOString(),
    });

    const result = spawnSync('node', [cliPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        [chromaticStatusRootDirEnvVar]: workspace,
        [chromaticStatusTargetEnvVar]: 'artifacts/chromatic/status.json',
        [chromaticStatusMaxAgeMinutesEnvVar]: '1440',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('[CT-10B_CHROMATIC_STATUS_INVALID_BUILD_URL]');
  });
});

describe('chromatic status package and workflow contract', () => {
  it('exposes the seam-owned validator entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['validate:chromatic-status']).toBe(
      'node scripts/validate-chromatic-status.mjs'
    );
  });

  it('validates the artifact in the dedicated chromatic-review owner before upload', () => {
    const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toContain('chromatic-review:');
    expect(workflow).toContain('name: chromatic-review');
    expect(workflow).toContain('Validate chromatic review status artifact');
    expect(workflow).toContain('run: pnpm validate:chromatic-status');
    expect(workflow).toContain('CHROMATIC_STATUS_EXPECTED_GIT_SHA: ${{ github.sha }}');
    expect(workflow).toContain('Upload chromatic review status artifact');
    expect(workflow).toMatch(
      /Publish branch-aware Chromatic review[\s\S]*Validate chromatic review status artifact[\s\S]*Upload chromatic review status artifact/
    );
  });
});

function loadFixture(name: string) {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8'));
}

function createWorkspace(options: { fixtureName: string; generatedAt: string }) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-status-validator-'));
  const fixture = loadFixture(options.fixtureName);
  fixture.generatedAt = options.generatedAt;

  const artifactPath = path.join(workspace, 'artifacts/chromatic/status.json');
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, JSON.stringify(fixture, null, 2));

  return workspace;
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
