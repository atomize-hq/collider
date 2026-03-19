#!/usr/bin/env node
import process from 'node:process';
import { formatDiagnostic, runTokenValidation } from '../../scripts/lib/token-validation.mjs';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');

if (args.length > 1 || (args.length === 1 && !jsonMode)) {
  console.error('Usage: pnpm validate:tokens [--json]');
  process.exit(1);
}

try {
  const result = runTokenValidation();
  if (!result.ok) {
    emitResult('validate:tokens', result.diagnostics, jsonMode);
    process.exit(1);
  }

  if (jsonMode) {
    process.stdout.write(
      `${JSON.stringify({ ok: true, command: 'validate:tokens', artifacts: [], diagnostics: [] })}\n`
    );
  } else {
    console.log('✓ Validated token sources and recipes');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  emitResult(
    'validate:tokens',
    [{ severity: 'fatal', code: 'UNEXPECTED_RUNTIME_FAILURE', message }],
    jsonMode
  );
  process.exit(3);
}

function emitResult(command, diagnostics, jsonMode) {
  if (jsonMode) {
    process.stdout.write(`${JSON.stringify({ ok: false, command, artifacts: [], diagnostics })}\n`);
    return;
  }

  for (const diagnostic of diagnostics) {
    console.error(formatDiagnostic(diagnostic));
  }
}
