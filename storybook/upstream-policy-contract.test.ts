import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  defaultUpstreamPolicyPath,
  evaluateUpstreamPolicy,
  loadAndValidateUpstreamPolicy,
  upstreamPolicyVersion,
  validateUpstreamPolicyShape,
} from '../scripts/lib/upstream-policy.mjs';

const basePolicy = {
  policyVersion: upstreamPolicyVersion,
  invariants: [],
  deviations: [],
  contracts: [],
};

function policy(overrides: Record<string, unknown>) {
  return { ...basePolicy, ...overrides };
}

describe('the committed upstream policy', () => {
  it('is structurally valid and currently holds', () => {
    const { data, errors } = loadAndValidateUpstreamPolicy(defaultUpstreamPolicyPath);

    expect(errors).toEqual([]);
    expect(evaluateUpstreamPolicy(data, { rootDir: repoRoot }).errors).toEqual([]);
  });

  it('scopes the focus-ring and destructive-fill invariants to the primitives directory', () => {
    const { data } = loadAndValidateUpstreamPolicy(defaultUpstreamPolicyPath);
    const invariants = data.invariants.map(
      (rule: { id: string; directory: string }) => `${rule.id}:${rule.directory}`
    );

    // Directory-scoped, so a NEWLY added primitive is covered without a manifest edit.
    expect(invariants).toEqual([
      'focus-ring-policy:src/components/ui',
      'destructive-is-not-a-fill:src/components/ui',
    ]);
  });

  it('gives every rule a reason, because the message is the remediation', () => {
    const { data } = loadAndValidateUpstreamPolicy(defaultUpstreamPolicyPath);
    const rules = [...data.invariants, ...data.deviations, ...data.contracts];

    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules as Array<{ reason: string }>) {
      expect(rule.reason.length).toBeGreaterThan(20);
    }
  });
});

describe('validateUpstreamPolicyShape', () => {
  it('rejects a wrong policyVersion', () => {
    expect(validateUpstreamPolicyShape(policy({ policyVersion: '2' }))).toEqual([
      `[UPSTREAM_POLICY_INVALID] policyVersion must be "${upstreamPolicyVersion}"`,
    ]);
  });

  it('rejects a rule that asserts nothing', () => {
    const errors = validateUpstreamPolicyShape(
      policy({ deviations: [{ id: 'empty', file: 'a.tsx', reason: 'a reason long enough' }] })
    );

    expect(errors).toEqual(['[UPSTREAM_POLICY_INVALID] deviations[0] "empty" asserts nothing']);
  });

  it('rejects a duplicate rule id across sections', () => {
    const errors = validateUpstreamPolicyShape(
      policy({
        deviations: [{ id: 'dup', file: 'a.tsx', reason: 'reason', require: ['x'] }],
        contracts: [{ id: 'dup', file: 'b.tsx', reason: 'reason', require: ['y'] }],
      })
    );

    expect(errors).toContain('[UPSTREAM_POLICY_INVALID] duplicate rule id "dup"');
  });

  it('rejects a forbid on a contract, which only ever requires upstream API', () => {
    const errors = validateUpstreamPolicyShape(
      policy({ contracts: [{ id: 'c', file: 'a.tsx', reason: 'reason', forbid: ['x'] }] })
    );

    expect(errors).toContain(
      '[UPSTREAM_POLICY_INVALID] contracts[0] "c" contracts may only require'
    );
  });

  it('rejects an uncompilable pattern instead of throwing at evaluation time', () => {
    const errors = validateUpstreamPolicyShape(
      policy({ deviations: [{ id: 'bad', file: 'a.tsx', reason: 'reason', require: ['('] }] })
    );

    expect(errors[0]).toContain('[UPSTREAM_POLICY_INVALID] deviations[0] "bad" bad pattern: (');
  });
});

describe('evaluateUpstreamPolicy', () => {
  const options = { rootDir: repoRoot };

  it('reports an invariant violation with the file that broke it', () => {
    const { errors } = evaluateUpstreamPolicy(
      policy({
        invariants: [
          {
            id: 'no-cva',
            directory: 'src/components/ui',
            forbid: ['cva\\('],
            reason: 'Synthetic rule proving the directory sweep reaches every primitive.',
          },
        ],
      }),
      options
    );

    expect(errors.length).toBeGreaterThan(1);
    expect(errors.some((error: string) => error.includes('src/components/ui/badge.tsx'))).toBe(
      true
    );
    expect(errors[0]).toContain('[UPSTREAM_INVARIANT_VIOLATED]');
    expect(errors[0]).toContain('Likely cause: a registry overwrite');
  });

  it('reports a lost deviation by id, pattern and reason', () => {
    const { errors } = evaluateUpstreamPolicy(
      policy({
        deviations: [
          {
            id: 'gone',
            file: 'src/components/ui/badge.tsx',
            require: ['NEVER_PRESENT_MARKER'],
            reason: 'Synthetic rule standing in for a reverted deviation.',
          },
        ],
      }),
      options
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('[UPSTREAM_DEVIATION_LOST] src/components/ui/badge.tsx: "gone"');
    expect(errors[0]).toContain('expected `NEVER_PRESENT_MARKER` — not found');
    expect(errors[0]).toContain('Synthetic rule standing in for a reverted deviation.');
  });

  it('tells a lost contract to restore upstream API rather than hand-roll one', () => {
    const { errors } = evaluateUpstreamPolicy(
      policy({
        contracts: [
          {
            id: 'sdk-gone',
            file: 'src/components/ai-elements/message.tsx',
            require: ['NEVER_PRESENT_MARKER'],
            reason: 'Synthetic rule standing in for a dropped SDK type import.',
          },
        ],
      }),
      options
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('[UPSTREAM_CONTRACT_LOST]');
    expect(errors[0]).toContain('Restore it rather than hand-rolling a local equivalent.');
    expect(errors[0]).not.toContain('Likely cause: a registry overwrite');
  });

  it('fails loudly when a rule points at nothing, so a moved file cannot silently pass', () => {
    const { errors } = evaluateUpstreamPolicy(
      policy({
        invariants: [
          {
            id: 'nowhere',
            directory: 'src/components/does-not-exist',
            forbid: ['x'],
            reason: 'Synthetic rule proving an empty scope is an error, not a pass.',
          },
        ],
        deviations: [
          {
            id: 'missing-file',
            file: 'src/components/ui/does-not-exist.tsx',
            require: ['x'],
            reason: 'Synthetic rule proving a missing target is an error, not a pass.',
          },
        ],
      }),
      options
    );

    expect(errors).toEqual([
      '[UPSTREAM_SCOPE_EMPTY] "nowhere" matched no files in src/components/does-not-exist',
      '[UPSTREAM_SCOPE_EMPTY] "missing-file" targets missing file src/components/ui/does-not-exist.tsx',
    ]);
  });

  it('ignores stories and tests, which legitimately reference upstream classes', () => {
    const { errors } = evaluateUpstreamPolicy(
      policy({
        invariants: [
          {
            id: 'no-stories',
            directory: 'src/components/ui',
            forbid: ['satisfies Meta'],
            reason: 'Synthetic rule proving story files are outside the invariant sweep.',
          },
        ],
      }),
      options
    );

    expect(errors).toEqual([]);
  });
});
