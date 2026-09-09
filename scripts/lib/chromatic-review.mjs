import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { run as runChromaticNode } from 'chromatic/node';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  chromaticReviewBuildDir,
  createChromaticRunnerOptions,
  isChromaticReviewClaimRequired,
} from './chromatic-review-command.mjs';
import {
  chromaticStatusArtifactPath,
  normalizeChromaticStatus,
  readChromaticDiagnosticsFile,
  resolveChromaticBuildUrl,
  writeChromaticStatus,
} from './chromatic-status.mjs';
import { loadAndValidateStorybookProofStructure } from './storybook-proof-structure.mjs';

const proofInventoryPath = 'storybook/story-inventory.json';

export async function runChromaticReview(options = {}) {
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const buildDir = options.buildDir ?? chromaticReviewBuildDir;
  const buildDirPath = path.resolve(cwd, buildDir);
  const branchName = options.branchName ?? resolveChromaticBranchName(env, cwd);
  const gitSha = options.gitSha ?? resolveChromaticGitSha(env, cwd);
  const loadProofStructure =
    options.loadProofStructure ??
    ((loadOptions = {}) => loadAndValidateStorybookProofStructure({ rootDir, ...loadOptions }));
  const providerExecutor = options.providerExecutor ?? executeChromaticPublish;
  const writeStatus = options.writeStatus ?? writeChromaticStatus;
  const artifactPath = options.artifactPath ?? path.resolve(cwd, chromaticStatusArtifactPath);
  const claimRequired = options.claimRequired ?? isChromaticReviewClaimRequired(env);

  try {
    const proofStructure = loadProofStructure({ rootDir });
    if (proofStructure.errors.length > 0) {
      return {
        error: new Error(
          `[CHROMATIC_REVIEW_INVALID_PROOF_SCOPE] ${proofStructure.errors.join(' | ')}`
        ),
        exitCode: 1,
      };
    }

    const proofScope = createChromaticProofScope(proofStructure.data);
    const runner = createChromaticRunnerOptions({
      branchName,
      buildDir,
      cwd,
      deferred: options.deferred,
      diagnosticsFile: options.diagnosticsFile,
      env,
      logFile: options.logFile,
      projectToken: options.projectToken,
    });

    if (runner.mode === 'local-refusal') {
      return {
        exitCode: 0,
        message: runner.message,
        proofScope,
      };
    }

    let providerResult;
    let providerError = null;

    try {
      providerResult = await providerExecutor({
        branchName,
        buildDir,
        buildDirPath,
        env,
        gitSha,
        invocation: runner,
        rootDir,
      });
    } catch (error) {
      providerError = error instanceof Error ? error : new Error(String(error));
      providerResult = {
        code: 1,
      };
    }

    const diagnostics = await readChromaticDiagnosticsFile(runner.diagnosticsFile);
    const diffOutcome = resolveChromaticDiffOutcome({
      deferred: runner.mode === 'deferred',
      providerResult,
    });
    const buildUrl = resolveChromaticBuildUrl({ diagnostics, providerResult });

    if (!buildUrl) {
      return {
        error:
          providerError ??
          new Error(
            `[CHROMATIC_REVIEW_BUILD_URL_MISSING] ${runner.diagnosticsFile} did not capture a build URL for diff outcome "${diffOutcome}"`
          ),
        exitCode: resolveChromaticExitCode({ diffOutcome, providerResult }),
      };
    }

    const reviewMode = claimRequired ? 'claim-required' : 'informational';
    const status = normalizeChromaticStatus({
      branchName,
      buildUrl,
      checkConclusion: resolveChromaticCheckConclusion(diffOutcome),
      diffOutcome,
      gitSha,
      proofInventory: {
        inventoryVersion: proofScope.inventoryVersion,
        path: proofInventoryPath,
        selectedComponentIds: proofScope.componentIds,
        selectedStoryIds: proofScope.storyIds,
      },
      requiredForClaim: claimRequired,
      reviewMode,
      reviewScope: {
        componentIds: proofScope.componentIds,
        componentTiers: proofScope.componentTiers,
        storyIds: proofScope.storyIds,
      },
    });
    const absArtifactPath = await writeStatus(status, artifactPath);

    return {
      absArtifactPath,
      diffOutcome,
      exitCode: resolveChromaticExitCode({ diffOutcome, providerResult }),
      providerError,
      providerResult,
      status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      exitCode: 1,
    };
  }
}

