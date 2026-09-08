import fs from 'node:fs';
import path from 'node:path';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  defaultChromaticStatusMaxAgeMinutes,
  evaluateChromaticStatus,
} from './chromatic-status-validator.mjs';
import { readDsSkillsResult } from './ds-skills-cli.mjs';
import { validateComponentSpec } from './storybook-component-spec.mjs';
import {
  defaultStorybookProofCoveragePath,
  readStorybookProofCoverageReport,
} from './storybook-proof-coverage.mjs';
import {
  defaultStoryInventoryPath,
  loadAndValidateStoryInventory,
} from './storybook-story-inventory.mjs';
import {
  reusableComponentStatusChangeClasses,
  reusableComponentStatusClaimProfileMatrix,
  reusableComponentStatusContractVersion,
  reusableComponentStatusEnforcementModes,
  reusableComponentStatusFreshnessValues,
  reusableComponentStatusHighestEarnedClaimFields,
  reusableComponentStatusRailKeys,
  reusableComponentStatusRailOutcomeValues,
  reusableComponentStatusRailSummaryFields,
  reusableComponentStatusRootFields,
} from './reusable-component-status-contract.mjs';
import { formatJsonArtifact } from './prettier-json.mjs';

export const defaultReusableComponentStatusPath =
  'artifacts/harness/reusable-component-status.json';
export const defaultReusableComponentStatusChangeClass = 'reusable-component-advancement';
export const reusableComponentStatusRootDirEnvVar = 'REUSABLE_COMPONENT_STATUS_ROOT_DIR';
export const reusableComponentStatusTargetEnvVar = 'REUSABLE_COMPONENT_STATUS_TARGET';
export const reusableComponentStatusChangeClassEnvVar = 'REUSABLE_COMPONENT_STATUS_CHANGE_CLASS';
export const reusableComponentStatusMaxAgeMinutesEnvVar =
  'REUSABLE_COMPONENT_STATUS_MAX_AGE_MINUTES';

const defaultComponentSpecsDir = 'storybook/component-specs';
const unavailableSourceVersion = 'unavailable';

// The two inputs the CT-8B rail reads, as paths passed to the CLI rather than
// files opened here. They match the `validate:sync-ledger` script exactly; the
// same ledger and the same profile answer both callers.
const defaultSyncLedgerPath = 'src/figma/sync-ledger.json';
const defaultRailProfilePath = '.agents/skills/profiles/collider.json';

export function createReusableComponentStatus(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const changeClass = normalizeChangeClass(
    options.changeClass ?? defaultReusableComponentStatusChangeClass
  );
  const now = normalizeNow(options.now);
  const chromaticStatusMaxAgeMinutes = normalizeMaxAgeMinutes(options.chromaticStatusMaxAgeMinutes);
  const claimProfile = reusableComponentStatusClaimProfileMatrix[changeClass];
  const relevantRails = new Set(claimProfile.readsRails);

  const ct8b = summarizeCt8b({
    claimRelevant: relevantRails.has('ct8b'),
    rootDir,
  });
  const ct9b = summarizeCt9b({
    claimRelevant: relevantRails.has('ct9b'),
    rootDir,
  });
  const ct10b = summarizeCt10b({
    claimRelevant: relevantRails.has('ct10b'),
    chromaticStatusMaxAgeMinutes,
    now,
    rootDir,
  });
  const ct11b = summarizeCt11b({
    claimRelevant: relevantRails.has('ct11b'),
    rootDir,
  });

  const highestEarnedClaim = determineHighestEarnedClaim(changeClass, {
    ct8b,
    ct9b,
    ct10b,
    ct11b,
  });
  const reasonCodes = collectReasonCodes(changeClass, highestEarnedClaim.claimId, [
    ct8b,
    ct9b,
    ct10b,
    ct11b,
  ]);

  return {
    statusVersion: reusableComponentStatusContractVersion,
    generatedAt: now.toISOString(),
    changeClass,
    railSummaries: {
      ct8b: ct8b.summary,
      ct9b: ct9b.summary,
      ct10b: ct10b.summary,
      ct11b: ct11b.summary,
    },
    claimProfiles: cloneJson(reusableComponentStatusClaimProfileMatrix),
    highestEarnedClaim,
    reasonCodes,
    enforcementMode: claimProfile.enforcementMode,
  };
}

export async function writeReusableComponentStatus(status, options = {}) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const target = options.target ?? defaultReusableComponentStatusPath;
  const absPath = path.isAbsolute(target) ? target : path.resolve(rootDir, target);
  const formatted = await formatJsonArtifact(status, absPath);

  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, formatted);
  return absPath;
}

