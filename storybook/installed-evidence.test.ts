import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import project from '../ds-skills.project.json';
import {
  makeFixture,
  readJson,
  repoRoot,
  runInstalled,
  syntheticReview,
  writeJson,
} from './installed-evidence-fixture';

let root: string;
beforeEach(() => {
  root = makeFixture();
});
afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});
function report(command: string[], status = 0, extra: string[] = [], directory = root) {
  const result = runInstalled(directory, command, extra);
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(status);
  const data = JSON.parse(result.stdout);
  expect(data.resultVersion).toBe('1');
  expect(data.command).toBe(command.join(' '));
  expect(data.ok).toBe(status === 0);
  return data;
}
function promote(profile = 'component-review', consumer = 'ci', status = 0) {
  return report(['components', 'promote'], status, ['--profile', profile, '--consumer', consumer]);
}

describe('installed Collider story and readiness integration', () => {
  it('checks actual policies and static coverage without calling it executed evidence', () => {
    report(['storybook', 'policy', 'validate'], 0, [], repoRoot);
    const proof = report(['storybook', 'proof', 'check'], 0, [], repoRoot);
    expect(proof.scope).toBe('static-story-reference-coverage');
    expect(proof.coverage.summary).toEqual({ componentCount: 33, readyCount: 33, failingCount: 0 });
  });

  it('rejects a removed real story and preserves previous coverage on invalid structure', () => {
    const coverage = path.join(root, project.storybook.proof.coverage);
    const before = fs.readFileSync(coverage);
    fs.unlinkSync(path.join(root, 'src/components/ai-elements/message.stories.tsx'));
    const failed = report(['storybook', 'proof', 'build'], 1);
    expect(failed.diagnostics.join('\n')).toContain('message');
    expect(fs.readFileSync(coverage)).toEqual(before);
  });

  it('rejects edited coverage rather than trusting its readiness claim', () => {
    const data = readJson(root, project.storybook.proof.coverage);
    data.summary.readyCount = 999;
    writeJson(root, project.storybook.proof.coverage, data);
    report(['storybook', 'proof', 'check'], 1);
  });

  it('rejects a real component spec with a tier outside the configured policy', () => {
    const spec = readJson(root, 'storybook/component-specs/message.json');
    spec.tier = 'unsupported-tier';
    writeJson(root, 'storybook/component-specs/message.json', spec);
    const failed = report(['storybook', 'proof', 'validate'], 1);
    expect(failed.diagnostics.join('\n')).toContain('tier');
  });

  it('keeps missing visual review visible and blocks the same explicit CI policy', () => {
    const generated = report(['components', 'status', 'build']);
    expect(generated.report.statusVersion).toBe('3');
    expect(generated.report.evidence['story-coverage'].state).toBe('satisfied');
    expect(generated.report.evidence['visual-review'].state).toBe('unavailable');
    expect(generated.report.evidence['figma-publication'].state).toBe('satisfied');
    report(['components', 'status', 'check']);
    expect(promote('component-review', 'ci', 1).decision.requirementsSatisfied).toBe(false);
    expect(promote('reference', 'docs').decision.requirementsSatisfied).toBe(true);
  });

  it('marks a local advisory as unmet instead of describing it as approved', () => {
    expect(promote('component-review', 'local').decision).toMatchObject({
      enforcement: 'advisory',
      requirementsSatisfied: false,
    });
  });

  it('accepts current scope-bound synthetic review only in the isolated test consumer', () => {
    syntheticReview(root);
    report(['chromatic', 'status', 'validate']);
    expect(promote().decision.requirementsSatisfied).toBe(true);
  });

  it.each(['changed', 'failed', 'deferred'])('does not promote %s review evidence', (outcome) => {
    syntheticReview(root, outcome);
    report(['chromatic', 'status', 'validate']);
    expect(promote('component-review', 'ci', 1).decision.unmet).toContain('visual-review');
  });

  it('refuses stale review even when its own outcome says passed', () => {
    const status = syntheticReview(root);
    status.generatedAt = '2000-01-01T00:00:00Z';
    writeJson(root, project.storybook.chromatic.status, status);
    report(['chromatic', 'status', 'validate'], 1);
    expect(promote('component-review', 'ci', 1).report.evidence['visual-review'].state).toBe(
      'invalid'
    );
  });

  it('does not let publication state determine component readiness', () => {
    syntheticReview(root);
    fs.unlinkSync(path.join(root, project.tokens.governance.publication.ledger));
    expect(promote().decision.requirementsSatisfied).toBe(true);
    expect(promote('publication-record', 'release', 1).decision.unmet).toContain(
      'figma-publication'
    );
    expect(promote('release', 'release', 1).decision.requirementsSatisfied).toBe(false);
  });

  it('refuses tampered or obsolete saved status, without trusting it for promotion', () => {
    const built = report(['components', 'status', 'build']);
    built.report.statusVersion = '2';
    writeJson(root, project.components.report, built.report);
    report(['components', 'status', 'check'], 1);
    promote('component-review', 'ci', 1);
  });

  it('requires explicit known profile and consumer rather than heuristic downgrades', () => {
    const result = runInstalled(root, ['components', 'promote']);
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    const unknown = runInstalled(
      root,
      ['components', 'promote'],
      ['--profile', 'component-review', '--consumer', 'unknown']
    );
    expect(unknown.status).toBe(2);
  });
});
