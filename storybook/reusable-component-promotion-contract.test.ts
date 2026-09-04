import { describe, expect, it } from 'vitest';

import chromaticStatus from '../artifacts/chromatic/status.json';
import reusableComponentMappingStatus from '../artifacts/harness/reusable-component-mapping-status.json';
import proofCoverage from '../artifacts/storybook/proof-coverage.json';
import syncLedger from '../src/figma/sync-ledger.json';
import reusableComponentStatusReusableFixture from '../scripts/fixtures/reusable-component-status/valid-reusable-component-status.json';
import reusableComponentStatusProofOnlyFixture from '../scripts/fixtures/reusable-component-status/valid-proof-only-status.json';
import reusableComponentStatusTokenOnlyFixture from '../scripts/fixtures/reusable-component-status/valid-token-only-status.json';
import contractDoc from './reusable-component-promotion-contract.md?raw';
import policyDoc from './reusable-component-promotion-policy.md?raw';
import storyInventory from './story-inventory.json';
import {
  reusableComponentStatusAllowedUpstreamFields,
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
} from '../scripts/lib/reusable-component-status-contract.mjs';

const fixtureStatuses = [
  reusableComponentStatusReusableFixture,
  reusableComponentStatusTokenOnlyFixture,
  reusableComponentStatusProofOnlyFixture,
] as const;

describe('reusable component promotion contract docs', () => {
  it('pins the exact CT-12B root keys, rail summaries, and upstream boundaries', () => {
    expect(contractDoc).toContain('`storybook/reusable-component-promotion-contract.md`');
    expect(contractDoc).toContain('`artifacts/harness/reusable-component-status.json`');
    expect(contractDoc).toContain('must be a JSON object with exactly these top-level keys');
    for (const field of reusableComponentStatusRootFields) {
      expect(contractDoc).toContain(`\`${field}\``);
    }
    for (const changeClass of reusableComponentStatusChangeClasses) {
      expect(contractDoc).toContain(`\`${changeClass}\``);
    }
    for (const railKey of reusableComponentStatusRailKeys) {
      expect(contractDoc).toContain(`\`${railKey}\``);
    }
    for (const field of reusableComponentStatusRailSummaryFields) {
      expect(contractDoc).toContain(`\`${field}\``);
    }
    expect(contractDoc).toContain('`CT-12B` may consume only these repo-owned `CT-8B` fields');
    expect(contractDoc).toContain('`promotion.highestEarnedLevel`');
    expect(contractDoc).toContain('`CT-12B` may consume only these repo-owned `CT-10B` fields');
    expect(contractDoc).toContain('`review.requiredForClaim`');
    expect(contractDoc).toContain('`CT-12B` may consume only these repo-owned `CT-11B` surfaces');
    expect(contractDoc).toContain('may not copy raw upstream payloads into `railSummaries`');
    expect(contractDoc).toContain('may not infer proof readiness from story existence alone');
    expect(contractDoc).toContain('may not re-decide `review.requiredForClaim`');
  });

  it('pins the S3 consumer policy while keeping non-reusable profiles advisory', () => {
    expect(policyDoc).toContain('`reusable-component-advancement` is the only profile');
    expect(policyDoc).toContain('`token-only` stays on a narrower informational profile');
    expect(policyDoc).toContain('`docs-only` stays on a narrower informational profile');
    expect(policyDoc).toContain('`proof-only` stays on a narrower informational profile');
    expect(policyDoc).toContain('`other` stays on an explicit catch-all informational profile');
    expect(policyDoc).toContain('`review.requiredForClaim` is consumed from `CT-10B`');
    expect(policyDoc).toContain(
      'Mapping is a current upstream input because `THR-07` is published'
    );
    expect(policyDoc).toContain(
      '`ci` may block only when the requested change class is explicitly `reusable-component-advancement`.'
    );
    expect(policyDoc).toContain('`unknown` is allowed only as an advisory input.');
    expect(policyDoc).toContain('`local` is advisory-only.');
    expect(policyDoc).toContain('Do not treat mapping as deferred planning-only input');
  });
});

