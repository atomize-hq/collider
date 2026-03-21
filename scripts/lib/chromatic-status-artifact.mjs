import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import { chromaticStatusArtifactPath } from './chromatic-status.mjs';
import {
  defaultChromaticStatusMaxAgeMinutes,
  evaluateChromaticStatus,
  readChromaticStatusArtifact,
} from './chromatic-status-validator.mjs';

export const chromaticStatusRestoreScriptName = 'restore:chromatic-status';
export const chromaticStatusRestoreUsage =
  'Usage: pnpm restore:chromatic-status [--sha <git-sha>] [--repo <owner/repo>]';

export function buildChromaticStatusArtifactName(gitSha) {
  return `chromatic-status-${gitSha}`;
}

export function parseGitHubRepoSlug(remoteUrl) {
  if (typeof remoteUrl !== 'string' || remoteUrl.length === 0) {
    return null;
  }

  const githubUrlPattern = /github\.com[/:]([^/]+\/[^/.]+)(?:\.git)?$/;
  const match = remoteUrl.match(githubUrlPattern);
  return match?.[1] ?? null;
}

export function selectChromaticStatusArtifact(artifacts, gitSha) {
  const expectedName = buildChromaticStatusArtifactName(gitSha);
  return (
    artifacts.find(
      (artifact) =>
        artifact &&
        artifact.expired !== true &&
        artifact.name === expectedName &&
        typeof artifact.workflow_run?.id === 'number'
    ) ?? null
  );
}

export function parseChromaticStatusRestoreArgs(args) {
  const parsed = {
    gitSha: null,
    repoSlug: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--sha') {
      parsed.gitSha = args[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--repo') {
      parsed.repoSlug = args[index + 1] ?? null;
      index += 1;
      continue;
    }

    return {
      error: `[CT-10B_CHROMATIC_STATUS_RESTORE_INVALID_ARGS] unexpected argument "${arg}"`,
      parsed: null,
    };
  }

  if (parsed.gitSha === '') {
    return {
      error: '[CT-10B_CHROMATIC_STATUS_RESTORE_INVALID_ARGS] --sha must not be empty',
      parsed: null,
    };
  }

  if (parsed.repoSlug === '') {
    return {
      error: '[CT-10B_CHROMATIC_STATUS_RESTORE_INVALID_ARGS] --repo must not be empty',
      parsed: null,
    };
  }

  return { error: null, parsed };
}

export async function runChromaticStatusRestore(options = {}) {
  const cwd = path.resolve(options.cwd ?? repoRoot);
  const gitSha = options.gitSha ?? resolveGitSha(cwd, options.execFileSync ?? execFileSync);
  const repoSlug =
    options.repoSlug ?? resolveGitHubRepoSlug(cwd, options.execFileSync ?? execFileSync);
  const targetPath = path.resolve(
    options.targetPath ?? path.join(cwd, chromaticStatusArtifactPath)
  );
  const now = options.now;
  const maxAgeMinutes = options.maxAgeMinutes ?? defaultChromaticStatusMaxAgeMinutes;
  const listArtifacts = options.listArtifacts ?? defaultListArtifacts;
  const downloadArtifact = options.downloadArtifact ?? defaultDownloadArtifact;
  const copyFile = options.copyFile ?? fs.copyFileSync;
  const removeDir = options.removeDir ?? fs.rmSync;
  const makeTempDir =
    options.makeTempDir ?? (() => fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-status-')));

  if (!repoSlug) {
    return {
      error: new Error(
        '[CT-10B_CHROMATIC_STATUS_RESTORE_REPO_UNRESOLVED] could not resolve GitHub repository slug from origin remote'
      ),
      exitCode: 1,
    };
  }

  try {
    const response = await listArtifacts({ repoSlug });
    const artifact = selectChromaticStatusArtifact(response.artifacts ?? [], gitSha);
    if (!artifact) {
      return {
        error: new Error(
          `[CT-10B_CHROMATIC_STATUS_ARTIFACT_MISSING] could not find ${buildChromaticStatusArtifactName(gitSha)} in GitHub Actions artifacts for ${repoSlug}`
        ),
        exitCode: 1,
        gitSha,
        repoSlug,
      };
    }

    const tempDir = makeTempDir();
    try {
      await downloadArtifact({
        artifactName: artifact.name,
        destDir: tempDir,
        repoSlug,
        runId: artifact.workflow_run.id,
      });

      const downloadedArtifactPath = path.join(tempDir, chromaticStatusArtifactPath);
      if (!fs.existsSync(downloadedArtifactPath)) {
        return {
          error: new Error(
            `[CT-10B_CHROMATIC_STATUS_DOWNLOAD_INVALID] ${artifact.name} did not contain ${chromaticStatusArtifactPath}`
          ),
          exitCode: 1,
          gitSha,
          repoSlug,
          sourceRunId: artifact.workflow_run.id,
        };
      }

      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      copyFile(downloadedArtifactPath, targetPath);

      const restoredArtifact = readChromaticStatusArtifact(targetPath, { rootDir: cwd });
      const evaluation = evaluateChromaticStatus(restoredArtifact.data, {
        expectedGitSha: gitSha,
        maxAgeMinutes,
        now,
      });
      if (!evaluation.ok) {
        return {
          error: new Error(evaluation.errors.join('\n')),
          exitCode: 1,
          gitSha,
          repoSlug,
          sourceRunId: artifact.workflow_run.id,
          targetPath,
        };
      }

      return {
        artifactName: artifact.name,
        exitCode: 0,
        gitSha,
        repoSlug,
        sourceRunId: artifact.workflow_run.id,
        targetPath,
      };
    } finally {
      removeDir(tempDir, { force: true, recursive: true });
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      exitCode: 1,
      gitSha,
      repoSlug,
    };
  }
}

function resolveGitSha(cwd, exec) {
  return exec('git', ['rev-parse', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  }).trim();
}

function resolveGitHubRepoSlug(cwd, exec) {
  const remoteUrl = exec('git', ['remote', 'get-url', 'origin'], {
    cwd,
    encoding: 'utf8',
  }).trim();
  return parseGitHubRepoSlug(remoteUrl);
}

function defaultListArtifacts({ repoSlug }) {
  return JSON.parse(
    execFileSync('gh', ['api', `repos/${repoSlug}/actions/artifacts?per_page=100`], {
      encoding: 'utf8',
    })
  );
}

function defaultDownloadArtifact({ artifactName, destDir, repoSlug, runId }) {
  execFileSync(
    'gh',
    ['run', 'download', String(runId), '--repo', repoSlug, '-n', artifactName, '-D', destDir],
    {
      encoding: 'utf8',
      stdio: 'pipe',
    }
  );
}
