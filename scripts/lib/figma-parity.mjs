import process from 'node:process';
import { loadAndValidateSyncLedger } from './sync-ledger.mjs';

export const defaultSyncLedgerPath = 'src/figma/sync-ledger.json';
export const figmaParityUsage =
  'Usage: node scripts/validate-figma-parity.mjs [path-to-sync-ledger.json]';

export function evaluateFigmaParity(ledger) {
  const parityMode = ledger.promotion.parityMode;

  if (parityMode === 'deferred') {
    return {
      ok: true,
      parityMode,
      message: `[FIGMA_PARITY_DEFERRED] ${ledger.promotion.parityDeferredReason}`,
    };
  }

  const errors = [];
  if (ledger.publish.mode !== 'rest-variables-oauth') {
    errors.push(
      '[FIGMA_PARITY_REQUIRES_HARDENED_RAIL] publish.mode must be rest-variables-oauth when promotion.parityMode is required'
    );
  }

  if (ledger.verification.materializationStatus !== 'passed') {
    errors.push(
      '[FIGMA_PARITY_REQUIRES_PASSED_MATERIALIZATION] verification.materializationStatus must be passed when promotion.parityMode is required'
    );
  }

  if (ledger.verification.lastVerifiedRevision !== ledger.artifact.revision) {
    errors.push(
      '[FIGMA_PARITY_REQUIRES_CURRENT_REVISION] verification.lastVerifiedRevision must match artifact.revision when promotion.parityMode is required'
    );
  }

  if (ledger.promotion.highestEarnedLevel !== 'E-promotion-complete') {
    errors.push(
      '[FIGMA_PARITY_REQUIRES_COMPLETE_PROMOTION] promotion.highestEarnedLevel must be E-promotion-complete when promotion.parityMode is required'
    );
  }

  for (const [index, entry] of ledger.exceptions.entries()) {
    if (entry.blocking === true && entry.status === 'open') {
      errors.push(
        `[FIGMA_PARITY_OPEN_BLOCKING_EXCEPTION] exceptions[${index}].status for ${entry.code} must not remain open when promotion.parityMode is required`
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, parityMode, errors, exitCode: 1 };
  }

  return {
    ok: true,
    parityMode,
    message: '✓ Figma parity requirements are satisfied for the current sync ledger.',
  };
}

export function validateFigmaParity(options = {}) {
  const target = options.target ?? defaultSyncLedgerPath;
  const loadLedger = options.loadAndValidateSyncLedger ?? loadAndValidateSyncLedger;
  const { data, errors } = loadLedger(target);

  if (errors.length > 0) {
    return { ok: false, parityMode: null, errors, exitCode: 1 };
  }

  return evaluateFigmaParity(data);
}

export function runValidateFigmaParityCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const runValidation = options.runValidation ?? validateFigmaParity;

  if (args.length > 1) {
    writeLine(stderr, figmaParityUsage);
    return 1;
  }

  try {
    const result = runValidation({
      target: args[0] ?? defaultSyncLedgerPath,
    });

    if (!result.ok) {
      for (const error of result.errors) {
        writeLine(stderr, error);
      }
      return result.exitCode ?? 1;
    }

    writeLine(stdout, result.message);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(stderr, `[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
    return 3;
  }
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
