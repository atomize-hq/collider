#!/usr/bin/env node
import process from 'node:process';
import { rebuildHint, runTokenArtifactFreshnessCheck } from './lib/token-artifact-freshness.mjs';
import { formatDiagnostic } from './lib/token-validation.mjs';

const args = process.argv.slice(2);

if (args.length > 0) {
  console.error('Usage: node scripts/validate-token-artifacts.mjs');
  process.exit(1);
}

try {
  const result = await runTokenArtifactFreshnessCheck();
  if (!result.ok) {
    for (const diagnostic of result.diagnostics) {
      console.error(formatDiagnostic(diagnostic));
    }
    console.error(rebuildHint);
    process.exit(1);
  }

  console.log('✓ Generated token artifacts are fresh');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
  process.exit(3);
}
