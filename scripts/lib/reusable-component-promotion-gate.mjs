import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  createReusableComponentStatus,
  writeReusableComponentStatus,
} from './reusable-component-status.mjs';

export const reusableComponentPromotionUsage = 'Usage: pnpm govern:reusable-component-promotion';
export const reusableComponentPromotionConsumerEnvVar = 'REUSABLE_COMPONENT_PROMOTION_CONSUMER';
export const reusableComponentPromotionChangeClassEnvVar =
  'REUSABLE_COMPONENT_PROMOTION_CHANGE_CLASS';
export const reusableComponentPromotionEnforcementEnvVar =
  'REUSABLE_COMPONENT_PROMOTION_ENFORCEMENT';
export const reusableComponentPromotionRootDirEnvVar = 'REUSABLE_COMPONENT_PROMOTION_ROOT_DIR';
export const reusableComponentPromotionChangedFilesEnvVar = 'REUSABLE_COMPONENT_CHANGED_FILES';
export const reusableComponentPromotionSummaryEnvVar = 'GITHUB_STEP_SUMMARY';

export const reusableComponentPromotionConsumers = Object.freeze([
  'local',
  'ci',
  'handoff',
  'release',
]);
export const reusableComponentPromotionInputChangeClasses = Object.freeze([
  'reusable-component-advancement',
  'token-only',
  'docs-only',
  'proof-only',
  'other',
  'unknown',
]);
export const reusableComponentPromotionDecisionOutcomes = Object.freeze([
  'pass',
  'advisory',
  'block',
]);

export async function runReusableComponentPromotionGate(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const env = options.env ?? process.env;
  const rootDir = path.resolve(
    options.rootDir ?? env[reusableComponentPromotionRootDirEnvVar] ?? repoRoot
  );
  const consumer = normalizeConsumer(
    options.consumer ?? env[reusableComponentPromotionConsumerEnvVar] ?? 'local'
  );
  const requestedChangeClass = normalizeInputChangeClass(
    options.changeClass ?? env[reusableComponentPromotionChangeClassEnvVar] ?? 'unknown'
  );
  const requestedEnforcement = normalizeEnforcementMode(
    options.enforcementMode ?? env[reusableComponentPromotionEnforcementEnvVar] ?? null
  );
  const changedFiles = resolveChangedFiles({
    changedFiles: options.changedFiles,
    env,
    rootDir,
  });
  const recommendedChangeClass =
    requestedChangeClass === 'unknown'
      ? recommendChangeClassFromFiles(changedFiles)
      : requestedChangeClass;
  const status = createReusableComponentStatus({
    changeClass: recommendedChangeClass,
    chromaticStatusMaxAgeMinutes: options.chromaticStatusMaxAgeMinutes,
    now: options.now,
    rootDir,
  });
  const statusPath = await writeReusableComponentStatus(status, { rootDir });
  const decision = evaluateReusableComponentPromotionDecision(status, {
    changedFiles,
    consumer,
    requestedChangeClass,
    requestedEnforcement,
  });

  writeDecision(stdout, statusPath, decision);
  const summaryPath = env[reusableComponentPromotionSummaryEnvVar];
  if (typeof summaryPath === 'string' && summaryPath.length > 0) {
    fs.appendFileSync(summaryPath, `${formatDecisionSummary(decision)}\n`);
  }

  if (decision.outcome === 'block') {
    for (const reason of decision.blockingReasons) {
      writeLine(stderr, `[CT-12B_PROMOTION_BLOCKED] ${reason}`);
    }
    return 1;
  }

  return 0;
}

export async function runReusableComponentPromotionGateCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  if (args.length > 0) {
    writeLine(options.stderr ?? process.stderr, reusableComponentPromotionUsage);
    return 1;
  }

  try {
    return await runReusableComponentPromotionGate(options);
  } catch (error) {
    writeLine(
      options.stderr ?? process.stderr,
      `[UNEXPECTED_RUNTIME_FAILURE] ${error instanceof Error ? error.message : String(error)}`
    );
    return 3;
  }
}

