export const reusableComponentStatusContractVersion = '2';

export const reusableComponentStatusRootFields = Object.freeze([
  'statusVersion',
  'generatedAt',
  'changeClass',
  'railSummaries',
  'claimProfiles',
  'highestEarnedClaim',
  'reasonCodes',
  'enforcementMode',
]);

export const reusableComponentStatusChangeClasses = Object.freeze([
  'reusable-component-advancement',
  'token-only',
  'docs-only',
  'proof-only',
  'other',
]);

export const reusableComponentStatusRailKeys = Object.freeze(['ct8b', 'ct9b', 'ct10b']);

export const reusableComponentStatusRailSummaryFields = Object.freeze([
  'contractId',
  'threadId',
  'sourcePath',
  'sourceVersionOrRevision',
  'freshness',
  'outcome',
  'claimRelevant',
]);

export const reusableComponentStatusFreshnessValues = Object.freeze([
  'current',
  'stale',
  'missing',
]);

export const reusableComponentStatusRailOutcomeValues = Object.freeze([
  'satisfied',
  'unsatisfied',
  'deferred',
  'not-applicable',
]);

export const reusableComponentStatusEnforcementModes = Object.freeze(['informational', 'blocking']);

export const reusableComponentStatusHighestEarnedClaimFields = Object.freeze([
  'profileId',
  'claimId',
]);

export const reusableComponentStatusAllowedUpstreamFields = Object.freeze({
  ct8b: Object.freeze([
    'ledgerVersion',
    'artifact.revision',
    'promotion.parityMode',
    'promotion.highestEarnedLevel',
    'exceptions',
  ]),
  ct9b: Object.freeze([
    'storybook/story-inventory.json#inventoryVersion',
    'storybook/story-inventory.json#components[].componentId',
    'storybook/story-inventory.json#components[].implementedStoryRefs',
    'storybook/component-specs/<component-id>.json#componentId',
    'storybook/component-specs/<component-id>.json#tier',
    'storybook/component-specs/<component-id>.json#requiredStoryKinds',
    'storybook/component-specs/<component-id>.json#downstreamHooks',
    'artifacts/storybook/proof-coverage.json#proofCoverageVersion',
    'artifacts/storybook/proof-coverage.json#components[].status',
    'artifacts/storybook/proof-coverage.json#components[].requiredKinds',
    'artifacts/storybook/proof-coverage.json#components[].implementedKinds',
    'artifacts/storybook/proof-coverage.json#components[].missingKinds',
  ]),
  ct10b: Object.freeze([
    'review.mode',
    'review.requiredForClaim',
    'review.scope',
    'review.diffOutcome',
    'revision.gitSha',
    'generatedAt',
    'statusVersion',
  ]),
});

export const reusableComponentStatusClaimProfileMatrix = Object.freeze({
  'reusable-component-advancement': Object.freeze({
    changeClasses: Object.freeze(['reusable-component-advancement']),
    readsRails: Object.freeze(['ct8b', 'ct9b', 'ct10b']),
    enforcementMode: 'informational',
    informationalOnly: false,
    mayPromoteToBlockingInS3: true,
  }),
  'token-only': Object.freeze({
    changeClasses: Object.freeze(['token-only']),
    readsRails: Object.freeze(['ct8b']),
    enforcementMode: 'informational',
    informationalOnly: true,
    mayPromoteToBlockingInS3: false,
  }),
  'docs-only': Object.freeze({
    changeClasses: Object.freeze(['docs-only']),
    readsRails: Object.freeze(['ct9b']),
    enforcementMode: 'informational',
    informationalOnly: true,
    mayPromoteToBlockingInS3: false,
  }),
  'proof-only': Object.freeze({
    changeClasses: Object.freeze(['proof-only']),
    readsRails: Object.freeze(['ct9b', 'ct10b']),
    enforcementMode: 'informational',
    informationalOnly: true,
    mayPromoteToBlockingInS3: false,
  }),
  other: Object.freeze({
    changeClasses: Object.freeze(['other']),
    readsRails: Object.freeze([]),
    enforcementMode: 'informational',
    informationalOnly: true,
    mayPromoteToBlockingInS3: false,
  }),
});