describe('reusable component promotion contract module', () => {
  it('exports the frozen field inventories and enums', () => {
    expect(reusableComponentStatusContractVersion).toBe('1');
    expect(reusableComponentStatusRootFields).toEqual([
      'statusVersion',
      'generatedAt',
      'changeClass',
      'railSummaries',
      'claimProfiles',
      'highestEarnedClaim',
      'reasonCodes',
      'enforcementMode',
    ]);
    expect(reusableComponentStatusChangeClasses).toEqual([
      'reusable-component-advancement',
      'token-only',
      'docs-only',
      'proof-only',
      'other',
    ]);
    expect(reusableComponentStatusRailKeys).toEqual(['ct8b', 'ct9b', 'ct10b', 'ct11b']);
    expect(reusableComponentStatusRailSummaryFields).toEqual([
      'contractId',
      'threadId',
      'sourcePath',
      'sourceVersionOrRevision',
      'freshness',
      'outcome',
      'claimRelevant',
    ]);
    expect(reusableComponentStatusFreshnessValues).toEqual(['current', 'stale', 'missing']);
    expect(reusableComponentStatusRailOutcomeValues).toEqual([
      'satisfied',
      'unsatisfied',
      'deferred',
      'not-applicable',
    ]);
    expect(reusableComponentStatusEnforcementModes).toEqual(['informational', 'blocking']);
    expect(reusableComponentStatusHighestEarnedClaimFields).toEqual(['profileId', 'claimId']);
  });

  it('freezes the allowed upstream field-consumption boundaries', () => {
    expect(reusableComponentStatusAllowedUpstreamFields.ct8b).toEqual([
      'ledgerVersion',
      'artifact.revision',
      'promotion.parityMode',
      'promotion.highestEarnedLevel',
      'exceptions',
    ]);
    expect(reusableComponentStatusAllowedUpstreamFields.ct9b).toContain(
      'artifacts/storybook/proof-coverage.json#proofCoverageVersion'
    );
    expect(reusableComponentStatusAllowedUpstreamFields.ct10b).toEqual([
      'review.mode',
      'review.requiredForClaim',
      'review.scope',
      'review.diffOutcome',
      'revision.gitSha',
      'generatedAt',
      'statusVersion',
    ]);
    expect(reusableComponentStatusAllowedUpstreamFields.ct11b).toContain(
      'artifacts/harness/reusable-component-mapping-status.json#mappingStatusVersion'
    );
    expect(reusableComponentStatusAllowedUpstreamFields.ct11b).toContain(
      'storybook/reusable-component-mapping-contract.md#shared-field-boundary'
    );
  });

  it('freezes the claim-profile matrix and keeps non-reusable profiles narrow', () => {
    expect(reusableComponentStatusClaimProfileMatrix).toEqual({
      'reusable-component-advancement': {
        changeClasses: ['reusable-component-advancement'],
        readsRails: ['ct8b', 'ct9b', 'ct10b', 'ct11b'],
        enforcementMode: 'informational',
        informationalOnly: false,
        mayPromoteToBlockingInS3: true,
      },
      'token-only': {
        changeClasses: ['token-only'],
        readsRails: ['ct8b'],
        enforcementMode: 'informational',
        informationalOnly: true,
        mayPromoteToBlockingInS3: false,
      },
      'docs-only': {
        changeClasses: ['docs-only'],
        readsRails: ['ct9b'],
        enforcementMode: 'informational',
        informationalOnly: true,
        mayPromoteToBlockingInS3: false,
      },
      'proof-only': {
        changeClasses: ['proof-only'],
        readsRails: ['ct9b', 'ct10b'],
        enforcementMode: 'informational',
        informationalOnly: true,
        mayPromoteToBlockingInS3: false,
      },
      other: {
        changeClasses: ['other'],
        readsRails: [],
        enforcementMode: 'informational',
        informationalOnly: true,
        mayPromoteToBlockingInS3: false,
      },
    });
    expect(reusableComponentStatusClaimProfileMatrix['token-only'].readsRails).not.toEqual(
      reusableComponentStatusClaimProfileMatrix['reusable-component-advancement'].readsRails
    );
    expect(reusableComponentStatusClaimProfileMatrix['proof-only'].readsRails).toEqual([
      'ct9b',
      'ct10b',
    ]);
  });
});

