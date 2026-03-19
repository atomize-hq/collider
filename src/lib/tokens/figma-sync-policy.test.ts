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
    expect(result.data.promotion.parityMode).toBe('deferred');
    expect(result.data.promotion.highestEarnedLevel).toBe('D-publish-valid');
  });

  it('accepts the blocked example fixture', () => {
    const result = loadAndValidateSyncLedger(fixturePath('blocked.sync-ledger.json'));

    expect(result.errors).toEqual([]);
    expect(result.data.exceptions).toHaveLength(1);
    expect(result.data.exceptions[0]?.blocking).toBe(true);
  });

  it('reports missing required contract fields', () => {
    const result = loadAndValidateSyncLedger(
      fixturePath('invalid-missing-required-field.sync-ledger.json')
    );

    expect(result.errors).toContain('[CT-8B_MISSING_REQUIRED_KEY] artifact.revision is required');
  });

  it('reports contradictory parity metadata', () => {
    const result = loadAndValidateSyncLedger(
      fixturePath('invalid-contradictory-mode.sync-ledger.json')
    );

    expect(result.errors).toContain(
      '[CT-8B_FORBIDDEN_PARITY_DEFERRED_REASON] promotion.parityDeferredReason must be omitted when promotion.parityMode is required'
    );
  });

  it('reports invalid Tokens Studio carrier metadata', () => {
    const result = loadAndValidateSyncLedger(
      fixturePath('invalid-tokens-studio-carrier.sync-ledger.json')
    );

    expect(result.errors).toContain(
      '[CT-8B_INVALID_TOKENS_STUDIO_CARRIER_COMBINATION] publish.tokensStudioCarrier must be true only when publish.mode is tokens-studio-carried'
    );
  });

  it('forbids promotion-complete while parity is deferred', () => {
    const result = loadAndValidateSyncLedger(
      fixturePath('invalid-deferred-complete.sync-ledger.json')
    );

    expect(result.errors).toContain(
      '[CT-8B_EARNED_LEVEL_REQUIRES_REQUIRED_PARITY] promotion.highestEarnedLevel cannot be E-promotion-complete when promotion.parityMode is deferred'
    );
  });
});

describe('validateFigmaParity', () => {
  it('accepts a required ledger with the hardened rail and no blocking exceptions', () => {
    const result = validateFigmaParity({
      target: fixturePath('valid-required.sync-ledger.json'),
    });

    expect(result).toEqual({
      ok: true,
      parityMode: 'required',
      message: '✓ Figma parity requirements are satisfied for the current sync ledger.',
    });
  });

  it('fails required parity when a blocking exception remains open', () => {
    const requiredLedger = readFixture('valid-required.sync-ledger.json');
    const result = evaluateFigmaParity({
      ...requiredLedger,
      exceptions: [
        {
          code: 'oauth-ownership-pending',
          message: 'The hardened rail still has unresolved ownership work.',
          blocking: true,
          status: 'open',
          field: 'exceptions[0]',
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      '[FIGMA_PARITY_OPEN_BLOCKING_EXCEPTION] exceptions[0].status for oauth-ownership-pending must not remain open when promotion.parityMode is required'
    );
  });

  it('fails required parity when the ledger does not point at the hardened rail', () => {
    const requiredLedger = readFixture('valid-required.sync-ledger.json');
    const result = evaluateFigmaParity({
      ...requiredLedger,
      publish: {
        ...requiredLedger.publish,
        mode: 'plugin-import-manual',
      },
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      '[FIGMA_PARITY_REQUIRES_HARDENED_RAIL] publish.mode must be rest-variables-oauth when promotion.parityMode is required'
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
    expect(stdout.read()).toContain(
      'Parity remains deferred until the hardened Variables API rail'
    );
    expect(stderr.read()).toBe('');
  });
});

function fixturePath(name: string) {
  return path.join(syncLedgerFixtureDir, name);
}

function readFixture(name: string) {
  return JSON.parse(fs.readFileSync(fixturePath(name), 'utf8')) as {
    artifact: { revision: string };
    exceptions: Array<{
      blocking: boolean;
      code: string;
      field?: string;
      message: string;
      status: string;
    }>;
    promotion: { parityMode: string };
    publish: { figmaFile: string; mode: string; tokensStudioCarrier: boolean };
    verification: { lastVerifiedRevision: string | null; materializationStatus: string };
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
