import { describe, expect, it } from 'vitest';
import {
  createReusableComponentStatus,
  validateReusableComponentStatusArtifact,
} from '../scripts/lib/reusable-component-status.mjs';
import { evaluateReusableComponentPromotionDecision } from '../scripts/lib/reusable-component-promotion-gate.mjs';

const now = '2026-03-21T20:00:00.000Z';

function readyStatus() {
  const status = createReusableComponentStatus({ now });
  const satisfied = { freshness: 'current', outcome: 'satisfied', claimRelevant: true };
  return {
    ...status,
    reasonCodes: ['ct10b-review-claim-required'],
    railSummaries: {
      ct8b: { ...status.railSummaries.ct8b, ...satisfied },
      ct9b: { ...status.railSummaries.ct9b, ...satisfied },
      ct10b: { ...status.railSummaries.ct10b, ...satisfied },
    },
  };
}

const release = { consumer: 'release', requestedChangeClass: 'reusable-component-advancement' };

describe('component readiness and publication boundaries', () => {
  it('generates only publication, component proof and review summaries', () => {
    const status = createReusableComponentStatus({ now });
    expect(status.statusVersion).toBe('2');
    expect(Object.keys(status.railSummaries)).toEqual(['ct8b', 'ct9b', 'ct10b']);
    expect(status.claimProfiles['reusable-component-advancement'].readsRails).toEqual([
      'ct8b',
      'ct9b',
      'ct10b',
    ]);
    expect(validateReusableComponentStatusArtifact(status)).toEqual([]);
  });

  it('rejects a report from the previous structural contract', () => {
    const status = createReusableComponentStatus({ now });
    expect(validateReusableComponentStatusArtifact({ ...status, statusVersion: '1' })).toEqual(
      expect.arrayContaining([expect.stringContaining('statusVersion')])
    );
  });

  it('permits release on satisfied component proof, required review and publication', () => {
    const decision = evaluateReusableComponentPromotionDecision(readyStatus(), release);
    expect(decision.outcome).toBe('pass');
    expect(decision.blockingReasons).toEqual([]);
  });

  it.each([
    ['ct9b', 'missing', 'unsatisfied', 'proof-rail-missing'],
    ['ct9b', 'current', 'unsatisfied', 'proof-rail-unsatisfied'],
    ['ct10b', 'stale', 'satisfied', 'review-rail-stale'],
    ['ct10b', 'current', 'unsatisfied', 'review-rail-unsatisfied'],
    ['ct8b', 'current', 'deferred', 'parity-rail-deferred'],
    ['ct8b', 'missing', 'unsatisfied', 'parity-rail-missing'],
  ] as const)('blocks release on %s / %s / %s', (key, freshness, outcome, reason) => {
    const status = readyStatus();
    Object.assign(status.railSummaries[key], { freshness, outcome });
    const decision = evaluateReusableComponentPromotionDecision(status, release);
    expect(decision.outcome).toBe('block');
    expect(decision.blockingReasons).toContain(reason);
  });

  it('does not reinterpret informational review as a required approval', () => {
    const status = readyStatus();
    status.reasonCodes = [];
    status.railSummaries.ct10b.outcome = 'deferred';
    const decision = evaluateReusableComponentPromotionDecision(status, release);
    expect(decision.outcome).toBe('advisory');
    expect(decision.blockingReasons).toEqual([]);
    expect(decision.advisoryReasons).toContain('ct10b-review-informational');
  });
});