describe('reusable component promotion contract fixtures', () => {
  it('accepts the committed fixtures against the frozen contract baseline', () => {
    for (const fixture of fixtureStatuses) {
      validatePromotionStatusFixture(fixture);
    }
  });

  it('keeps non-reusable fixtures informational-only and mapping current in the reusable profile', () => {
    expect(reusableComponentStatusTokenOnlyFixture.enforcementMode).toBe('informational');
    expect(
      reusableComponentStatusTokenOnlyFixture.claimProfiles['token-only'].informationalOnly
    ).toBe(true);
    expect(reusableComponentStatusProofOnlyFixture.enforcementMode).toBe('informational');
    expect(reusableComponentStatusProofOnlyFixture.claimProfiles['proof-only'].readsRails).toEqual([
      'ct9b',
      'ct10b',
    ]);
    expect(reusableComponentStatusReusableFixture.railSummaries.ct11b.freshness).toBe('current');
    // Code Connect is retired, so the mapping rail has nothing to measure. It reports
    // `not-applicable` rather than `satisfied` — an empty mapping is not a passed check.
    expect(reusableComponentStatusReusableFixture.railSummaries.ct11b.outcome).toBe(
      'not-applicable'
    );
    expect(reusableComponentStatusReusableFixture.reasonCodes).toContain('ct11b-mapping-retired');
  });
});

describe('reusable component promotion cross-contract provenance', () => {
  it('can derive repo-owned provenance markers from the current committed upstream artifacts', () => {
    const ct8bMarker = `ledgerVersion:${syncLedger.ledgerVersion}|artifactRevision:${syncLedger.artifact.revision}`;
    const ct9bMarker = `inventoryVersion:${storyInventory.inventoryVersion}|proofCoverageVersion:${proofCoverage.proofCoverageVersion}`;
    const ct10bMarker = `statusVersion:${chromaticStatus.statusVersion}|revision:${chromaticStatus.revision.gitSha}`;
    const ct11bMarker = `mappingStatusVersion:${reusableComponentMappingStatus.mappingStatusVersion}`;

    expect(ct8bMarker).toBe(
      'ledgerVersion:2|artifactRevision:dc97a2671dbcc6e2a71873042566f4937b766d9d'
    );
    expect(ct9bMarker).toBe('inventoryVersion:1|proofCoverageVersion:1');
    expect(ct10bMarker).toBe('statusVersion:1|revision:0244cbdf98aa95ccba0ff0f842bf6aa59cada849');
    expect(ct11bMarker).toBe('mappingStatusVersion:1');
  });

  it('uses current repo-owned proof and mapping surfaces instead of prose-only assumptions', () => {
    // Story inventory preserves Stage-2 loop order: Message (primitive), Reasoning
    // (interactive), CodeBlock (primitive), then Tool (interactive).
    expect(storyInventory.components.map((component) => component.componentId)).toEqual([
      'message',
      'reasoning',
      'code-block',
      'tool',
      'sources',
      'task',
      'chain-of-thought',
      'suggestion',
      'inline-citation',
      'context',
      'prompt-input',
      'snippet',
      'image',
      'open-in-chat',
      'artifact',
      'web-preview',
      'confirmation',
      'plan',
      'attachments',
      'agent',
      'queue',
      'checkpoint',
      'package-info',
      'environment-variables',
      'test-results',
      'file-tree',
      'schema-display',
      'commit',
      'stack-trace',
      'jsx-preview',
      'terminal',
      'sandbox',
      'badge',
    ]);
    // Proof coverage is generated in componentId-sorted order.
    expect(proofCoverage.components.map((component) => component.componentId)).toEqual([
      'agent',
      'artifact',
      'attachments',
      'badge',
      'chain-of-thought',
      'checkpoint',
      'code-block',
      'commit',
      'confirmation',
      'context',
      'environment-variables',
      'file-tree',
      'image',
      'inline-citation',
      'jsx-preview',
      'message',
      'open-in-chat',
      'package-info',
      'plan',
      'prompt-input',
      'queue',
      'reasoning',
      'sandbox',
      'schema-display',
      'snippet',
      'sources',
      'stack-trace',
      'suggestion',
      'task',
      'terminal',
      'test-results',
      'tool',
      'web-preview',
    ]);
    // The chromatic review scope is derived from the same inventory, so the two
    // must agree exactly. Asserting containment of a single id let the artifact
    // keep naming a component the inventory no longer had.
    expect(chromaticStatus.review.scope.componentIds).toEqual(
      storyInventory.components.map((component) => component.componentId)
    );
    expect(Object.keys(chromaticStatus.review.scope.componentTiers).sort()).toEqual(
      storyInventory.components.map((component) => component.componentId).sort()
    );
    // The Chromatic project is real and CI does publish to it — 20 builds went up
    // between 2026-03-21 and 2026-03-24. None covered these components: the review
    // job resolves the proof scope before it publishes, and that scope has thrown
    // CHROMATIC_REVIEW_EMPTY_SCOPE since 96d5c39, so nothing has reached Chromatic
    // since 24 Mar. The artifact records that deferral rather than carrying the
    // March pilot's verdict forward over a component set Chromatic has never seen.
    expect(chromaticStatus.review.diffOutcome).toBe('deferred');
    expect(chromaticStatus.check.conclusion).toBe('skipped');
    expect(reusableComponentMappingStatus.summary.componentCount).toBe(0);
  });
});

