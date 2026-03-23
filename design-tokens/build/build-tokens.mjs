#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { repoRoot, getBuildWriteTargets } from './paths.mjs';
import { preflightBuildArtifacts } from '../../scripts/lib/token-build-preflight.mjs';
import {
  buildTokenArtifacts,
  isArtifactWriteContractError,
} from '../../scripts/lib/token-artifacts.mjs';
import { withDirectoryLock } from '../../scripts/lib/directory-lock.mjs';
import { formatDiagnostic, runTokenValidation } from '../../scripts/lib/token-validation.mjs';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const buildTokensLockPath = path.join(repoRoot, '.codex-artifacts/locks/build-tokens.lock');

if (args.length > 1 || (args.length === 1 && !jsonMode)) {
  console.error('Usage: pnpm build:tokens [--json]');
  process.exitCode = 1;
} else {
  try {
    const result = await withDirectoryLock(
      buildTokensLockPath,
      async () => {
        await maybeEmitLockTrace();
        await maybeHoldLock();

        const validation = runTokenValidation();
        if (!validation.ok) {
          return { exitCode: 1, diagnostics: validation.diagnostics };
        }

        const pathDiagnostics = preflightBuildArtifacts({
          artifacts: getBuildWriteTargets(),
        });
        if (pathDiagnostics.length > 0) {
          return { exitCode: 2, diagnostics: pathDiagnostics };
        }

        const build = await buildTokenArtifacts();
        return { exitCode: 0, build };
      },
      { label: 'build:tokens' }
    );

    if (result.exitCode === 0) {
      if (jsonMode) {
        process.stdout.write(
          `${JSON.stringify({
            ok: true,
            command: 'build:tokens',
            artifacts: result.build.artifacts,
            diagnostics: [],
          })}\n`
        );
      } else {
        const summary = result.build.artifacts
          .map((artifact) => `${artifact.id}=${artifact.status}`)
          .join(', ');
        console.log(`✓ Built token artifacts (${summary})`);
      }
    } else {
      emitResult('build:tokens', result.diagnostics, jsonMode);
    }

    process.exitCode = result.exitCode;
  } catch (error) {
    if (isArtifactWriteContractError(error)) {
      emitResult('build:tokens', error.diagnostics, jsonMode);
      process.exitCode = 2;
    } else {
      const message = error instanceof Error ? error.message : String(error);
      emitResult(
        'build:tokens',
        [{ severity: 'fatal', code: 'UNEXPECTED_RUNTIME_FAILURE', message }],
        jsonMode
      );
      process.exitCode = 3;
    }
  }
}

function emitResult(command, diagnostics, jsonMode) {
  const payload = {
    ok: false,
    command,
    artifacts: [],
    diagnostics,
  };

  if (jsonMode) {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  for (const diagnostic of diagnostics) {
    console.error(formatDiagnostic(diagnostic));
  }
}

async function maybeEmitLockTrace() {
  const tracePath = process.env.COLLIDER_BUILD_TOKENS_LOCK_TRACE_FILE;
  if (!tracePath) {
    return;
  }

  writeAtomicJson(tracePath, {
    pid: process.pid,
    acquiredAtMs: Date.now(),
    lockPath: buildTokensLockPath,
  });
}

async function maybeHoldLock() {
  const holdMs = parsePositiveInteger(process.env.COLLIDER_BUILD_TOKENS_LOCK_HOLD_MS);
  if (!holdMs) {
    return;
  }

  await delay(holdMs);
}

function writeAtomicJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, filePath);
}

function parsePositiveInteger(value) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