export function readReusableComponentStatusArtifact(
  target = defaultReusableComponentStatusPath,
  options = {}
) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const absPath = path.isAbsolute(target) ? target : path.resolve(rootDir, target);
  return {
    absPath,
    data: JSON.parse(fs.readFileSync(absPath, 'utf8')),
  };
}

export function validateReusableComponentStatusArtifact(data) {
  const errors = [];
  if (!isPlainObject(data)) {
    return ['[CT-12B_STATUS_INVALID_ROOT] status payload must be a JSON object'];
  }

  validateExactKeys(errors, data, reusableComponentStatusRootFields, 'status');
  requireLiteral(
    errors,
    data.statusVersion,
    reusableComponentStatusContractVersion,
    'statusVersion'
  );
  requireEnum(errors, data.changeClass, reusableComponentStatusChangeClasses, 'changeClass');
  requireUtcTimestamp(errors, data.generatedAt, 'generatedAt');
  requireEnum(
    errors,
    data.enforcementMode,
    reusableComponentStatusEnforcementModes,
    'enforcementMode'
  );

  if (
    !Array.isArray(data.reasonCodes) ||
    data.reasonCodes.some((value) => typeof value !== 'string')
  ) {
    errors.push('[CT-12B_STATUS_INVALID_REASON_CODES] reasonCodes must be an array of strings');
  }

  validateRailSummaries(errors, data.railSummaries);
  if (
    JSON.stringify(data.claimProfiles) !== JSON.stringify(reusableComponentStatusClaimProfileMatrix)
  ) {
    errors.push(
      '[CT-12B_STATUS_INVALID_CLAIM_PROFILES] claimProfiles must equal the frozen S1 matrix'
    );
  }
  validateHighestEarnedClaim(errors, data.highestEarnedClaim);

  return errors;
}

/**
 * The CT-8B rail of this report, and only the mapping to it.
 *
 * The evaluation — freshness, outcome, reason codes — comes from
 * `ds-skills ledger validate --json`; this function opens neither the ledger nor
 * the proof. What stays here is `claimRelevant`, which is a product policy about
 * whether CT-8B applies to a given change class, not a rail question: the CLI
 * answers "if the rail applies, what does it say?" and this decides whether it
 * applies.
 */
function summarizeCt8b(context) {
  const base = createSummaryBase('CT-8B', 'THR-05', defaultSyncLedgerPath, context.claimRelevant);
  const read = readDsSkillsResult(
    ['ledger', 'validate', '--ledger', defaultSyncLedgerPath, '--profile', defaultRailProfilePath],
    { cwd: context.rootDir }
  );
  // An unavailable CLI, an unreadable ledger and an unparseable result are all
  // "no answer", and all report as errored — never as a satisfied rail.
  if (!read.ok || read.result.rail === null) {
    return buildErroredRail(base, read);
  }

  const { rail } = read.result;
  return buildRail(base, {
    freshness: rail.freshness,
    outcome: context.claimRelevant ? rail.outcome : 'not-applicable',
    sourceVersionOrRevision: rail.sourceVersionOrRevision,
    reasonCodes: context.claimRelevant ? rail.reasonCodes : [],
  });
}

