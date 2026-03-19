import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { repoRoot } from '../../design-tokens/build/paths.mjs';

export const governanceScripts = ['validate:tokens', 'validate-token-artifacts', 'build:tokens'];
export const governanceUsage = 'Usage: pnpm govern:tokens';

export function runTokenGovernance(options = {}) {
  const runScript = options.runScript ?? runGovernanceScript;

  for (const scriptName of governanceScripts) {
    const exitCode = runScript(scriptName);
    if (exitCode !== 0) {
      return exitCode;
    }
  }

  return 0;
}

export function runGovernanceScript(scriptName, options = {}) {
  if (scriptName === 'validate-token-artifacts') {
    return runNodeCommand(['scripts/validate-token-artifacts.mjs'], options);
  }

  return runPnpmScript(scriptName, options);
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

function createSpawnOptions(options = {}) {
  return {
    cwd: options.cwd ?? repoRoot,
    stdio: 'inherit',
  };
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
