import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  governanceSteps,
  governanceUsage,
  runTokenGovernance,
  runTokenGovernanceCli,
} from '../../../scripts/lib/token-governance.mjs';
import { runtimeCssManualEditExitCode } from '../../../scripts/lib/token-runtime-css-drift-guard.mjs';

describe('runTokenGovernance', () => {
  it('runs the full governance chain in order on success', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return 0;
      },
      runRuntimeCssDriftGuard() {
        calls.push('runtime-css-drift-guard');
        return { ok: true, exitCode: 0 };
      },
      runNodeScript(args: string[]) {
        calls.push(args[0]);
        return 0;
      },
    });

    expect(exitCode).toBe(0);
    expect(calls).toEqual([
      'validate:tokens',
      'runtime-css-drift-guard',
      'build:tokens',
      'scripts/validate-token-runtime-compatibility.mjs',
      'scripts/validate-token-artifacts.mjs',
      'figma:verify',
      'validate:sync-ledger',
      'validate:figma-parity',
      'validate:publish-proof',
    ]);
  });

  it('short-circuits when validation fails', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return scriptName === 'validate:tokens' ? 1 : 0;
      },
      runRuntimeCssDriftGuard() {
        calls.push('runtime-css-drift-guard');
        return { ok: true, exitCode: 0 };
      },
      runNodeScript(args: string[]) {
        calls.push(args[0]);
        return 0;
      },
    });

    expect(exitCode).toBe(1);
    expect(calls).toEqual(['validate:tokens']);
  });

  it('fails on direct runtime css edits before build can overwrite them', () => {
    const calls: string[] = [];
    const stderr = createWritableBuffer();
    const exitCode = runTokenGovernance({
      stderr,
      runScript(scriptName: string) {
        calls.push(scriptName);
        return 0;
      },
      runRuntimeCssDriftGuard() {
        calls.push('runtime-css-drift-guard');
        return {
          ok: false,
          exitCode: runtimeCssManualEditExitCode,
          message:
            'Direct edits to src/lib/tokens/tokens.css are not allowed after cutover. Recover by running `pnpm build:tokens` to regenerate from canonical sources.',
        };
      },
      runNodeScript(args: string[]) {
        calls.push(args[0]);
        return 0;
      },
    });

    expect(exitCode).toBe(runtimeCssManualEditExitCode);
    expect(calls).toEqual(['validate:tokens', 'runtime-css-drift-guard']);
    expect(stderr.read()).toContain('`pnpm build:tokens`');
  });

  it('preserves build failure exit code', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return scriptName === 'build:tokens' ? 2 : 0;
      },
      runRuntimeCssDriftGuard() {
        calls.push('runtime-css-drift-guard');
        return { ok: true, exitCode: 0 };
      },
      runNodeScript(args: string[]) {
        calls.push(args[0]);
        return 0;
      },
    });

    expect(exitCode).toBe(2);
    expect(calls).toEqual(['validate:tokens', 'runtime-css-drift-guard', 'build:tokens']);
  });

  it('runs compatibility before freshness and preserves the first failing node-script exit code', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return 0;
      },
      runRuntimeCssDriftGuard() {
        calls.push('runtime-css-drift-guard');
        return { ok: true, exitCode: 0 };
      },
      runNodeScript(args: string[]) {
        calls.push(args[0]);
        return args[0] === 'scripts/validate-token-runtime-compatibility.mjs' ? 2 : 0;
      },
    });

    expect(exitCode).toBe(2);
    expect(calls).toEqual([
      'validate:tokens',
      'runtime-css-drift-guard',
      'build:tokens',
      'scripts/validate-token-runtime-compatibility.mjs',
    ]);
  });

  it('propagates a required-parity failure after the shared ledger gate', () => {
    const calls: string[] = [];
    const exitCode = runTokenGovernance({
      runScript(scriptName: string) {
        calls.push(scriptName);
        return scriptName === 'validate:figma-parity' ? 1 : 0;
      },
      runRuntimeCssDriftGuard() {
        calls.push('runtime-css-drift-guard');
        return { ok: true, exitCode: 0 };
      },
      runNodeScript(args: string[]) {
        calls.push(args[0]);
        return 0;
      },
    });

    expect(exitCode).toBe(1);
    // Stops at parity: validate:publish-proof is the next step and must not run.
    expect(calls).toEqual([
      'validate:tokens',
      'runtime-css-drift-guard',
      'build:tokens',
      'scripts/validate-token-runtime-compatibility.mjs',
      'scripts/validate-token-artifacts.mjs',
      'figma:verify',
      'validate:sync-ledger',
      'validate:figma-parity',
    ]);
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
    // Every rail step is an invocation of the pinned CLI and nothing else. The
    // literal is asserted because that is the whole of Collider's ownership here:
    // if one of these grows an argument that carries policy, it belongs upstream.
    expect(packageJson.scripts?.['validate:sync-ledger']).toBe(
      'node scripts/ds-skills.mjs ledger validate --ledger src/figma/sync-ledger.json ' +
        '--profile .agents/skills/profiles/collider.json'
    );
    expect(packageJson.scripts?.['validate:figma-parity']).toBe(
      'node scripts/ds-skills.mjs ledger parity --ledger src/figma/sync-ledger.json ' +
        '--profile .agents/skills/profiles/collider.json'
    );
    expect(packageJson.scripts?.['validate:publish-proof']).toBe(
      'node scripts/ds-skills.mjs proof validate --proof src/figma/publish-proof.json ' +
        '--profile .agents/skills/profiles/collider.json'
    );
    expect(packageJson.scripts?.['figma:verify']).toBe(
      'node scripts/ds-skills.mjs figma verify --config figma/token-sync.config.json ' +
        '--expect figma/token-rail.baseline.json --artifact design-tokens/dist/figma/tokens.json'
    );
  });

  it('exposes the ordered post-cutover governance steps', () => {
    expect(governanceSteps.map((step) => step.id)).toEqual([
      'validate:tokens',
      'runtime-css-drift-guard',
      'build:tokens',
      'runtime-compatibility',
      'artifact-freshness',
      'figma:verify',
      'validate:sync-ledger',
      'validate:figma-parity',
      'validate:publish-proof',
    ]);
  });

  it('runs govern:tokens first in just preflight before downstream checks', () => {
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
    const preflightRecipe = extractRecipe(justfile, 'preflight');
    const orderedCommands = [
      'pnpm govern:tokens',
      'just storybook-proof',
      'just check',
      'just loc',
      'just test-all',
    ];

    expect(preflightRecipe).toContain('▶ step 1/5 — token governance');
    expect(preflightRecipe).toContain('▶ step 5/5 — automated tests');
    expectCommandOrder(preflightRecipe, orderedCommands);
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

function extractRecipe(justfile: string, recipeName: string) {
  const recipeMatch = justfile.match(new RegExp(`^${recipeName}:\\n((?:    .*\\n)+)`, 'm'));

  expect(recipeMatch?.[1]).toBeDefined();
  return recipeMatch![1];
}

function expectCommandOrder(block: string, commands: string[]) {
  const indexes = commands.map((command) => block.indexOf(command));

  expect(indexes.every((index) => index >= 0)).toBe(true);
  expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
}
