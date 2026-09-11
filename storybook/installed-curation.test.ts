import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import project from '../ds-skills.project.json';
import { readJson, repoRoot, runInstalled } from './installed-evidence-fixture';

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-curation-test-'));
  for (const relative of [
    '.agents',
    '.claude/skills',
    '.claude/schemas',
    '.claude/templates',
    '.ds-skills',
    'src/components',
    'design-system',
  ])
    fs.cpSync(path.join(repoRoot, relative), path.join(root, relative), { recursive: true });
  for (const relative of ['AGENTS.md', 'package.json', 'tsconfig.json', 'ds-skills.release.json'])
    fs.copyFileSync(path.join(repoRoot, relative), path.join(root, relative));
  fs.copyFileSync(
    path.join(repoRoot, 'ds-skills.project.json'),
    path.join(root, 'ds-skills.project.json')
  );
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
const name = 'ds-curated-collider-conversation-ui';
const guide = `.agents/skills/${name}/references/guidance.md`;
function command(args: string[], expected = 0) {
  const result = runInstalled(root, ['curation', ...args]);
  expect(result.status, result.stderr || result.stdout).toBe(expected);
  return result;
}

describe('Collider current reviewed custom skills', () => {
  it('checks the actual accepted bundle and installed custom outputs, not just core assets', () => {
    command(['check']);
    command(['installed', 'check']);
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
    expect(justfile).toContain(
      'check: ds-skills-check check-ts check-upstream check-contract check-rs'
    );
    expect(justfile).toContain(
      'node .ds-skills/project.mjs curation installed check --config ds-skills.project.json'
    );
    const review = readJson(root, project.curation.review.file);
    expect(review.bundleSha256).toBe(
      'bba45037a54e79310641bcdfaa2741499c4227957324fc3b0f9887d7c22b36ef'
    );
    expect(review.reviewer.id).toBe('Codex /root/curation_acceptance - independent review');
    expect(review.notes).toContain(
      'not new runtime/example execution, Figma publication, final CI or landing proof'
    );
  });

  it('installs both actual selected library guides identically on both discovery surfaces', () => {
    const bundle = readJson(root, project.curation.accepted.file);
    expect(bundle.skills.map((s: { name: string }) => s.name).sort()).toEqual([
      'ds-curated-collider-conversation-ui',
      'ds-curated-collider-owned-primitives',
    ]);
    for (const skill of bundle.skills)
      for (const [relative, content] of Object.entries(skill.files))
        for (const surface of ['.agents', '.claude'])
          expect(
            fs.readFileSync(path.join(root, surface, 'skills', skill.name, relative), 'utf8')
          ).toBe(content);
    const text = fs.readFileSync(path.join(root, guide), 'utf8');
    expect(text).toContain('ToolOutput returns null');
    expect(text).toContain('MessageResponse');
    expect(text).toContain('aria-hidden');
  });

  it('rejects an edited installed guide and refuses to overwrite the user edit', () => {
    fs.appendFileSync(path.join(root, guide), '\nUser-owned note\n');
    const result = command(['installed', 'check'], 1);
    expect(JSON.parse(result.stdout).diagnostics).toContainEqual(
      expect.objectContaining({ code: 'PROJECT_OUTPUT_SKEW', path: guide })
    );
    expect(command(['install'], 2).stderr).toContain('unowned or edited');
    expect(fs.readFileSync(path.join(root, guide), 'utf8')).toContain('User-owned note');
  });

  it('repairs missing owned output only on explicit installation', () => {
    fs.rmSync(path.join(root, guide));
    command(['installed', 'check'], 1);
    expect(fs.existsSync(path.join(root, guide))).toBe(false);
    command(['install']);
    command(['installed', 'check']);
  });

  it('invalidates guidance when an actual selected source changes', () => {
    fs.appendFileSync(path.join(root, 'src/components/ui/button.tsx'), '\n// changed source\n');
    command(['check'], 1);
  });

  it('refuses a corrupted review instead of treating structural validity as approval', () => {
    fs.appendFileSync(path.join(root, project.curation.review.file), ' ');
    command(['check'], 2);
  });
});
