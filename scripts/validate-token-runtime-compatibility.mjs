#!/usr/bin/env node
import process from 'node:process';
import { formatDiagnostic } from './lib/token-validation.mjs';
import {
  runRuntimeCssCompatibilityCheck,
  runtimeCompatibilityRebuildHint,
} from './lib/token-runtime-compatibility.mjs';

const args = process.argv.slice(2);

if (args.length > 0) {
  console.error('Usage: node scripts/validate-token-runtime-compatibility.mjs');
  process.exit(1);
}

try {
  const result = runRuntimeCssCompatibilityCheck();
  if (!result.ok) {
    for (const diagnostic of result.diagnostics) {
      console.error(formatDiagnostic(diagnostic));
    }
    console.error(runtimeCompatibilityRebuildHint);
    process.exit(2);
  }

  console.log('✓ Generated runtime CSS satisfies the cutover compatibility surface');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
  process.exit(3);
}