export function evaluateReusableComponentPromotionDecision(status, options = {}) {
  const consumer = normalizeConsumer(options.consumer ?? 'local');
  const requestedChangeClass = normalizeInputChangeClass(
    options.requestedChangeClass ?? status.changeClass
  );
  const requestedEnforcement = normalizeEnforcementMode(options.requestedEnforcement ?? null);
  const changedFiles = normalizeChangedFiles(options.changedFiles ?? []);
  const recommendedChangeClass =
    requestedChangeClass === 'unknown'
      ? recommendChangeClassFromFiles(changedFiles)
      : requestedChangeClass;
  const changeClassSource = requestedChangeClass === 'unknown' ? 'heuristic' : 'explicit';
  const blockingAllowed =
    consumer !== 'local' &&
    consumer !== 'handoff' &&
    recommendedChangeClass === 'reusable-component-advancement' &&
    changeClassSource === 'explicit';
  const defaultEnforcementMode =
    blockingAllowed && consumer !== 'release' ? 'blocking' : 'advisory';
  const enforcementMode =
    requestedEnforcement === 'blocking' && !blockingAllowed
      ? 'advisory'
      : (requestedEnforcement ??
        (consumer === 'release' && blockingAllowed ? 'blocking' : defaultEnforcementMode));
  const advisoryReasons = [];
  const blockingReasons = [];
  const reasonCodes = new Set(status.reasonCodes);
  const rails = status.railSummaries;

  if (changeClassSource === 'heuristic') {
    advisoryReasons.push(`change-class-heuristic:${recommendedChangeClass}`);
  }
  if (requestedEnforcement === 'blocking' && enforcementMode !== 'blocking') {
    advisoryReasons.push('consumer-policy-blocking-disallowed');
  }
  if (!blockingAllowed) {
    advisoryReasons.push('consumer-policy-advisory-only');
  }

  if (recommendedChangeClass === 'reusable-component-advancement') {
    if (!isRailCurrentSatisfied(rails.ct9b)) {
      blockingReasons.push(...collectBlockingReason('proof', rails.ct9b));
    }
    if (reasonCodes.has('ct10b-review-claim-required')) {
      if (!isRailCurrentSatisfied(rails.ct10b)) {
        blockingReasons.push(...collectBlockingReason('review', rails.ct10b));
      }
    } else if (rails.ct10b.claimRelevant) {
      advisoryReasons.push('ct10b-review-informational');
    }
    if (!isRailCurrentSatisfied(rails.ct11b)) {
      blockingReasons.push(...collectBlockingReason('mapping', rails.ct11b));
    }
    if (consumer === 'release') {
      if (!isRailCurrentSatisfied(rails.ct8b)) {
        blockingReasons.push(...collectBlockingReason('parity', rails.ct8b));
      }
    } else if (rails.ct8b.claimRelevant && status.reasonCodes.includes('ct8b-parity-deferred')) {
      advisoryReasons.push('ct8b-parity-deferred');
    }
  }

  const outcome =
    enforcementMode === 'blocking' && blockingReasons.length > 0
      ? 'block'
      : advisoryReasons.length > 0 || blockingReasons.length > 0
        ? 'advisory'
        : 'pass';

  return {
    advisoryReasons: uniqueStrings(advisoryReasons),
    blockingReasons: uniqueStrings(blockingReasons),
    changedFiles,
    changeClassSource,
    consumer,
    effectiveChangeClass: recommendedChangeClass,
    enforcementMode,
    highestEarnedClaim: status.highestEarnedClaim,
    outcome,
    reasonCodes: [...status.reasonCodes],
    requestedChangeClass,
  };
}

export function recommendChangeClassFromFiles(changedFiles) {
  const files = normalizeChangedFiles(changedFiles);
  if (files.length === 0) {
    return 'other';
  }

  const categories = new Set();
  for (const file of files) {
    if (isReusableComponentPath(file)) {
      categories.add('reusable-component-advancement');
      continue;
    }
    if (isProofPath(file)) {
      categories.add('proof-only');
      continue;
    }
    if (isTokenPath(file)) {
      categories.add('token-only');
      continue;
    }
    if (isDocsPath(file)) {
      categories.add('docs-only');
      continue;
    }
    categories.add('other');
  }

  if (categories.has('reusable-component-advancement')) {
    return 'reusable-component-advancement';
  }
  if (categories.size === 1) {
    return [...categories][0];
  }
  return 'other';
}

function collectBlockingReason(label, rail) {
  if (rail.freshness === 'stale') {
    return [`${label}-rail-stale`];
  }
  if (rail.freshness === 'missing') {
    return [`${label}-rail-missing`];
  }
  if (rail.outcome === 'deferred') {
    return [`${label}-rail-deferred`];
  }
  return [`${label}-rail-unsatisfied`];
}

