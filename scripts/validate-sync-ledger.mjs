#!/usr/bin/env node
import process from 'node:process';
import { loadAndValidateSyncLedger, syncLedgerUsage } from './lib/sync-ledger.mjs';

const target = process.argv[2];
if (!target) {
  console.error(syncLedgerUsage);
  process.exit(1);
}

try {
  const { absPath, errors } = loadAndValidateSyncLedger(target);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`✓ Sync ledger is structurally valid: ${absPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
  process.exit(3);
}
