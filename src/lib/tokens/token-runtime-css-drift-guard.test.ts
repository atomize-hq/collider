import { describe, expect, it } from 'vitest';
import {
  generatorRelPath,
  parseGitStatusOutput,
  runRuntimeCssDriftGuard,
  runtimeCssManualEditExitCode,
  runtimeCssRelPath,
  tokenSourceRelPath,
} from '../../../scripts/lib/token-runtime-css-drift-guard.mjs';

describe('parseGitStatusOutput', () => {
  it('tracks runtime css and token source dirtiness independently', () => {
    expect(
      parseGitStatusOutput(
        ` M ${runtimeCssRelPath}\nM  ${tokenSourceRelPath}/semantic.tokens.json\n`
      )
    ).toEqual({
      runtimeCssDirty: true,
      tokenSourceDirty: true,
      generatorDirty: false,
    });
  });

  it('tracks the css generator as its own input', () => {
    expect(parseGitStatusOutput(` M ${runtimeCssRelPath}\n M ${generatorRelPath}\n`)).toEqual({
      runtimeCssDirty: true,
      tokenSourceDirty: false,
      generatorDirty: true,
    });
  });
});

describe('runRuntimeCssDriftGuard', () => {
  it('passes when neither runtime css nor token sources are dirty', () => {
    expect(
      runRuntimeCssDriftGuard({
        readGitStatus() {
          return { runtimeCssDirty: false, tokenSourceDirty: false };
        },
      })
    ).toEqual({ ok: true, exitCode: 0 });
  });

  it('fails when only runtime css is dirty', () => {
    const result = runRuntimeCssDriftGuard({
      readGitStatus() {
        return { runtimeCssDirty: true, tokenSourceDirty: false };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(runtimeCssManualEditExitCode);
    expect(result.message).toContain(runtimeCssRelPath);
    expect(result.message).toContain('`pnpm build:tokens`');
  });

  it('passes when only token sources are dirty', () => {
    expect(
      runRuntimeCssDriftGuard({
        readGitStatus() {
          return { runtimeCssDirty: false, tokenSourceDirty: true };
        },
      })
    ).toEqual({ ok: true, exitCode: 0 });
  });

  it('passes when runtime css and token sources are both dirty', () => {
    expect(
      runRuntimeCssDriftGuard({
        readGitStatus() {
          return { runtimeCssDirty: true, tokenSourceDirty: true };
        },
      })
    ).toEqual({ ok: true, exitCode: 0 });
  });

  it('passes when runtime css moved because the generator changed', () => {
    expect(
      runRuntimeCssDriftGuard({
        readGitStatus() {
          return { runtimeCssDirty: true, tokenSourceDirty: false, generatorDirty: true };
        },
      })
    ).toEqual({ ok: true, exitCode: 0 });
  });

  it('surfaces git read failures', () => {
    expect(() =>
      runRuntimeCssDriftGuard({
        readGitStatus() {
          throw new Error('git unavailable');
        },
      })
    ).toThrow('git unavailable');
  });
});