function resolveChangedFiles(options) {
  if (Array.isArray(options.changedFiles)) {
    return normalizeChangedFiles(options.changedFiles);
  }

  const envValue = options.env?.[reusableComponentPromotionChangedFilesEnvVar];
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return normalizeChangedFiles(envValue.split(/\r?\n|,/u));
  }

  for (const args of [
    ['status', '--porcelain'],
    ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'],
  ]) {
    try {
      const output = execFileSync('git', args, {
        cwd: options.rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (output.length === 0) {
        continue;
      }
      if (args[0] === 'status') {
        return normalizeChangedFiles(
          output
            .split('\n')
            .map((line) => line.slice(3).trim())
            .filter(Boolean)
        );
      }
      return normalizeChangedFiles(output.split('\n'));
    } catch {
      continue;
    }
  }

  return [];
}

function formatDecisionSummary(decision) {
  const lines = [
    '### Reusable Component Promotion',
    `- Consumer: \`${decision.consumer}\``,
    `- Requested change class: \`${decision.requestedChangeClass}\``,
    `- Effective change class: \`${decision.effectiveChangeClass}\` (${decision.changeClassSource})`,
    `- Enforcement mode: \`${decision.enforcementMode}\``,
    `- Decision: \`${decision.outcome}\``,
    `- Highest earned claim: \`${decision.highestEarnedClaim.profileId}/${decision.highestEarnedClaim.claimId}\``,
  ];
  if (decision.blockingReasons.length > 0) {
    lines.push(`- Blocking reasons: \`${decision.blockingReasons.join('`, `')}\``);
  }
  if (decision.advisoryReasons.length > 0) {
    lines.push(`- Advisory reasons: \`${decision.advisoryReasons.join('`, `')}\``);
  }
  return lines.join('\n');
}

function writeDecision(stream, statusPath, decision) {
  writeLine(stream, `✓ Reusable component promotion status written: ${statusPath}`);
  writeLine(stream, `Consumer: ${decision.consumer}`);
  writeLine(
    stream,
    `Change class: ${decision.requestedChangeClass} -> ${decision.effectiveChangeClass} (${decision.changeClassSource})`
  );
  writeLine(stream, `Enforcement mode: ${decision.enforcementMode}`);
  writeLine(
    stream,
    `Highest earned claim: ${decision.highestEarnedClaim.profileId}/${decision.highestEarnedClaim.claimId}`
  );
  writeLine(stream, `Decision: ${decision.outcome}`);
  if (decision.advisoryReasons.length > 0) {
    writeLine(stream, `Advisory reasons: ${decision.advisoryReasons.join(', ')}`);
  }
  if (decision.blockingReasons.length > 0) {
    writeLine(stream, `Blocking reasons: ${decision.blockingReasons.join(', ')}`);
  }
}

function normalizeConsumer(value) {
  if (!reusableComponentPromotionConsumers.includes(value)) {
    throw new Error(
      `[CT-12B_PROMOTION_INVALID_CONSUMER] consumer must be one of ${reusableComponentPromotionConsumers.join(', ')}`
    );
  }
  return value;
}

function normalizeInputChangeClass(value) {
  if (!reusableComponentPromotionInputChangeClasses.includes(value)) {
    throw new Error(
      `[CT-12B_PROMOTION_INVALID_CHANGE_CLASS] changeClass must be one of ${reusableComponentPromotionInputChangeClasses.join(', ')}`
    );
  }
  return value;
}

function normalizeEnforcementMode(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (!['advisory', 'blocking'].includes(value)) {
    throw new Error(
      `[CT-12B_PROMOTION_INVALID_ENFORCEMENT] enforcement must be advisory or blocking`
    );
  }
  return value;
}

function normalizeChangedFiles(changedFiles) {
  return uniqueStrings(
    changedFiles
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
  );
}

function isRailCurrentSatisfied(rail) {
  return rail.freshness === 'current' && rail.outcome === 'satisfied';
}

function isDocsPath(file) {
  return file.endsWith('.md') || file.endsWith('.mdx');
}

function isTokenPath(file) {
  return (
    file.startsWith('design-tokens/src/tokens/') ||
    file.startsWith('src/lib/tokens/') ||
    file.startsWith('src/figma/')
  );
}

function isProofPath(file) {
  return (
    file.startsWith('storybook/stories/') ||
    file === 'storybook/story-inventory.json' ||
    file === 'storybook/component-tier-policy.json' ||
    file === 'artifacts/storybook/proof-coverage.json'
  );
}

function isReusableComponentPath(file) {
  return (
    file.startsWith('storybook/component-specs/') ||
    file.startsWith('storybook/connect/') ||
    file.startsWith('figma/code-connect/') ||
    file.startsWith('design-tokens/src/recipes/') ||
    file === 'artifacts/harness/reusable-component-mapping-status.json' ||
    file === 'artifacts/harness/reusable-component-status.json' ||
    file.includes('reusable-component-promotion') ||
    file.includes('reusable-component-status')
  );
}

function uniqueStrings(values) {
  return [...new Set(values)];
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
