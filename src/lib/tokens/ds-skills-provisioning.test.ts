import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');
const launcher = '.ds-skills/project.mjs';
const receiptPath = '.ds-skills/installation.json';
const receipt = JSON.parse(fs.readFileSync(path.join(repoRoot, receiptPath), 'utf8')) as {
  release: string;
  sourceCommit: string;
  files: Record<string, { sha256: string }>;
};
const temporary: string[] = [];

function tmp() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-installed-'));
  temporary.push(directory);
  return directory;
}

function fixture() {
  const root = tmp();
  // Real installed bytes and receipt, not a mock executable or invented identity.
  for (const relative of [...Object.keys(receipt.files), receiptPath, 'ds-skills.release.json']) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, relative), target);
  }
  return root;
}

function run(root: string, args: string[], env: NodeJS.ProcessEnv = process.env) {
  const result = spawnSync(process.execPath, [path.join(root, launcher), ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
  });
  expect(result.error).toBeUndefined();
  expect(result.signal).toBeNull();
  return result;
}

afterEach(() => {
  for (const root of temporary.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('Collider consumes the sealed installed product', () => {
  it('verifies the real project pin and both discovery surfaces', () => {
    const result = run(repoRoot, ['--check']);
    expect(result.status, result.stderr).toBe(0);
    const pin = JSON.parse(fs.readFileSync(path.join(repoRoot, 'ds-skills.release.json'), 'utf8'));
    expect(receipt.release).toBe(pin.release);
    expect(receipt.sourceCommit).toBe(pin.sourceCommit);
    const entries = Object.keys(receipt.files).filter((file) => file.endsWith('/SKILL.md'));
    expect(entries.filter((file) => file.startsWith('.agents/skills/'))).toHaveLength(9);
    expect(entries.filter((file) => file.startsWith('.claude/skills/'))).toHaveLength(9);
    for (const file of Object.keys(receipt.files)) {
      expect(fs.lstatSync(path.join(repoRoot, file)).isSymbolicLink()).toBe(false);
    }
  });

  it('runs an independently located copy without a sibling product checkout', () => {
    const root = fixture();
    const result = run(root, ['project', 'check', '--root', root, '--json']);
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      release: receipt.release,
      sourceCommit: receipt.sourceCommit,
      ok: true,
      installedFileCount: 69,
    });
  });

  it('refuses edited installed guidance before executing a command', () => {
    const root = fixture();
    fs.appendFileSync(path.join(root, '.agents/skills/stack-orchestrator/SKILL.md'), '\nEdited\n');
    const result = run(root, ['--version']);
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('stack-orchestrator/SKILL.md');
  });

  it('refuses missing discovery files instead of silently repairing during a gate', () => {
    const root = fixture();
    const missing = path.join(root, '.claude/skills/stack-orchestrator/SKILL.md');
    fs.unlinkSync(missing);
    const result = run(root, ['--check']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('stack-orchestrator/SKILL.md');
    expect(fs.existsSync(missing)).toBe(false);
  });

  it('does not invoke an ambient executable or acquire a missing release during checks', () => {
    const root = fixture();
    const prefix = tmp();
    const bin = tmp();
    const marker = path.join(bin, 'was-invoked');
    fs.writeFileSync(path.join(bin, 'ds-skills'), `#!/bin/sh\ntouch '${marker}'\nexit 0\n`, {
      mode: 0o755,
    });
    const result = run(root, ['--check'], {
      ...process.env,
      DS_SKILLS_PREFIX: prefix,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(fs.existsSync(marker)).toBe(false);
    expect(fs.readdirSync(prefix)).toEqual([]);
  });

  it('uses product-owned installation and invocation rather than local implementations', () => {
    const { scripts } = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(scripts['ds-skills:install']).toBe(`node ${launcher} --install`);
    expect(scripts['ds-skills:check']).toBe(`node ${launcher} --check`);
    expect(scripts['ds-skills:link']).toBeUndefined();
    for (const command of Object.values(scripts) as string[]) {
      expect(command).not.toMatch(/scripts\/(?:install-|link-)?ds-skills\.mjs/);
    }
  });
});
