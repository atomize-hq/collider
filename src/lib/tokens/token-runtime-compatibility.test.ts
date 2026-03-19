import { execFileSync, spawnSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  runTokenRuntimeCompatibilityCheck,
  runTokenRuntimeCompatibilityCli,
  runtimeCompatibilityUsage,
} from '../../../scripts/lib/token-runtime-compatibility.mjs';

const repoRoot = process.cwd();
const legacyVar = '--color-text-primary';

beforeAll(() => {
  execFileSync('pnpm', ['build:tokens'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
});

describe('runTokenRuntimeCompatibilityCheck', () => {
  it('passes against the committed runtime css compatibility surface', async () => {
    await expect(runTokenRuntimeCompatibilityCheck()).resolves.toEqual({
      ok: true,
      diagnostics: [],
    });
  });

  it('reports the exact missing legacy variable name', async () => {
    const result = await runTokenRuntimeCompatibilityCheck({
      runtimeCssSource: ':root {\n  --color-text-secondary: #6a7282;\n}\n',
      inventory: createInventoryFixture([legacyVar]),
      aliasMap: createAliasMapFixture([legacyVar]),
    });

    expect(result).toEqual({
      ok: false,
      diagnostics: [
        expect.objectContaining({
          code: 'RUNTIME_COMPATIBILITY_VARIABLE_MISSING',
          path: 'src/lib/tokens/tokens.css',
          rule: 'CT-6',
          message: expect.stringContaining(`"${legacyVar}"`),
        }),
      ],
    });
  });

  it('reports contract drift when the alias map falls out of sync with the inventory', async () => {
    const result = await runTokenRuntimeCompatibilityCheck({
      runtimeCssSource: ':root {\n  --color-text-primary: #ffffff;\n}\n',
      inventory: createInventoryFixture([legacyVar]),
      aliasMap: createAliasMapFixture([]),
    });

    expect(result).toEqual({
      ok: false,
      diagnostics: [
        expect.objectContaining({
          code: 'RUNTIME_COMPATIBILITY_CONTRACT_MISMATCH',
          path: 'design-tokens/src/tokens/migrations/runtime-css-aliases.json',
          rule: 'CT-6',
          message: expect.stringContaining(`"${legacyVar}"`),
        }),
      ],
    });
  });
});

describe('runTokenRuntimeCompatibilityCli', () => {
  it('fails fast on unsupported args', async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const exitCode = await runTokenRuntimeCompatibilityCli({
      args: ['--json'],
      stdout,
      stderr,
      runCheck: async () => {
        throw new Error('should not run');
      },
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe('');
    expect(stderr.read()).toBe(`${runtimeCompatibilityUsage}\n`);
  });

  it('maps unexpected runtime failures to exit code 3', async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const exitCode = await runTokenRuntimeCompatibilityCli({
      args: [],
      stdout,
      stderr,
      runCheck: async () => {
        throw new Error('boom');
      },
    });

    expect(exitCode).toBe(3);
    expect(stdout.read()).toBe('');
    expect(stderr.read()).toBe('[UNEXPECTED_RUNTIME_FAILURE] boom\n');
  });
});

describe('validate-token-runtime-compatibility CLI', () => {
  it('prints a success summary when runtime compatibility is intact', () => {
    const result = spawnSync('node', ['scripts/validate-token-runtime-compatibility.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Runtime CSS compatibility surface is intact');
    expect(result.stderr).toBe('');
  });
});

function createInventoryFixture(legacyVars: string[]) {
  return {
    entries: legacyVars.map((entryLegacyVar) => ({
      legacyVar: entryLegacyVar,
      value: '#ffffff',
      normalizedCategory: 'text',
    })),
  };
}

function createAliasMapFixture(legacyVars: string[]) {
  return {
    entries: legacyVars.map((entryLegacyVar) => ({
      legacyVar: entryLegacyVar,
      canonicalTokenId: 'semantic.color.text.primary',
      themeId: 'dark',
      action: 'preserve',
    })),
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
