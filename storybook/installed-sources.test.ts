import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import project from '../ds-skills.project.json';
import manifest from '../package.json';
import { readJson, repoRoot, runInstalled, writeJson } from './installed-evidence-fixture';

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-source-test-'));
  fs.cpSync(path.join(repoRoot, 'src/components'), path.join(root, 'src/components'), {
    recursive: true,
  });
  writeJson(root, 'ds-skills.project.json', project);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

function change(file: string, before: string, after: string) {
  const target = path.join(root, file);
  const source = fs.readFileSync(target, 'utf8');
  expect(source).toContain(before);
  fs.writeFileSync(target, source.replaceAll(before, after));
}
function check(kind: string, exitCode = 0) {
  const result = runInstalled(root, ['sources', kind, 'check']);
  expect(result.status, result.stderr || result.stdout).toBe(exitCode);
  const data = JSON.parse(result.stdout);
  expect(data.ok).toBe(exitCode === 0);
  expect(data.inputDigest).toMatch(/^[a-f0-9]{64}$/);
  return data;
}

describe('Collider source contracts through the independently installed product', () => {
  it('retains all actual policy rules with consumer-owned reasons', () => {
    const result = check('policy');
    expect(result.scope).toBe('source-text-policy');
    expect(result.counts).toEqual({ invariants: 2, deviations: 7, contracts: 17 });
    const policy = readJson(root, project.sourceChecks.policy.file);
    expect(policy.invariants.map((r: { directory: string }) => r.directory)).toEqual([
      'src/components/ui',
      'src/components/ui',
    ]);
    for (const rule of [...policy.invariants, ...policy.deviations, ...policy.contracts])
      expect(rule.reason.length).toBeGreaterThan(20);
  });

  it('resolves actual imports and the repaired slot without an API mirror', () => {
    const result = check('contract');
    expect(result.scope).toBe('static-module-slot-contract');
    expect(result.summary.providerModuleCount).toBeGreaterThan(20);
    expect(result.summary.importedBindings).toBeGreaterThan(50);
    expect(result.summary.consumerCount).toBeGreaterThan(40);
    expect(result.summary.consumerCount).toBeLessThan(result.summary.scannedConsumerCount);
    expect(result.slots).toContainEqual({
      slot: 'select-trigger',
      selectedBy: 'src/components/ui/button-group.tsx',
      owner: 'src/components/ui/select.tsx',
    });
    expect(project.sourceChecks.contract.slots).toEqual({ mode: 'filename-prefix', owners: {} });
  });

  it('rejects removal of the real Select trigger slot', () => {
    change('src/components/ui/select.tsx', 'data-slot="select-trigger"', '');
    expect(check('contract', 1).errors.join('\n')).toContain(
      '[CONTRACT_SLOT_DEAD] src/components/ui/select.tsx does not declare select-trigger'
    );
  });

  it('does not let another component impersonate the Select slot owner', () => {
    change('src/components/ui/select.tsx', 'data-slot="select-trigger"', '');
    change('src/components/ui/button.tsx', '<Comp ', '<Comp data-slot="select-trigger" ');
    expect(check('contract', 1).errors.join('\n')).toContain('[CONTRACT_SLOT_DEAD]');
  });

  it('rejects removal of Button while actual AI Elements imports still require it', () => {
    change(
      'src/components/ui/button.tsx',
      'export { Button, buttonVariants };',
      'export { buttonVariants };'
    );
    expect(check('contract', 1).errors.join('\n')).toContain(
      '[CONTRACT_EXPORT_MISSING] src/components/ui/button.tsx does not export Button'
    );
  });

  it('applies the directory policy to a newly added primitive without enrollment', () => {
    fs.writeFileSync(
      path.join(root, 'src/components/ui/new-control.tsx'),
      'export const NewControl = () => <button className="focus-visible:ring-2" />;\n'
    );
    expect(check('policy', 1).errors.join('\n')).toContain(
      '[UPSTREAM_INVARIANT_VIOLATED] src/components/ui/new-control.tsx'
    );
  });

  it('rejects a reverted real destructive surface deviation', () => {
    change('src/components/ui/button.tsx', 'bg-destructive-surface', 'bg-muted');
    expect(check('policy', 1).errors.join('\n')).toContain('button-destructive-surface');
  });

  it('rejects removal of a real declared SDK type obligation', () => {
    change('src/components/ai-elements/tool.tsx', 'ToolUIPart', 'RemovedToolPart');
    expect(check('policy', 1).errors.join('\n')).toContain('[UPSTREAM_CONTRACT_LOST]');
  });

  it('reports an evaluated missing policy scope rather than a vacuous pass', () => {
    fs.rmSync(path.join(root, 'src/components/ui/badge.tsx'));
    expect(check('policy', 1).errors.join('\n')).toContain('[UPSTREAM_SCOPE_EMPTY]');
  });

  it('distinguishes unsupported provider syntax from evaluated rejection', () => {
    fs.writeFileSync(
      path.join(root, 'src/components/ai-elements/unsupported.tsx'),
      "import * as ButtonApi from '@/components/ui/button';\nexport { ButtonApi };\n"
    );
    const result = runInstalled(root, ['sources', 'contract', 'check']);
    expect(result.status, result.stderr).toBe(2);
    expect(result.stderr).toContain('unsupported');
    expect(result.stdout).toBe('');
  });

  it('enforces both installed source checks in the preflight and CI static gate', () => {
    for (const [script, command] of [
      ['validate:upstream-policy', 'sources policy check'],
      ['validate:consumer-contract', 'sources contract check'],
    ]) {
      expect(manifest.scripts[script as keyof typeof manifest.scripts]).toBe(
        `node .ds-skills/project.mjs ${command} --config ds-skills.project.json`
      );
    }
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
    expect(justfile).toContain(
      'check: ds-skills-check check-ts check-upstream check-contract check-rs'
    );
    expect(justfile).toContain('pnpm baseline:upstream:check');
    const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');
    const quality = workflow.split('\n  quality:')[1].split('\n  test-all:')[0];
    expect(quality).toContain('run: just check');
    expect(quality).not.toContain('continue-on-error');
    expect(quality).toContain('node .ds-skills/project.mjs --install');
  });
});
