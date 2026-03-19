import { spawnSync } from 'node:child_process';
import process from 'node:process';
import {
  repoRoot,
  runtimeCssPath,
  tokenSourceRoot,
  toRepoRelative,
} from '../../design-tokens/build/paths.mjs';

export const runtimeCssRelPath = toRepoRelative(runtimeCssPath);
export const tokenSourceRelPath = toRepoRelative(tokenSourceRoot);
export const runtimeCssCutoverRunbookRelPath =
  'figma-ci-sync/threaded-seams/seam-6-governance-validation-and-cutover/runtime-css-cutover-runbook.md';
export const runtimeCssManualEditExitCode = 2;

export function runRuntimeCssDriftGuard(options = {}) {
  const readGitStatus = options.readGitStatus ?? readRuntimeCssGitStatus;
  const status = readGitStatus();
  if (!status.runtimeCssDirty || status.tokenSourceDirty) {
    return { ok: true, exitCode: 0 };
  }

  return {
    ok: false,
    exitCode: runtimeCssManualEditExitCode,
    message: [
      `Direct edits to ${runtimeCssRelPath} are not allowed after cutover.`,
      'Recover by running `pnpm build:tokens` from canonical sources',
      `or follow the rollback steps in ${runtimeCssCutoverRunbookRelPath}.`,
    ].join(' '),
  };
}

export function readRuntimeCssGitStatus(options = {}) {
  const gitCommand = options.gitCommand ?? 'git';
  const cwd = options.cwd ?? repoRoot;
  const platform = options.platform ?? process.platform;
  const result = spawnSync(
    gitCommand,
    ['status', '--short', '--', runtimeCssRelPath, tokenSourceRelPath],
    {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: platform === 'win32',
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = typeof result.stderr === 'string' ? result.stderr.trim() : '';
    throw new Error(
      `unable to read git status for runtime CSS cutover guard${stderr ? `: ${stderr}` : ''}`
    );
  }

  return parseGitStatusOutput(result.stdout ?? '');
}

export function parseGitStatusOutput(stdout) {
  const lines = stdout
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
  let runtimeCssDirty = false;
  let tokenSourceDirty = false;

  for (const line of lines) {
    const filePath = normalizeGitStatusPath(line.slice(3));
    if (filePath === runtimeCssRelPath) {
      runtimeCssDirty = true;
      continue;
    }
    if (filePath === tokenSourceRelPath || filePath.startsWith(`${tokenSourceRelPath}/`)) {
      tokenSourceDirty = true;
    }
  }

  return { runtimeCssDirty, tokenSourceDirty };
}

function normalizeGitStatusPath(filePath) {
  const unquotedPath =
    filePath.startsWith('"') && filePath.endsWith('"') ? filePath.slice(1, -1) : filePath;
  const renamedPath = unquotedPath.includes(' -> ')
    ? unquotedPath.slice(unquotedPath.indexOf(' -> ') + 4)
    : unquotedPath;
  return renamedPath.replaceAll('\\', '/');
}
