import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  evaluateFigmaParity,
  runValidateFigmaParityCli,
  validateFigmaParity,
} from '../../../scripts/lib/figma-parity.mjs';
import { loadAndValidateSyncLedger } from '../../../scripts/lib/sync-ledger.mjs';

const syncLedgerFixtureDir = path.join(repoRoot, 'scripts/fixtures/sync-ledger');

describe('loadAndValidateSyncLedger', () => {
  it('accepts the happy-path deferred fixture', () => {
    const result = loadAndValidateSyncLedger(fixturePath('valid.sync-ledger.json'));

    expect(result.errors).toEqual([]);
    expect(result.data.status.parityMode).toBe('deferred');
  });

  it('reports missing required contract fields', () => {
    const result = loadAndValidateSyncLedger(
      fixturePath('invalid-missing-required-field.sync-ledger.json')
    );

    expect(result.errors).toContain(
      '[CT-7_MISSING_REQUIRED_KEY] status.artifactGitSha is required'
    );
  });

  it('reports contradictory mode metadata', () => {
    const result = loadAndValidateSyncLedger(
      fixturePath('invalid-contradictory-mode.sync-ledger.json')
    );

    expect(result.errors).toContain(
      '[CT-7_FORBIDDEN_PARITY_DEFERRED_REASON] status.parityDeferredReason must be omitted when status.parityMode is required'
    );
  });
});

describe('validateFigmaParity', () => {
  it('accepts a required ledger with reviewed pull proof and no open drift', () => {
    const result = validateFigmaParity({
      target: fixturePath('valid-required.sync-ledger.json'),
    });

    expect(result).toEqual({
      ok: true,
      parityMode: 'required',
      message: '✓ Figma parity requirements are satisfied for the current sync ledger.',
    });
  });

  it('fails required parity when lastSuccessfulPullAt is missing', () => {
    const result = validateFigmaParity({
      target: fixturePath('invalid-required-null-last-successful-pull.sync-ledger.json'),
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      '[FIGMA_PARITY_REQUIRES_LAST_SUCCESSFUL_PULL] status.lastSuccessfulPullAt must be non-null when status.parityMode is required'
    );
  });

  it('fails required parity when any drift entry remains open', () => {
    const requiredLedger = readFixture('valid-required.sync-ledger.json');
    const result = evaluateFigmaParity({
      ...requiredLedger,
      drift: [
        {
          code: 'pilot-drift-open',
          severity: 'warn',
          message: 'Open drift remains.',
          status: 'open',
          field: 'drift[0]',
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      '[FIGMA_PARITY_OPEN_DRIFT] drift[0].status for pilot-drift-open must not remain open when status.parityMode is required'
    );
  });
});

describe('runValidateFigmaParityCli', () => {
  it('prints the explicit deferred branch instead of silently skipping parity', () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const exitCode = runValidateFigmaParityCli({
      args: [fixturePath('valid.sync-ledger.json')],
      stdout,
      stderr,
    });

    expect(exitCode).toBe(0);
    expect(stdout.read()).toContain('[FIGMA_PARITY_DEFERRED]');
    expect(stdout.read()).toContain('Parity remains deferred until enterprise automation');
    expect(stderr.read()).toBe('');
  });
});

function fixturePath(name: string) {
  return path.join(syncLedgerFixtureDir, name);
}

function readFixture(name: string) {
  return JSON.parse(fs.readFileSync(fixturePath(name), 'utf8')) as {
    drift: Array<{
      code: string;
      field?: string;
      message: string;
      severity: string;
      status: string;
    }>;
    status: { parityMode: string };
  };
}

function createWritableBuffer() {
  let buffer = '';

  return {
    write(chunk: string | Uint8Array) {
      buffer += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    },
    read() {
      return buffer;
    },
  };
}
