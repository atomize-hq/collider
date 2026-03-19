#!/usr/bin/env node
import process from 'node:process';
import { preflightBuildArtifacts } from '../../scripts/lib/token-build-preflight.mjs';
import {
  buildTokenArtifacts,
  getBuildWriteTargets,
  isArtifactWriteContractError,
} from '../../scripts/lib/token-artifacts.mjs';
import { formatDiagnostic, runTokenValidation } from '../../scripts/lib/token-validation.mjs';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');

if (args.length > 1 || (args.length === 1 && !jsonMode)) {
  console.error('Usage: pnpm build:tokens [--json]');
  process.exit(1);
}

try {
  const validation = runTokenValidation();
  if (!validation.ok) {
    emitResult('build:tokens', validation.diagnostics, jsonMode);
    process.exit(1);
  }

  const pathDiagnostics = preflightBuildArtifacts({
    artifacts: getBuildWriteTargets(),
  });
  if (pathDiagnostics.length > 0) {
    emitResult('build:tokens', pathDiagnostics, jsonMode);
    process.exit(2);
  }

  const build = await buildTokenArtifacts();
  if (jsonMode) {
    process.stdout.write(
      `${JSON.stringify({
        ok: true,
        command: 'build:tokens',
        artifacts: build.artifacts,
        diagnostics: [],
      })}\n`
    );
  } else {
    const summary = build.artifacts
      .map((artifact) => `${artifact.id}=${artifact.status}`)
      .join(', ');
    console.log(`✓ Built token artifacts (${summary})`);
  }
  process.exit(0);
} catch (error) {
  if (isArtifactWriteContractError(error)) {
    emitResult('build:tokens', error.diagnostics, jsonMode);
    process.exit(2);
  }

  const message = error instanceof Error ? error.message : String(error);
  emitResult(
    'build:tokens',
    [{ severity: 'fatal', code: 'UNEXPECTED_RUNTIME_FAILURE', message }],
    jsonMode
  );
  process.exit(3);
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