export async function executeChromaticPublish(options) {
  const result = await runChromaticNode({
    options: options.invocation.options,
  });

  return {
    buildUrl: result.buildUrl ?? result.url ?? null,
    changeCount: result.changeCount ?? 0,
    code: result.code ?? 1,
    diagnosticsPath: options.invocation.diagnosticsFile,
    storybookUrl: result.storybookUrl ?? null,
    url: result.url ?? null,
  };
}

function createChromaticProofScope(proofStructureData) {
  const inventoryComponents = proofStructureData.inventory?.components;
  const componentSpecs = proofStructureData.componentSpecs ?? [];

  if (!Array.isArray(inventoryComponents) || inventoryComponents.length === 0) {
    throw new Error(
      '[CHROMATIC_REVIEW_EMPTY_SCOPE] storybook/story-inventory.json did not resolve any proof components'
    );
  }

  const componentIds = [];
  const storyIds = [];
  const componentTiers = {};

  for (const component of inventoryComponents) {
    if (
      !component ||
      typeof component.componentId !== 'string' ||
      component.componentId.length === 0
    ) {
      throw new Error(
        '[CHROMATIC_REVIEW_INVALID_SCOPE_COMPONENT] inventory contains a component without a valid componentId'
      );
    }

    const matchingSpec = componentSpecs.find(
      (record) => record?.data?.componentId === component.componentId
    );
    if (
      !matchingSpec ||
      typeof matchingSpec.data?.tier !== 'string' ||
      matchingSpec.data.tier.length === 0
    ) {
      throw new Error(
        `[CHROMATIC_REVIEW_SCOPE_SPEC_MISMATCH] missing matching component spec tier for componentId "${component.componentId}"`
      );
    }

    componentIds.push(component.componentId);
    componentTiers[component.componentId] = matchingSpec.data.tier;

    for (const storyRef of component.implementedStoryRefs ?? []) {
      if (typeof storyRef?.storyId !== 'string' || storyRef.storyId.length === 0) {
        throw new Error(
          `[CHROMATIC_REVIEW_INVALID_SCOPE_STORY] componentId "${component.componentId}" includes an invalid story reference`
        );
      }
      storyIds.push(storyRef.storyId);
    }
  }

  const uniqueStoryIds = [...new Set(storyIds)];
  if (uniqueStoryIds.length === 0) {
    throw new Error(
      '[CHROMATIC_REVIEW_EMPTY_SCOPE] storybook/story-inventory.json did not resolve any proof story IDs'
    );
  }

  return {
    componentIds,
    componentTiers,
    inventoryVersion: proofStructureData.inventory.inventoryVersion,
    storyIds: uniqueStoryIds,
  };
}

function resolveChromaticDiffOutcome({ deferred, providerResult }) {
  if (deferred) {
    return 'deferred';
  }

  if ((providerResult?.code ?? 1) !== 0) {
    return 'failed';
  }

  if ((providerResult?.changeCount ?? 0) > 0) {
    return 'changed';
  }

  return 'passed';
}

function resolveChromaticCheckConclusion(diffOutcome) {
  switch (diffOutcome) {
    case 'passed':
      return 'success';
    case 'changed':
      return 'neutral';
    case 'deferred':
      return 'skipped';
    default:
      return 'failure';
  }
}

function resolveChromaticExitCode({ diffOutcome, providerResult }) {
  if (diffOutcome === 'failed') {
    return providerResult?.code && providerResult.code !== 0 ? providerResult.code : 1;
  }

  return 0;
}

function resolveChromaticBranchName(env, cwd) {
  const branchName = env.GITHUB_HEAD_REF?.trim() || env.GITHUB_REF_NAME?.trim();
  if (branchName) {
    return branchName;
  }

  return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  }).trim();
}

function resolveChromaticGitSha(env, cwd) {
  const gitSha = env.GITHUB_SHA?.trim();
  if (gitSha) {
    return gitSha;
  }

  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  }).trim();
}
