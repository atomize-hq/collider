import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const recipe = readFileSync(new URL('../justfile', import.meta.url), 'utf8');
const invocation = recipe.match(/node scripts\/validate-loc\.mjs ts (\d+) (\d+)/);
const checker = new URL('./validate-loc.mjs', import.meta.url);

function check(tsx, ts, name = 'src/component.tsx') {
  return spawnSync(process.execPath, [checker.pathname, 'ts', ...invocation.slice(1)], {
    encoding: 'utf8',
    input: JSON.stringify({
      TSX: { reports: [{ name, stats: { code: tsx } }] },
      TypeScript: { reports: [{ name: 'src/model.ts', stats: { code: ts } }] },
    }),
  });
}

test('normal LOC recipe enforces the published TSX-200 / TS-300 boundary', () => {
  assert.ok(invocation, 'normal recipe must call the existing checker');
  assert.deepEqual(invocation.slice(1), ['200', '300']);
  assert.equal(check(200, 300).status, 0);
  const tsx = check(201, 300);
  assert.equal(tsx.status, 1);
  assert.match(tsx.stderr, /TSX LOC guard failed \(max 200/);
  const ts = check(200, 301);
  assert.equal(ts.status, 1);
  assert.match(ts.stderr, /TypeScript LOC guard failed \(max 300/);
});

test('existing test and story exclusions are preserved', () => {
  for (const file of ['src/control.test.tsx', 'src/control.spec.tsx', 'src/control.stories.tsx']) {
    assert.equal(check(301, 300, file).status, 0);
  }
});
