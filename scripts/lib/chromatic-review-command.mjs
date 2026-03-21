import fs from 'node:fs';
import path from 'node:path';

export const chromaticReviewBuildDir = 'storybook-static';
export const chromaticReviewArtifactName = chromaticReviewBuildDir;
export const chromaticReviewJobName = 'chromatic-review';
export const chromaticReviewScriptName = 'chromatic:review';
export const chromaticProjectTokenEnvVar = 'CHROMATIC_PROJECT_TOKEN';

export function resolveChromaticReviewInvocation(options = {}) {
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const buildDir = options.buildDir ?? chromaticReviewBuildDir;
  const buildDirPath = path.resolve(cwd, buildDir);
  const token = env[chromaticProjectTokenEnvVar]?.trim();
  const isCi = env.GITHUB_ACTIONS === 'true' || env.CI === 'true';

  assertBuildDirectory(buildDirPath);

  if (!token) {
    if (isCi) {
      throw new Error(
        `[CHROMATIC_REVIEW_TOKEN_MISSING] ${chromaticProjectTokenEnvVar} must be set for the ${chromaticReviewJobName} CI owner`
      );
    }

    return {
      mode: 'local-refusal',
      buildDir,
      buildDirPath,
      message:
        `Refusing shared Chromatic publication without ${chromaticProjectTokenEnvVar}. ` +
        `${chromaticReviewJobName} remains the only shared owner; local runs stop after validating the prebuilt Storybook directory.`,
    };
  }

  return {
    mode: 'publish',
    buildDir,
    buildDirPath,
    command: process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    args: ['exec', 'chromatic', '--storybook-build-dir', buildDir, '--exit-zero-on-changes'],
  };
}

function assertBuildDirectory(buildDirPath) {
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
