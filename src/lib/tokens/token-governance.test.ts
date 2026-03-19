import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  governanceScripts,
  governanceUsage,
  runTokenGovernance,
  runTokenGovernanceCli,
} from '../../../scripts/lib/token-governance.mjs';

describe('runTokenGovernance', () => {
  it('runs validate, freshness, and build in order on success', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return 0;
      },
    });

    expect(exitCode).toBe(0);
    expect(calls).toEqual(governanceScripts);
  });

  it('short-circuits when validation fails', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return scriptName === 'validate:tokens' ? 1 : 0;
      },
    });

    expect(exitCode).toBe(1);
    expect(calls).toEqual(['validate:tokens']);
  });

  it('preserves artifact freshness failure exit code', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return scriptName === 'validate-token-artifacts' ? 1 : 0;
      },
    });

    expect(exitCode).toBe(1);
    expect(calls).toEqual(['validate:tokens', 'validate-token-artifacts']);
  });

  it('preserves build failure exit code', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return scriptName === 'build:tokens' ? 2 : 0;
      },
    });

    expect(exitCode).toBe(2);
    expect(calls).toEqual(governanceScripts);
  });
});

describe('runTokenGovernanceCli', () => {
  it('fails fast on unsupported args', () => {
    const stderr = createWritableBuffer();
    const exitCode = runTokenGovernanceCli({
      args: ['--json'],
      stderr,
      runGovernance() {
        throw new Error('should not run');
      },
    });

    expect(exitCode).toBe(1);
    expect(stderr.read()).toBe(`${governanceUsage}\n`);
  });

  it('maps unexpected orchestration failures to exit code 3', () => {
    const stderr = createWritableBuffer();
    const exitCode = runTokenGovernanceCli({
      args: [],
      stderr,
      runGovernance() {
        throw new Error('boom');
      },
    });

    expect(exitCode).toBe(3);
    expect(stderr.read()).toBe('[UNEXPECTED_RUNTIME_FAILURE] boom\n');
  });
});

describe('governance package contract', () => {
  it('exposes the seam-owned govern:tokens entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['govern:tokens']).toBe('node scripts/govern-tokens.mjs');
  });
});

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