function validatePromotionStatusFixture(data: unknown) {
  expect(isPlainObject(data)).toBe(true);
  if (!isPlainObject(data)) {
    return;
  }

  expect(Object.keys(data).sort()).toEqual([...reusableComponentStatusRootFields].sort());
  expect(data.statusVersion).toBe(reusableComponentStatusContractVersion);
  expect(typeof data.generatedAt).toBe('string');
  expect(reusableComponentStatusChangeClasses).toContain(data.changeClass);
  expect(reusableComponentStatusEnforcementModes).toContain(data.enforcementMode);
  expect(Array.isArray(data.reasonCodes)).toBe(true);

  validateRailSummaries(data.railSummaries);
  validateClaimProfiles(data.claimProfiles);
  validateHighestEarnedClaim(data.highestEarnedClaim);
}

function validateRailSummaries(railSummaries: unknown) {
  expect(isPlainObject(railSummaries)).toBe(true);
  if (!isPlainObject(railSummaries)) {
    return;
  }

  expect(Object.keys(railSummaries).sort()).toEqual([...reusableComponentStatusRailKeys].sort());

  for (const railKey of reusableComponentStatusRailKeys) {
    const summary = railSummaries[railKey];
    expect(isPlainObject(summary)).toBe(true);
    if (!isPlainObject(summary)) {
      continue;
    }

    expect(Object.keys(summary).sort()).toEqual(
      [...reusableComponentStatusRailSummaryFields].sort()
    );
    expect(typeof summary.contractId).toBe('string');
    expect(typeof summary.threadId).toBe('string');
    expect(typeof summary.sourcePath).toBe('string');
    expect(typeof summary.sourceVersionOrRevision).toBe('string');
    expect(reusableComponentStatusFreshnessValues).toContain(summary.freshness);
    expect(reusableComponentStatusRailOutcomeValues).toContain(summary.outcome);
    expect(typeof summary.claimRelevant).toBe('boolean');
  }
}

function validateClaimProfiles(claimProfiles: unknown) {
  expect(isPlainObject(claimProfiles)).toBe(true);
  if (!isPlainObject(claimProfiles)) {
    return;
  }

  expect(Object.keys(claimProfiles).sort()).toEqual(
    [...reusableComponentStatusChangeClasses].sort()
  );
  expect(claimProfiles).toEqual(reusableComponentStatusClaimProfileMatrix);
}

function validateHighestEarnedClaim(highestEarnedClaim: unknown) {
  expect(isPlainObject(highestEarnedClaim)).toBe(true);
  if (!isPlainObject(highestEarnedClaim)) {
    return;
  }

  expect(Object.keys(highestEarnedClaim).sort()).toEqual(
    [...reusableComponentStatusHighestEarnedClaimFields].sort()
  );
  expect(typeof highestEarnedClaim.profileId).toBe('string');
  expect(typeof highestEarnedClaim.claimId).toBe('string');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
