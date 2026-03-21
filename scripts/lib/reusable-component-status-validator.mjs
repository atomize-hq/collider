import process from 'node:process';
import path from 'node:path';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  createReusableComponentStatus,
  defaultReusableComponentStatusPath,
  reusableComponentStatusChangeClassEnvVar,
  reusableComponentStatusMaxAgeMinutesEnvVar,
  reusableComponentStatusRootDirEnvVar,
  reusableComponentStatusTargetEnvVar,
  readReusableComponentStatusArtifact,
  validateReusableComponentStatusArtifact,
} from './reusable-component-status.mjs';

export const reusableComponentStatusValidationUsage =
  'Usage: pnpm validate:reusable-component-status';

export async function runReusableComponentStatusValidation(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const env = options.env ?? process.env;
  const rootDir = path.resolve(
    options.rootDir ?? env[reusableComponentStatusRootDirEnvVar] ?? repoRoot
  );
  const target =
    options.target ??
    env[reusableComponentStatusTargetEnvVar] ??
    defaultReusableComponentStatusPath;

  let artifact;
  try {
    artifact = readReusableComponentStatusArtifact(target, { rootDir });
  } catch (error) {
    writeLine(
      stderr,
      `[CT-12B_STATUS_READ_FAILED] could not read ${path.isAbsolute(target) ? target : path.resolve(rootDir, target)}: ${error instanceof Error ? error.message : String(error)}`
    );
    return 1;
  }

  const validationErrors = validateReusableComponentStatusArtifact(artifact.data);
  if (validationErrors.length > 0) {
    for (const error of validationErrors) {
      writeLine(stderr, error);
    }
    return 1;
  }

  const expected = createReusableComponentStatus({
    changeClass:
      options.changeClass ??
      env[reusableComponentStatusChangeClassEnvVar] ??
      artifact.data.changeClass,
    chromaticStatusMaxAgeMinutes:
      options.chromaticStatusMaxAgeMinutes ?? env[reusableComponentStatusMaxAgeMinutesEnvVar],
    now: options.now,
    rootDir,
  });
  const diffs = compareStatusArtifacts(artifact.data, expected);
  if (diffs.length > 0) {
    for (const diff of diffs) {
      writeLine(stderr, diff);
    }
    return 1;
  }

  writeLine(stdout, `✓ Reusable component status artifact valid: ${artifact.absPath}`);
  writeLine(
    stdout,
    `Highest earned claim: ${artifact.data.highestEarnedClaim.profileId}/${artifact.data.highestEarnedClaim.claimId}`
  );
  return 0;
}

export async function runReusableComponentStatusValidationCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  if (args.length > 0) {
    writeLine(options.stderr ?? process.stderr, reusableComponentStatusValidationUsage);
    return 1;
  }

  try {
    return await runReusableComponentStatusValidation(options);
  } catch (error) {
    writeLine(
      options.stderr ?? process.stderr,
      `[UNEXPECTED_RUNTIME_FAILURE] ${error instanceof Error ? error.message : String(error)}`
    );
    return 3;
  }
}

function compareStatusArtifacts(actual, expected) {
  const diffs = [];
  compareValues(diffs, actual, expected, '');
  return diffs;
}

function compareValues(diffs, actual, expected, currentPath) {
  if (currentPath === 'generatedAt') {
    return;
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) {
      diffs.push(
        `[CT-12B_STATUS_DRIFT] ${formatPath(currentPath)} length expected ${expected.length} but received ${actual.length}`
      );
      return;
    }
    for (let index = 0; index < actual.length; index += 1) {
      compareValues(diffs, actual[index], expected[index], `${currentPath}[${index}]`);
    }
    return;
  }

  if (isPlainObject(actual) && isPlainObject(expected)) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
      diffs.push(
        `[CT-12B_STATUS_DRIFT] ${formatPath(currentPath)} keys expected ${expectedKeys.join(', ')} but received ${actualKeys.join(', ')}`
      );
      return;
    }
    for (const key of expectedKeys) {
      compareValues(diffs, actual[key], expected[key], currentPath ? `${currentPath}.${key}` : key);
    }
    return;
  }

  if (actual !== expected) {
    diffs.push(
      `[CT-12B_STATUS_DRIFT] ${formatPath(currentPath)} expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`
    );
  }
}

function formatPath(value) {
  return value.length === 0 ? '<root>' : value;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
