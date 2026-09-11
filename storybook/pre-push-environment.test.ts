import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = path.resolve(__dirname, '..');
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function fixtureEnv(
  root: string,
  extra: Record<string, string | undefined> = {}
): NodeJS.ProcessEnv {
  return {
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))),
    ...extra,
    HOME: path.join(root, 'home'),
    XDG_CONFIG_HOME: path.join(root, 'config'),
    GIT_CONFIG_NOSYSTEM: '1',
    NODE_ENV: process.env.NODE_ENV ?? 'test',
  };
}

function git(
  root: string,
  cwd: string,
  args: string[],
  extra?: Record<string, string | undefined>
) {
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: fixtureEnv(root, extra),
  });
}

function mustGit(
  root: string,
  cwd: string,
  args: string[],
  extra?: Record<string, string | undefined>
) {
  const result = git(root, cwd, args, extra);
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

function writeFakeJust(bin: string) {
  fs.mkdirSync(bin, { recursive: true });
  const fake = path.join(bin, 'just');
  fs.writeFileSync(
    fake,
    `#!/bin/sh
set -eu
[ "$#" -eq 1 ] && [ "$1" = preflight ] || exit 70
[ "\${NONLOCAL_SENTINEL-}" = retained ] || exit 72
for name in $(git rev-parse --local-env-vars); do
  eval "value=\\\${$name-}"
  [ -z "$value" ] || exit 73
done
mkdir -p "$HOOK_NESTED"
nested=$(mktemp -d "$HOOK_NESTED/nested.XXXXXX")
git init "$nested" >/dev/null
git -C "$nested" config user.email fixture@example.invalid
git -C "$nested" config user.name Fixture
echo nested > "$nested/file"
git -C "$nested" add file
git -C "$nested" commit -m nested >/dev/null
test "$(git -C "$nested" rev-parse --is-inside-work-tree)" = true
test "$(git -C "$nested" config --get core.bare)" = false
exit_code="\${FAKE_JUST_EXIT:-0}"
printf '%s|%s|%s|%s|%s|%s\\n' "$1" "$PWD" "$NONLOCAL_SENTINEL" local-git-env-cleared "$HOOK_INVOCATION" "$exit_code" >> "$HOOK_RECORD"
exit "$exit_code"
`
  );
  fs.chmodSync(fake, 0o755);
}

function indexBytes(root: string, checkout: string) {
  return fs.readFileSync(
    path.resolve(checkout, mustGit(root, checkout, ['rev-parse', '--git-path', 'index']))
  );
}

function snapshot(root: string, main: string, checkout: string) {
  const common = mustGit(root, main, ['rev-parse', '--git-common-dir']);
  return {
    commonConfig: fs.readFileSync(path.join(path.resolve(main, common), 'config')),
    main: { head: mustGit(root, main, ['rev-parse', 'HEAD']), index: indexBytes(root, main) },
    checkout: {
      head: mustGit(root, checkout, ['rev-parse', 'HEAD']),
      index: indexBytes(root, checkout),
    },
  };
}

function expectSnapshot(
  root: string,
  main: string,
  checkout: string,
  before: ReturnType<typeof snapshot>
) {
  expect(snapshot(root, main, checkout)).toEqual(before);
  expect(mustGit(root, main, ['config', '--get', 'core.bare'])).toBe('false');
}

function remoteGit(root: string, remote: string, args: string[]) {
  return git(root, root, ['--git-dir', remote, ...args]);
}

function push(root: string, checkout: string, ref: string, invocation: string, gateExit?: string) {
  const bin = path.join(root, 'bin');
  return git(root, checkout, ['push', 'origin', `HEAD:${ref}`], {
    PATH: `${bin}:${process.env.PATH}`,
    HOOK_RECORD: path.join(root, 'preflight.log'),
    HOOK_NESTED: path.join(root, 'nested'),
    HOOK_INVOCATION: invocation,
    NONLOCAL_SENTINEL: 'retained',
    ...(gateExit ? { FAKE_JUST_EXIT: gateExit } : {}),
  });
}

function exercise(kind: 'normal' | 'linked') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `collider-pre-push-${kind}-`));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'home'), { recursive: true });
  const remote = path.join(root, 'remote.git');
  const main = path.join(root, 'main');
  const hooks = path.join(root, 'hooks');
  writeFakeJust(path.join(root, 'bin'));
  fs.mkdirSync(hooks, { recursive: true });
  fs.copyFileSync(path.join(repoRoot, '.husky/pre-push'), path.join(hooks, 'pre-push'));
  fs.chmodSync(path.join(hooks, 'pre-push'), 0o755);
  mustGit(root, root, ['init', '--bare', remote]);
  mustGit(root, root, ['init', main]);
  mustGit(root, main, ['config', 'user.email', 'fixture@example.invalid']);
  mustGit(root, main, ['config', 'user.name', 'Fixture']);
  fs.writeFileSync(path.join(main, 'seed'), 'seed\n');
  mustGit(root, main, ['add', 'seed']);
  mustGit(root, main, ['commit', '-m', 'seed']);
  mustGit(root, main, ['remote', 'add', 'origin', remote]);
  mustGit(root, main, ['config', 'extensions.worktreeConfig', 'true']);
  mustGit(root, main, ['config', '--worktree', 'core.hooksPath', hooks]);
  const checkout =
    kind === 'normal'
      ? main
      : (() => {
          const linked = path.join(root, 'linked');
          mustGit(root, main, ['worktree', 'add', '--detach', linked]);
          mustGit(root, linked, ['config', '--worktree', 'core.hooksPath', hooks]);
          return linked;
        })();
  const before = snapshot(root, main, checkout);
  const passRef = `refs/heads/${kind}-pass`;
  const source = mustGit(root, checkout, ['rev-parse', 'HEAD']);
  const first = push(root, checkout, passRef, 'pass');
  expect(first.status, first.stderr).toBe(0);
  const passed = remoteGit(root, remote, ['rev-parse', passRef]);
  expect(passed.status, passed.stderr).toBe(0);
  expect(passed.stdout.trim()).toBe(source);
  expectSnapshot(root, main, checkout, before);
  const refusedRef = `refs/heads/${kind}-refused`;
  const refused = push(root, checkout, refusedRef, 'refused', '71');
  expect(refused.status, refused.stderr).not.toBe(0);
  const absent = remoteGit(root, remote, ['show-ref', '--verify', '--quiet', refusedRef]);
  expect(absent.status, absent.stderr).toBe(1);
  expect(fs.readFileSync(path.join(root, 'preflight.log'), 'utf8').trim().split('\n')).toEqual([
    `preflight|${fs.realpathSync(checkout)}|retained|local-git-env-cleared|pass|0`,
    `preflight|${fs.realpathSync(checkout)}|retained|local-git-env-cleared|refused|71`,
  ]);
  expectSnapshot(root, main, checkout, before);
}

describe('pre-push Git environment isolation', () => {
  it.each(['normal', 'linked'] as const)(
    'runs the actual hook safely from a $0 worktree and refuses failed gates',
    (kind) => exercise(kind)
  );
});
