import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import project from '../../../ds-skills.project.json';

const repoRoot = path.resolve(__dirname, '../../..');
const launcher = '.ds-skills/project.mjs';
const expectedSteps = [
  'tokens validate',
  'tokens guard',
  'tokens build',
  'tokens runtime check',
  'tokens artifacts check',
  'figma verify',
  'ledger validate',
  'ledger parity',
  'proof validate',
];
const temporary: string[] = [];

function run(config = 'ds-skills.project.json') {
  const result = spawnSync(
    process.execPath,
    [launcher, 'tokens', 'govern', '--config', config, '--root', repoRoot, '--json'],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  expect(result.error).toBeUndefined();
  expect(result.signal).toBeNull();
  return result;
}

function candidateConfig(missing = false) {
  const parent = path.join(repoRoot, '.codex-artifacts');
  fs.mkdirSync(parent, { recursive: true });
  const root = fs.mkdtempSync(path.join(parent, 'token-gate-test-'));
  temporary.push(root);
  const config = structuredClone(project);
  const baseline = JSON.parse(
    fs.readFileSync(path.join(repoRoot, config.tokens.governance.publication.baseline), 'utf8')
  );
  // Change a real expectation, not the evaluator or the release installation.
  baseline.summary.leafCount += 1;
  const target = path.join(root, 'baseline.json');
  if (!missing) fs.writeFileSync(target, JSON.stringify(baseline));
  config.tokens.governance.publication.baseline = path.relative(repoRoot, target);
  const configPath = path.join(root, 'project.json');
  fs.writeFileSync(configPath, JSON.stringify(config));
  return path.relative(repoRoot, configPath);
}

afterEach(() => {
  for (const root of temporary.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('installed Collider token governance', () => {
  it('evaluates all nine real configured checks without claiming observed remote publication', () => {
    const result = run();
    expect(result.status, result.stderr).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.command).toBe('tokens govern');
    expect(report.ok).toBe(true);
    expect(report.steps.map((step: { id: string }) => step.id)).toEqual(expectedSteps);
    expect(report.capabilities).toEqual({
      manualEditGuard: true,
      runtimeChecks: true,
      publication: true,
    });
    expect(report.failedStep).toBeNull();
    expect(report.scope).toContain('not observed remote synchronization');
  });

  it('rejects a corrupted Figma expectation at an evaluated gate and stops before ledger checks', () => {
    const result = run(candidateConfig());
    expect(result.status, result.stderr).toBe(1);
    const report = JSON.parse(result.stdout);
    expect(report.ok).toBe(false);
    expect(report.failedStep).toBe('figma verify');
    expect(report.steps.map((step: { id: string }) => step.id)).toEqual(expectedSteps.slice(0, 6));
    expect(report.steps.at(-1).result.errors.join('\n')).toContain('leafCount');
  });

  it('distinguishes missing publication inputs from evaluated nonconformance', () => {
    const result = run(candidateConfig(true));
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('baseline.json');
  });

  it('routes token and publication commands through the installed product', () => {
    const { scripts } = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(scripts['govern:tokens']).toBe(
      `node ${launcher} tokens govern --config ds-skills.project.json`
    );
    expect(scripts['validate:tokens']).toBe(
      `node ${launcher} tokens validate --config ds-skills.project.json`
    );
    expect(scripts['build:tokens']).toBe(
      `node ${launcher} tokens build --config ds-skills.project.json`
    );
    for (const command of [
      'validate:sync-ledger',
      'validate:figma-parity',
      'validate:publish-proof',
      'figma:verify',
    ]) {
      expect(scripts[command]).toMatch(/^node \.ds-skills\/project\.mjs /);
    }
  });

  it('keeps token governance first in preflight without weakening subsequent gates', () => {
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
    const block = justfile.match(/^preflight:\n((?:    .*\n)+)/m)?.[1];
    expect(block).toBeDefined();
    const commands = [
      'pnpm govern:tokens',
      'just storybook-proof',
      'just check',
      'just loc',
      'just test-all',
    ];
    const indexes = commands.map((command) => block!.indexOf(command));
    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
  });
});
