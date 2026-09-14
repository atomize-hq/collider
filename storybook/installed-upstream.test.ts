import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import project from '../ds-skills.project.json';
import manifest from '../package.json';
import { readJson, repoRoot, runInstalled, writeJson } from './installed-evidence-fixture';

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-upstream-test-'));
  fs.cpSync(path.join(repoRoot, 'src/components'), path.join(root, 'src/components'), {
    recursive: true,
  });
  // Registry checks also validate configured library source inputs.
  fs.cpSync(path.join(repoRoot, 'design-system'), path.join(root, 'design-system'), {
    recursive: true,
  });
  for (const relative of ['package.json', 'tsconfig.json', 'AGENTS.md'])
    fs.copyFileSync(path.join(repoRoot, relative), path.join(root, relative));
  fs.copyFileSync(
    path.join(repoRoot, 'ds-skills.project.json'),
    path.join(root, 'ds-skills.project.json')
  );
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

const ownership = readJson(repoRoot, 'src/components/upstream-ownership.json');
const snapshot = readJson(repoRoot, project.registries.evidence.file);
const selections = readJson(repoRoot, project.registries.definition);

describe('Collider whole upstream snapshot and owned-copy provenance', () => {
  it('validates the actual complete accepted snapshot using the installed offline checker', () => {
    const result = runInstalled(root, ['registries', 'check']);
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      scope: 'registry-source-snapshot',
      artifactStatus: 'not-written',
      sha256: project.registries.evidence.sha256,
    });
  });

  it('accounts for every current copied file, preserving explicit split provenance', () => {
    expect(ownership.ownershipVersion).toBe('1');
    let splitCount = 0;
    for (const library of ownership.libraries) {
      expect(library.ownership).toBe('consumer-owned-copy');
      const names = fs
        .readdirSync(path.join(repoRoot, library.root))
        .filter((f) => /\.tsx?$/.test(f) && !/\.(stories|test|spec)\.tsx?$/.test(f));
      expect(library.files.map((f: { file: string }) => f.file).sort()).toEqual(names.sort());
      const registry = snapshot.data.registries.find((r: { id: string }) => r.id === library.id);
      expect(registry).toBeDefined();
      const selected = selections.registries.find((r: { id: string }) => r.id === library.id);
      expect(selected.items.map((i: { name: string }) => i.name).sort()).toEqual(
        [...new Set(library.files.map((f: { item: string }) => f.item))].sort()
      );
      for (const file of library.files) {
        expect(['copied-component', 'local-split']).toContain(file.relationship);
        if (file.relationship === 'local-split') splitCount++;
        expect(registry.items.some((i: { name: string }) => i.name === file.item)).toBe(true);
      }
    }
    expect(splitCount).toBe(32);
    // The reconciled primitives remain Collider-owned; the pinned v4 source is reference evidence.
    expect(ownership.libraries.map((l: { role: string }) => l.role)).toEqual([
      'upstream-reference',
      'current-source',
    ]);
  });

  it('retains full source identity, observed index membership and license documents', () => {
    for (const registry of snapshot.data.registries) {
      expect(registry.documents.find((d: { id: string }) => d.id === 'license')).toBeDefined();
      for (const item of registry.items) {
        expect(item.sha256).toMatch(/^[0-9a-f]{64}$/);
        expect(item.files.length).toBeGreaterThan(0);
        expect(typeof item.content).toBe('string');
        if (registry.index) expect(registry.index.observedNames).toContain(item.name);
      }
    }
    const conversation = snapshot.data.registries[1];
    expect(conversation.index.url).toBe('https://elements.ai-sdk.dev/api/registry/registry.json');
    expect(
      conversation.documents.find((d: { id: string }) => d.id === 'license-terms').content
    ).toContain('Apache License');
  });

  it('rejects corrupted accepted bytes rather than treating them as upstream removal', () => {
    fs.appendFileSync(path.join(root, project.registries.evidence.file), ' ');
    const result = runInstalled(root, ['registries', 'check']);
    expect(result.status, result.stderr).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('Snapshot SHA-256 differs from reviewed pin');
  });

  it('reports selection drift offline without manufacturing deletion or accepting it', () => {
    const selected = readJson(root, project.registries.definition);
    selected.registries[0].items.pop();
    writeJson(root, project.registries.definition, selected);
    const result = runInstalled(root, ['registries', 'check']);
    expect(result.status, result.stderr).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: false,
      artifactStatus: 'not-written',
      diagnostics: ['Accepted registry snapshot selection is stale'],
    });
    expect(fs.readFileSync(path.join(root, project.registries.evidence.file))).toEqual(
      fs.readFileSync(path.join(repoRoot, project.registries.evidence.file))
    );
  });

  it('uses explicit capture/diff/check commands, never a local registry fetcher', () => {
    for (const [script, action] of [
      ['baseline:upstream', 'capture'],
      ['baseline:upstream:diff', 'diff'],
      ['baseline:upstream:check', 'check'],
    ])
      expect(manifest.scripts[script as keyof typeof manifest.scripts]).toBe(
        `node .ds-skills/project.mjs registries ${action} --config ds-skills.project.json`
      );
    expect(fs.existsSync(path.join(repoRoot, 'scripts/fetch-upstream-baseline.mjs'))).toBe(false);
    expect(fs.existsSync(path.join(repoRoot, 'scripts/lib/consumer-contract.mjs'))).toBe(false);
  });
});
