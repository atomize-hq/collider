import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import project from '../ds-skills.project.json';
import manifest from '../package.json';
import { readJson, repoRoot, runInstalled, writeJson } from './installed-evidence-fixture';

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-foundations-test-'));
  for (const relative of [
    project.foundations.artifact,
    project.foundations.model,
    project.foundations.presentation,
  ]) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, relative), target);
  }
  writeJson(root, 'ds-skills.project.json', project);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

function run(action: string, expected = 0) {
  const result = runInstalled(root, ['foundations', action]);
  expect(result.status, result.stderr || result.stdout).toBe(expected);
  const data = JSON.parse(result.stdout);
  expect(data.scope).toBe('foundation-script-generation');
  expect(data.ok).toBe(expected === 0);
  return data;
}
function bytes() {
  return fs.readFileSync(path.join(root, project.foundations.output), 'utf8');
}
function emittedData() {
  // Inspect the actual installed renderer's embedded project payload. This does not
  // execute Figma code or pretend that successful generation is a live render.
  return JSON.parse(
    bytes().split('const foundationInput = ')[1].split(';\nreturn DSFoundations')[0]
  );
}

describe('Collider foundations through the installed product', () => {
  it('includes every existing non-core specimen token, including all motion role pairs', () => {
    expect(run('build')).toMatchObject({ tokenCount: 176, artifactStatus: 'written' });
    const { model, presentation } = emittedData();
    const ids = model.sections.flatMap((s: { rows: { id: string }[] }) => s.rows.map((r) => r.id));
    expect(ids).toHaveLength(142);
    expect(new Set(ids).size).toBe(142);
    for (const role of ['appear', 'dismiss', 'hover'])
      for (const field of ['duration', 'easing'])
        expect(ids).toContain(`motion.role.${role}.${field}`);
    expect(model.sections).toHaveLength(29);
    expect(presentation.frames).toHaveLength(12);
    expect(model.modes.map((m: { id: string }) => m.id)).toEqual(['dark', 'light']);
    expect(run('check').artifactStatus).toBe('not-written');
  });

  it('preserves real color grounds, derived typography and shadow specimens', () => {
    run('build');
    const { model } = emittedData();
    const rows = model.sections.flatMap((s: { rows: { id: string }[] }) => s.rows);
    const foreground = rows.find((r: { id: string }) => r.id === 'accent.primary-foreground');
    expect(foreground.samples.dark.against).toBe('accent/primary');
    expect(foreground.samples.dark.metric).toBe('text');
    const tracking = rows.find((r: { id: string }) => r.id === 'type.tracking.wide');
    expect(tracking.samples.dark.binding).toBe('derived');
    const shadows = model.sections.filter((s: { kind: string }) => s.kind === 'shadow');
    expect(shadows).toHaveLength(2);
    const shadowRows = shadows.flatMap((s: { rows: unknown[] }) => s.rows);
    expect(shadowRows).toHaveLength(12);
    for (const mode of ['dark', 'light'])
      expect(
        shadowRows.filter(
          (r: { samples: Record<string, { rendered: unknown }> }) =>
            r.samples[mode].rendered !== null
        )
      ).toHaveLength(10);
  });

  it('uses explicit discovered targets without replacing unowned legacy frame IDs', () => {
    const presentation = readJson(root, project.foundations.presentation);
    expect(presentation.pageId).toBe('2419:17');
    expect(presentation.collectionId).toBe('VariableCollectionId:2019:334');
    expect(presentation.ownerId).toBe('collider-foundations');
    for (const frame of presentation.frames) {
      expect(frame.targetId).toBeNull();
      expect(frame.x).toBeGreaterThan(8248);
    }
  });

  it('detects an edited generated script and repairs it only on explicit build', () => {
    run('build');
    const generated = bytes();
    fs.appendFileSync(path.join(root, project.foundations.output), '\n// unexpected edit\n');
    expect(run('check', 1).diagnostics).toContain('Foundations script is missing or stale');
    expect(bytes()).not.toBe(generated);
    run('build');
    expect(bytes()).toBe(generated);
  });

  it('rejects invalid real token values without replacing the last generated script', () => {
    run('build');
    const generated = bytes();
    const artifact = readJson(root, project.foundations.artifact);
    artifact.semantic.color.text.primary.$value = 'not-a-color';
    writeJson(root, project.foundations.artifact, artifact);
    expect(run('build', 1).artifactStatus).toBe('not-written');
    expect(bytes()).toBe(generated);
  });

  it('refuses missing section coverage rather than silently omitting a specimen group', () => {
    const presentation = readJson(root, project.foundations.presentation);
    presentation.frames[0].sections.pop();
    writeJson(root, project.foundations.presentation, presentation);
    expect(run('build', 1).diagnostics.join('\n')).toContain('section');
    expect(fs.existsSync(path.join(root, project.foundations.output))).toBe(false);
  });

  it('distinguishes missing source input from evaluated nonconformance', () => {
    fs.rmSync(path.join(root, project.foundations.artifact));
    const result = runInstalled(root, ['foundations', 'build']);
    expect(result.status, result.stderr).toBe(2);
    expect(result.stdout).toBe('');
  });

  it('uses only the installed build/check entrypoints', () => {
    for (const action of ['build', 'check'])
      expect(manifest.scripts[`figma:foundations:${action}` as keyof typeof manifest.scripts]).toBe(
        `node .ds-skills/project.mjs foundations ${action} --config ds-skills.project.json`
      );
  });
});