function summarizeCt9b(context) {
  const base = createSummaryBase(
    'CT-9B',
    'THR-08',
    defaultStorybookProofCoveragePath,
    context.claimRelevant
  );
  const inventory = readJsonWithValidation(() =>
    loadAndValidateStoryInventory(path.resolve(context.rootDir, defaultStoryInventoryPath))
  );
  const proofCoverage = readJsonWithValidation(() =>
    readStorybookProofCoverageReport(defaultStorybookProofCoveragePath, {
      rootDir: context.rootDir,
    })
  );
  if (!inventory.ok || !proofCoverage.ok) {
    return buildErroredRail(base, inventory.ok ? proofCoverage : inventory, 'ct9b-proof-missing');
  }

  const specErrors = [];
  for (const component of inventory.data.data.components) {
    const specPath = path.resolve(
      context.rootDir,
      defaultComponentSpecsDir,
      `${component.componentId}.json`
    );
    try {
      const parsed = JSON.parse(fs.readFileSync(specPath, 'utf8'));
      specErrors.push(...validateComponentSpec(parsed, { filenameStem: component.componentId }));
    } catch (error) {
      specErrors.push(
        `[CT-9B_COMPONENT_SPEC_READ_FAILED] componentId "${component.componentId}" could not read ${specPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  const report = proofCoverage.data.data;
  const freshness = 'current';
  const outcome = !context.claimRelevant
    ? 'not-applicable'
    : specErrors.length > 0 ||
        !Array.isArray(report.components) ||
        report.summary?.failingCount > 0 ||
        report.components.some((component) => component.status !== 'ready')
      ? 'unsatisfied'
      : 'satisfied';
  return buildRail(base, {
    freshness,
    outcome,
    sourceVersionOrRevision: `inventoryVersion:${inventory.data.data.inventoryVersion}|proofCoverageVersion:${report.proofCoverageVersion ?? unavailableSourceVersion}`,
    reasonCodes: !context.claimRelevant
      ? []
      : specErrors.length > 0
        ? ['ct9b-proof-invalid']
        : outcome === 'unsatisfied'
          ? ['ct9b-proof-coverage-missing']
          : [],
  });
}

function summarizeCt10b(context) {
  const base = createSummaryBase(
    'CT-10B',
    'THR-06',
    'artifacts/chromatic/status.json',
    context.claimRelevant
  );
  const status = readJsonWithValidation(() => {
    const absPath = path.resolve(context.rootDir, 'artifacts/chromatic/status.json');
    return { absPath, data: JSON.parse(fs.readFileSync(absPath, 'utf8')) };
  });
  if (!status.ok) {
    return buildErroredRail(base, status, 'ct10b-review-missing');
  }

  const structural = evaluateChromaticStatus(status.data.data, {
    maxAgeMinutes: Number.MAX_SAFE_INTEGER,
    now: context.now,
  });
  const freshnessEval = evaluateChromaticStatus(status.data.data, {
    maxAgeMinutes: context.chromaticStatusMaxAgeMinutes,
    now: context.now,
  });
  const freshness = freshnessEval.errors.some((error) =>
    error.includes('[CT-10B_CHROMATIC_STATUS_STALE]')
  )
    ? 'stale'
    : 'current';
  const reviewRequiredForClaim = status.data.data.review.requiredForClaim === true;
  const outcome = !context.claimRelevant
    ? 'not-applicable'
    : !structural.ok
      ? 'unsatisfied'
      : status.data.data.review.diffOutcome === 'deferred'
        ? 'deferred'
        : ['passed', 'changed'].includes(status.data.data.review.diffOutcome)
          ? 'satisfied'
          : 'unsatisfied';

  return buildRail(base, {
    freshness,
    outcome,
    sourceVersionOrRevision: `statusVersion:${status.data.data.statusVersion}|revision:${status.data.data.revision.gitSha}`,
    reasonCodes: !context.claimRelevant
      ? []
      : [
          reviewRequiredForClaim ? 'ct10b-review-claim-required' : 'ct10b-review-informational',
          ...(!structural.ok
            ? ['ct10b-review-invalid']
            : freshness === 'stale'
              ? ['ct10b-review-stale']
              : outcome === 'deferred'
                ? ['ct10b-review-deferred']
                : outcome === 'unsatisfied'
                  ? ['ct10b-review-not-yet-earned']
                  : []),
        ],
  });
}

function summarizeCt11b(context) {
  const base = createSummaryBase(
    'CT-11B',
    'THR-07',
    'artifacts/harness/reusable-component-mapping-status.json',
    context.claimRelevant
  );
  const mapping = readJsonWithValidation(() => {
    const absPath = path.resolve(
      context.rootDir,
      'artifacts/harness/reusable-component-mapping-status.json'
    );
    return { absPath, data: JSON.parse(fs.readFileSync(absPath, 'utf8')) };
  });
  if (!mapping.ok) {
    return buildErroredRail(base, mapping, 'ct11b-mapping-missing');
  }

  const summary = mapping.data.data.summary ?? {};
  const components = Array.isArray(mapping.data.data.components)
    ? mapping.data.data.components
    : [];
  const invalid = Number(summary.invalidCount ?? 0) > 0;
  const incomplete = Number(summary.incompleteCount ?? 0) > 0;
  // Code Connect is retired, so no component carries a mapping and this rail has
  // nothing to measure. An empty mapping used to read as `satisfied` — a check
  // reporting a pass it never performed. `not-applicable` says the rail is out of
  // play instead. The retirement is data-driven, not deleted: the moment a mapping
  // status carries components again, every branch below resumes on its own.
  const retired = Number(summary.componentCount ?? 0) === 0;
  const complete =
    retired || (Number(summary.completeCount ?? 0) > 0 && Number(summary.componentCount ?? 0) > 0);
  const stale = components.some((component) => component?.linkState === 'stale');
  const outcome = !context.claimRelevant
    ? 'not-applicable'
    : stale || invalid || incomplete || !complete
      ? 'unsatisfied'
      : retired
        ? 'not-applicable'
        : 'satisfied';

  return buildRail(base, {
    freshness: stale ? 'stale' : 'current',
    outcome,
    sourceVersionOrRevision: `mappingStatusVersion:${mapping.data.data.mappingStatusVersion ?? unavailableSourceVersion}`,
    reasonCodes: !context.claimRelevant
      ? []
      : stale
        ? ['ct11b-mapping-stale']
        : invalid
          ? ['ct11b-mapping-invalid']
          : incomplete || !complete
            ? ['ct11b-mapping-incomplete']
            : retired
              ? ['ct11b-mapping-retired']
              : [],
  });
}

function determineHighestEarnedClaim(changeClass, rails) {
  const proofReady = isCurrentSatisfied(rails.ct9b);
  const reviewReady = isCurrentSatisfied(rails.ct10b);
  // A rail that is out of play must not hold the ladder down the way a failing one
  // does. With Code Connect retired, treating ct11b's `not-applicable` as a failure
  // would pin the claim at `reusable-component-reviewed` forever — a rung whose name
  // says mapping is pending, when it is retired. `unsatisfied` still blocks.
  const mappingReady = isCurrentSatisfiedOrOutOfPlay(rails.ct11b);
  const paritySatisfied = isCurrentSatisfied(rails.ct8b);
  const parityDeferred =
    rails.ct8b.summary.freshness === 'current' && rails.ct8b.summary.outcome === 'deferred';

  switch (changeClass) {
    case 'reusable-component-advancement':
      if (!proofReady) {
        return { profileId: changeClass, claimId: 'reusable-component-informational' };
      }
      if (!reviewReady) {
        return { profileId: changeClass, claimId: 'reusable-component-proof-ready' };
      }
      if (!mappingReady) {
        return { profileId: changeClass, claimId: 'reusable-component-reviewed' };
      }
      if (paritySatisfied) {
        return { profileId: changeClass, claimId: 'reusable-component-parity-current' };
      }
      if (parityDeferred) {
        return { profileId: changeClass, claimId: 'reusable-component-status-baseline' };
      }
      return { profileId: changeClass, claimId: 'reusable-component-mapping-current' };
    case 'token-only':
      return {
        profileId: changeClass,
        claimId: isCurrentSatisfied(rails.ct8b)
          ? 'token-only-parity-current'
          : 'token-only-informational',
      };
    case 'docs-only':
      return {
        profileId: changeClass,
        claimId: proofReady ? 'docs-only-informational' : 'docs-only-pending-proof',
      };
    case 'proof-only':
      if (!proofReady) {
        return { profileId: changeClass, claimId: 'proof-only-pending-proof' };
      }
      return {
        profileId: changeClass,
        claimId: reviewReady ? 'proof-only-reviewed' : 'proof-only-informational',
      };
    default:
      return { profileId: changeClass, claimId: 'other-informational' };
  }
}

function collectReasonCodes(changeClass, claimId, rails) {
  const reasonCodes = [];
  for (const rail of rails) {
    if (rail.summary.claimRelevant) {
      reasonCodes.push(...rail.reasonCodes);
    }
  }
  if (changeClass === 'other') {
    reasonCodes.push('profile-out-of-scope');
  }
  if (
    changeClass === 'reusable-component-advancement' &&
    ['reusable-component-status-baseline', 'reusable-component-parity-current'].includes(claimId)
  ) {
    reasonCodes.push('consumer-policy-blocking-deferred');
  }
  return [...new Set(reasonCodes)];
}

function createSummaryBase(contractId, threadId, sourcePath, claimRelevant) {
  return { contractId, threadId, sourcePath, claimRelevant };
}

function buildRail(base, values) {
  return {
    summary: {
      ...base,
      sourceVersionOrRevision: values.sourceVersionOrRevision,
      freshness: values.freshness,
      outcome: values.outcome,
    },
    reasonCodes: values.reasonCodes,
  };
}

function buildErroredRail(base, result, missingCode = `${base.contractId.toLowerCase()}-missing`) {
  return buildRail(base, {
    freshness: 'missing',
    outcome: base.claimRelevant ? 'unsatisfied' : 'not-applicable',
    sourceVersionOrRevision: unavailableSourceVersion,
    reasonCodes: base.claimRelevant ? [missingCode] : [],
  });
}

function readJsonWithValidation(loader) {
  try {
    const loaded = loader();
    if (Array.isArray(loaded.errors) && loaded.errors.length > 0) {
      return { ok: false, errors: loaded.errors };
    }
    return { ok: true, data: loaded };
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

function validateRailSummaries(errors, railSummaries) {
  if (!isPlainObject(railSummaries)) {
    errors.push('[CT-12B_STATUS_INVALID_RAIL_SUMMARIES] railSummaries must be an object');
    return;
  }

  validateExactKeys(errors, railSummaries, reusableComponentStatusRailKeys, 'railSummaries');
  for (const railKey of reusableComponentStatusRailKeys) {
    const summary = railSummaries[railKey];
    if (!isPlainObject(summary)) {
      errors.push(
        `[CT-12B_STATUS_INVALID_RAIL_SUMMARY] railSummaries.${railKey} must be an object`
      );
      continue;
    }

    validateExactKeys(
      errors,
      summary,
      reusableComponentStatusRailSummaryFields,
      `railSummaries.${railKey}`
    );
    requireEnum(
      errors,
      summary.freshness,
      reusableComponentStatusFreshnessValues,
      `railSummaries.${railKey}.freshness`
    );
    requireEnum(
      errors,
      summary.outcome,
      reusableComponentStatusRailOutcomeValues,
      `railSummaries.${railKey}.outcome`
    );
  }
}

function validateHighestEarnedClaim(errors, value) {
  if (!isPlainObject(value)) {
    errors.push(
      '[CT-12B_STATUS_INVALID_HIGHEST_EARNED_CLAIM] highestEarnedClaim must be an object'
    );
    return;
  }

  validateExactKeys(
    errors,
    value,
    reusableComponentStatusHighestEarnedClaimFields,
    'highestEarnedClaim'
  );
  if (typeof value.profileId !== 'string' || value.profileId.length === 0) {
    errors.push(
      '[CT-12B_STATUS_INVALID_HIGHEST_EARNED_CLAIM] highestEarnedClaim.profileId must be a non-empty string'
    );
  }
  if (typeof value.claimId !== 'string' || value.claimId.length === 0) {
    errors.push(
      '[CT-12B_STATUS_INVALID_HIGHEST_EARNED_CLAIM] highestEarnedClaim.claimId must be a non-empty string'
    );
  }
}

function validateExactKeys(errors, value, allowedKeys, label) {
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...allowedKeys].sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    errors.push(
      `[CT-12B_STATUS_INVALID_KEYS] ${label} must have exactly: ${expectedKeys.join(', ')}`
    );
  }
}

function requireLiteral(errors, actual, expected, label) {
  if (actual !== expected) {
    errors.push(`[CT-12B_STATUS_INVALID_LITERAL] ${label} must be ${expected}`);
  }
}

function requireEnum(errors, actual, values, label) {
  if (!values.includes(actual)) {
    errors.push(`[CT-12B_STATUS_INVALID_ENUM] ${label} must be ${values.join(', ')}`);
  }
}

function requireUtcTimestamp(errors, actual, label) {
  if (typeof actual !== 'string' || Number.isNaN(Date.parse(actual)) || !actual.endsWith('Z')) {
    errors.push(`[CT-12B_STATUS_INVALID_TIMESTAMP] ${label} must be an ISO-8601 UTC timestamp`);
  }
}

function normalizeChangeClass(value) {
  if (typeof value !== 'string' || !reusableComponentStatusChangeClasses.includes(value)) {
    throw new Error(
      `[CT-12B_STATUS_INVALID_CHANGE_CLASS] changeClass must be one of ${reusableComponentStatusChangeClasses.join(', ')}`
    );
  }
  return value;
}

function normalizeMaxAgeMinutes(value) {
  if (value === undefined || value === null || value === '') {
    return defaultChromaticStatusMaxAgeMinutes;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `[CT-12B_STATUS_INVALID_MAX_AGE] ${reusableComponentStatusMaxAgeMinutesEnvVar} must be a non-negative integer`
    );
  }
  return parsed;
}

function normalizeNow(value) {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  return new Date();
}

function isCurrentSatisfied(rail) {
  return (
    rail.summary.claimRelevant &&
    rail.summary.freshness === 'current' &&
    rail.summary.outcome === 'satisfied'
  );
}

// `not-applicable` is not a pass — it means the rail has nothing to measure, and it
// stays visible as `not-applicable` in railSummaries so a reader can tell the two
// apart. It only stops the rail from blocking the claim ladder.
function isCurrentSatisfiedOrOutOfPlay(rail) {
  return (
    isCurrentSatisfied(rail) ||
    (rail.summary.freshness === 'current' && rail.summary.outcome === 'not-applicable')
  );
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
