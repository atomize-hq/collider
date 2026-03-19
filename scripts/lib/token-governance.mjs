import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { repoRoot } from '../../design-tokens/build/paths.mjs';
import { runRuntimeCssDriftGuard } from './token-runtime-css-drift-guard.mjs';

export const governanceUsage = 'Usage: pnpm govern:tokens';
export const governanceSteps = [
  { id: 'validate:tokens', kind: 'pnpm-script', scriptName: 'validate:tokens' },
  { id: 'runtime-css-drift-guard', kind: 'guard' },
  { id: 'build:tokens', kind: 'pnpm-script', scriptName: 'build:tokens' },
  {
    id: 'runtime-compatibility',
    kind: 'node-script',
    scriptPath: 'scripts/validate-token-runtime-compatibility.mjs',
  },
  {
    id: 'artifact-freshness',
    kind: 'node-script',
    scriptPath: 'scripts/validate-token-artifacts.mjs',
  },
];

export function runTokenGovernance(options = {}) {
  const runScript = options.runScript ?? runPnpmScript;
  const runNodeScript = options.runNodeScript ?? runNodeCommand;
  const runGuard = options.runRuntimeCssDriftGuard ?? runRuntimeCssDriftGuard;
  const stderr = options.stderr ?? process.stderr;

  for (const step of governanceSteps) {
    const exitCode = runGovernanceStep(step, {
      runScript,
      runNodeScript,
      runGuard,
      stderr,
    });
    if (exitCode !== 0) {
      return exitCode;
    }
  }

  return 0;
}

export function runTokenGovernanceCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const stderr = options.stderr ?? process.stderr;
  const runGovernance = options.runGovernance ?? runTokenGovernance;

  if (args.length > 0) {
    writeLine(stderr, governanceUsage);
    return 1;
  }

  try {
    return runGovernance();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(stderr, `[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
    return 3;
  }
}

export function runPnpmScript(scriptName, options = {}) {
  const pnpmCommand = getPnpmCommand(options.platform);
  const result = spawnSync(pnpmCommand, [scriptName], createSpawnOptions(options));

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status !== 'number') {
    throw new Error(`governance step exited without a numeric code: ${scriptName}`);
  }

  return result.status;
}

export function getPnpmCommand(platform = process.platform) {
  return platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

function runNodeCommand(args, options = {}) {
  const result = spawnSync('node', args, createSpawnOptions(options));

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status !== 'number') {
    throw new Error(`governance step exited without a numeric code: node ${args.join(' ')}`);
  }

  return result.status;
}

function runGovernanceStep(step, options) {
  if (step.kind === 'pnpm-script') {
    return options.runScript(step.scriptName);
  }

  if (step.kind === 'node-script') {
    return options.runNodeScript([step.scriptPath]);
  }

  if (step.kind === 'guard') {
    const result = options.runGuard();
    if (result.ok) {
      return 0;
    }

    writeLine(options.stderr, result.message);
    return result.exitCode;
  }

  throw new Error(`unknown governance step kind: ${step.kind}`);
}

function createSpawnOptions(options = {}) {
  return {
    cwd: options.cwd ?? repoRoot,
    stdio: 'inherit',
  };
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
