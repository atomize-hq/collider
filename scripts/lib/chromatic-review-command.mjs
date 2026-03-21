import fs from 'node:fs';
import path from 'node:path';

export const chromaticReviewBuildDir = 'storybook-static';
export const chromaticReviewArtifactPrefix = 'storybook-static';
export const chromaticReviewJobName = 'chromatic-review';
export const chromaticReviewScriptName = 'chromatic:review';
export const chromaticProjectTokenEnvVar = 'CHROMATIC_PROJECT_TOKEN';
export const chromaticReviewClaimRequiredEnvVar = 'CHROMATIC_REVIEW_REQUIRED_FOR_CLAIM';
export const chromaticReviewDeferEnvVar = 'CHROMATIC_REVIEW_DEFER';
export const chromaticReviewDiagnosticsPath = 'artifacts/chromatic/chromatic-diagnostics.json';
export const chromaticReviewLogPath = 'artifacts/chromatic/chromatic.log';

export function assertChromaticReviewBuildDirectory(buildDirPath) {
  let stats;
  try {
    stats = fs.statSync(buildDirPath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new Error(
        `[CHROMATIC_REVIEW_BUILD_DIR_MISSING] expected prebuilt Storybook directory at ${buildDirPath}`
      );
    }
    throw error;
  }

  if (!stats.isDirectory()) {
    throw new Error(`[CHROMATIC_REVIEW_BUILD_DIR_INVALID] expected a directory at ${buildDirPath}`);
  }
}

export function createChromaticRunnerOptions(options = {}) {
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const buildDir = options.buildDir ?? chromaticReviewBuildDir;
  const buildDirPath = path.resolve(cwd, buildDir);
  const branchName = options.branchName;
  const diagnosticsFile =
    options.diagnosticsFile ?? path.resolve(cwd, chromaticReviewDiagnosticsPath);
  const logFile = options.logFile ?? path.resolve(cwd, chromaticReviewLogPath);
  const projectToken = options.projectToken ?? env[chromaticProjectTokenEnvVar]?.trim() ?? null;
  const deferred = options.deferred ?? isChromaticReviewDeferred(env);
  const ci = options.ci ?? isChromaticReviewCi(env);

  assertChromaticReviewBuildDirectory(buildDirPath);

  if (!projectToken) {
    if (ci) {
      throw new Error(
        `[CHROMATIC_REVIEW_TOKEN_MISSING] ${chromaticProjectTokenEnvVar} must be set for the ${chromaticReviewJobName} CI owner`
      );
    }

    return {
      mode: 'local-refusal',
      buildDir,
      buildDirPath,
      diagnosticsFile,
      logFile,
      message:
        `Refusing shared Chromatic publication without ${chromaticProjectTokenEnvVar}. ` +
        `${chromaticReviewJobName} remains the only shared owner; local runs stop after validating the prebuilt Storybook directory and proof scope.`,
    };
  }

  return {
    mode: deferred ? 'deferred' : 'publish',
    buildDir,
    buildDirPath,
    diagnosticsFile,
    logFile,
    options: {
      branchName,
      ci,
      diagnosticsFile,
      exitZeroOnChanges: true,
      logFile,
      projectToken,
      skip: deferred,
      skipUpdateCheck: true,
      storybookBuildDir: buildDirPath,
    },
  };
}

export function isChromaticReviewCi(env = process.env) {
  return env.GITHUB_ACTIONS === 'true' || env.CI === 'true';
}

export function isChromaticReviewClaimRequired(env = process.env) {
  return env[chromaticReviewClaimRequiredEnvVar] === 'true';
}

export function isChromaticReviewDeferred(env = process.env) {
  return env[chromaticReviewDeferEnvVar] === 'true';
}
