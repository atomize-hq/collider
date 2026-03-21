import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  buildChromaticStatusArtifactName,
  chromaticStatusRestoreScriptName,
  parseChromaticStatusRestoreArgs,
  parseGitHubRepoSlug,
  runChromaticStatusRestore,
  selectChromaticStatusArtifact,
} from '../scripts/lib/chromatic-status-artifact.mjs';

const fixtureDir = path.join(repoRoot, 'scripts/fixtures/chromatic-status');
const validGitSha = '1111111111111111111111111111111111111111';

describe('chromatic status restore helpers', () => {
  it('parses GitHub repository slugs from ssh and https remotes', () => {
    expect(parseGitHubRepoSlug('git@github.com:atomize-hq/collider.git')).toBe(
      'atomize-hq/collider'
    );
    expect(parseGitHubRepoSlug('https://github.com/atomize-hq/collider')).toBe(
      'atomize-hq/collider'
    );
  });

  it('selects the matching chromatic status artifact for a git sha', () => {
    const artifact = selectChromaticStatusArtifact(
      [
        {
          expired: false,
          name: buildChromaticStatusArtifactName(validGitSha),
          workflow_run: { id: 42 },
        },
      ],
      validGitSha
    );

    expect(artifact).toMatchObject({
      name: buildChromaticStatusArtifactName(validGitSha),
      workflow_run: { id: 42 },
    });
  });

  it('parses restore cli arguments', () => {
    expect(
      parseChromaticStatusRestoreArgs(['--sha', validGitSha, '--repo', 'atomize-hq/collider'])
    ).toMatchObject({
      error: null,
      parsed: {
        gitSha: validGitSha,
        repoSlug: 'atomize-hq/collider',
      },
    });
  });
});

describe('runChromaticStatusRestore', () => {
  it('downloads and validates a matching chromatic status artifact', async () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-status-restore-'));
    const fixture = JSON.parse(
      fs.readFileSync(path.join(fixtureDir, 'valid-passed.chromatic-status.json'), 'utf8')
    );
    fixture.generatedAt = new Date().toISOString();

    const result = await runChromaticStatusRestore({
      cwd: workspace,
      gitSha: validGitSha,
      listArtifacts: async () => ({
        artifacts: [
          {
            expired: false,
            name: buildChromaticStatusArtifactName(validGitSha),
            workflow_run: { id: 77 },
          },
        ],
      }),
      downloadArtifact: async ({ destDir }: { destDir: string }) => {
        const artifactPath = path.join(destDir, 'artifacts/chromatic/status.json');
        fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
        fs.writeFileSync(artifactPath, JSON.stringify(fixture, null, 2));
      },
      now: new Date(),
      repoSlug: 'atomize-hq/collider',
    });

    expect(result.exitCode).toBe(0);
    expect(result.sourceRunId).toBe(77);
    expect(result.targetPath).toBe(path.join(workspace, 'artifacts/chromatic/status.json'));
    expect(
      JSON.parse(fs.readFileSync(path.join(workspace, 'artifacts/chromatic/status.json'), 'utf8'))
    ).toMatchObject({
      revision: {
        gitSha: validGitSha,
      },
    });
  });

  it('fails with a machine-readable error when no matching artifact exists', async () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-status-restore-'));
    const result = await runChromaticStatusRestore({
      cwd: workspace,
      gitSha: validGitSha,
      listArtifacts: async () => ({ artifacts: [] }),
      repoSlug: 'atomize-hq/collider',
    });

    expect(result.exitCode).toBe(1);
    expect(result.error?.message).toContain('[CT-10B_CHROMATIC_STATUS_ARTIFACT_MISSING]');
  });
});

describe('chromatic status restore package contract', () => {
  it('exposes the seam-owned restore entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.[chromaticStatusRestoreScriptName]).toBe(
      'node scripts/restore-chromatic-status.mjs'
    );
  });
});
