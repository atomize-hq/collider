import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { acquireBootstrap } from '../../../scripts/lib/ds-skills-acquire.mjs';
import { readReleaseRecord, resolveDsSkills } from '../../../scripts/lib/ds-skills.mjs';

/**
 * T16b. Collider runs the ds-skills release named in `ds-skills.release.json`,
 * resolved at its version-specific path — never whatever `ds-skills` happens to
 * be on someone's PATH, and never something acquired mid-gate.
 *
 * Every negative case below is a way the pin could quietly stop pinning. The
 * positive case is only worth as much as those are.
 */
const repoRoot = path.resolve(__dirname, '../../..');
const record = readReleaseRecord(repoRoot) as {
  release: string;
  sourceCommit: string;
  repository: string;
  bootstrap: { asset: string; sha256: string };
};

const temporary: string[] = [];

function tmp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-skills-test-'));
  temporary.push(dir);
  return dir;
}

/** Build an install tree that looks exactly like an unpacked release payload. */
function plant(
  prefix: string,
  {
    release = record.release,
    sourceCommit = record.sourceCommit,
    skills = { release, sourceCommit },
    executable = true,
    identity = true,
    skillsIdentity = true,
  }: Partial<{
    release: string;
    sourceCommit: string;
    skills: { release: string; sourceCommit: string };
    executable: boolean;
    identity: boolean;
    skillsIdentity: boolean;
  }> = {}
): string {
  const home = path.join(prefix, record.release);
  fs.mkdirSync(path.join(home, 'lib', 'skills'), { recursive: true });
  fs.mkdirSync(path.join(home, 'bin'), { recursive: true });
  if (identity) {
    fs.writeFileSync(
      path.join(home, 'lib', 'release.json'),
      JSON.stringify({ release, sourceCommit, packageVersion: '0.0.0' })
    );
  }
  if (skillsIdentity) {
    fs.writeFileSync(path.join(home, 'lib', 'skills', 'RELEASE.json'), JSON.stringify(skills));
  }
  if (executable) {
    fs.writeFileSync(path.join(home, 'bin', 'ds-skills'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  }
  return home;
}

function resolve(prefix: string, env: Record<string, string | undefined> = {}) {
  return resolveDsSkills({ repoRoot, record, env: { DS_SKILLS_PREFIX: prefix, ...env } });
}

afterAll(() => {
  for (const dir of temporary) fs.rmSync(dir, { recursive: true, force: true });
});

describe('resolving the pinned ds-skills release', () => {
  it('resolves a payload whose stamped identity matches the reviewed record', () => {
    const prefix = tmp();
    const home = plant(prefix);
    const result = resolve(prefix);
    expect(result.ok).toBe(true);
    expect(result.executable).toBe(path.join(home, 'bin', 'ds-skills'));
    expect(result.skillsDir).toBe(path.join(home, 'lib', 'skills'));
  });

  it('fails closed when nothing is installed, and names the install command', () => {
    const result = resolve(tmp());
    expect(result.ok).toBe(false);
    expect(result.code).toBe('not-installed');
    expect(result.message).toContain('just ds-skills-install');
  });

  it('never consults PATH — an ambient ds-skills does not satisfy the pin', () => {
    // The failure this guards is not "the wrong binary ran". It is "a binary
    // nobody reviewed ran, and the gate went green because something answered".
    const elsewhere = tmp();
    fs.writeFileSync(path.join(elsewhere, 'ds-skills'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });

    const result = resolve(tmp(), { PATH: `${elsewhere}:${process.env.PATH ?? ''}` });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('not-installed');
    expect(result.executable).not.toContain(elsewhere);
  });

  it('rejects an install that is a different release than the reviewed one', () => {
    const prefix = tmp();
    plant(prefix, { release: 'v0.3.0', sourceCommit: 'a'.repeat(40) });
    const result = resolve(prefix);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('identity-mismatch');
    expect(result.message).toContain('v0.3.0');
  });

  it('rejects a matching release built from a different commit', () => {
    // Same tag, different bytes. A version string alone cannot tell these apart,
    // which is why the record pins the commit as well.
    const prefix = tmp();
    plant(prefix, { sourceCommit: 'b'.repeat(40) });
    const result = resolve(prefix);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('identity-mismatch');
  });

  it('rejects CLI/skill skew inside one install', () => {
    const prefix = tmp();
    plant(prefix, { skills: { release: 'v0.3.0', sourceCommit: 'c'.repeat(40) } });
    const result = resolve(prefix);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('skill-skew');
  });

  it('rejects a tree carrying no identity at all', () => {
    // What a half-restored cache looks like: the directory is there, so an
    // existence check would pass. Identity is the check that does not.
    const prefix = tmp();
    plant(prefix, { identity: false });
    const result = resolve(prefix);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('identity-missing');
  });

  it('rejects an identified tree with no executable', () => {
    const prefix = tmp();
    plant(prefix, { executable: false });
    const result = resolve(prefix);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('executable-missing');
  });

  it('fails an unsupported platform with the supported list, not a download', () => {
    expect(() =>
      resolveDsSkills({ repoRoot, record, platform: 'sunos', arch: 'sparc', env: {} })
    ).toThrowError(/macos_arm64/);
  });

  it('refuses a record missing a required field rather than defaulting', () => {
    const fake = tmp();
    fs.writeFileSync(
      path.join(fake, 'ds-skills.release.json'),
      JSON.stringify({ repository: 'atomize-hq/ds-skills', release: 'v0.4.0' })
    );
    expect(() => readReleaseRecord(fake)).toThrowError(/sourceCommit/);
  });
});

describe('acquiring the pinned release', () => {
  const bootstrapBytes = Buffer.from('#!/usr/bin/env bash\necho installed\n');

  function attempt(bytes: Buffer, overrides: Record<string, unknown> = {}) {
    const executed: string[] = [];
    const fetched: string[] = [];
    const promise = acquireBootstrap({
      record,
      prefix: tmp(),
      platform: 'linux',
      fetchBytes: async (url: string) => {
        fetched.push(url);
        return bytes;
      },
      run: (file: string) => {
        executed.push(file);
      },
      ...overrides,
    }) as Promise<unknown>;
    return { promise, executed, fetched };
  }

  it('fetches the bootstrap from the pinned release URL, unauthenticated', async () => {
    const { promise, fetched } = attempt(bootstrapBytes);
    await promise.catch(() => undefined);
    expect(fetched).toEqual([
      `https://github.com/${record.repository}/releases/download/${record.release}/${record.bootstrap.asset}`,
    ]);
  });

  it('does not execute a bootstrap whose bytes fail the reviewed digest', async () => {
    // The claim is the ordering, so the assertion is that execution was never
    // *reached* — not that it failed. An exit code alone cannot tell those apart.
    const { promise, executed } = attempt(bootstrapBytes);
    await expect(promise).rejects.toThrow(/does not match the digest reviewed/);
    expect(executed).toEqual([]);
  });

  it('names both digests in the failure, so a mismatch is diagnosable', async () => {
    const { promise } = attempt(bootstrapBytes);
    const error = await promise.catch((thrown: Error) => thrown);
    expect((error as Error).message).toContain(record.bootstrap.sha256);
    expect((error as Error).message).toContain(
      crypto.createHash('sha256').update(bootstrapBytes).digest('hex')
    );
    expect((error as Error).message).toContain('Nothing was executed');
  });

  it('executes a bootstrap whose bytes match the reviewed digest', async () => {
    // The inverse control. Without it, the test above passes for a function that
    // never executes anything at all.
    const matching = Buffer.from('#!/usr/bin/env bash\nexit 0\n');
    const digest = crypto.createHash('sha256').update(matching).digest('hex');
    const { promise, executed } = attempt(matching, {
      record: { ...record, bootstrap: { ...record.bootstrap, sha256: digest } },
    });
    await expect(promise).resolves.toMatchObject({ asset: record.bootstrap.asset, digest });
    expect(executed).toHaveLength(1);
  });

  it('leaves no verified-or-unverified bootstrap behind on disk', async () => {
    const seen: string[] = [];
    const matching = Buffer.from('#!/usr/bin/env bash\nexit 0\n');
    const digest = crypto.createHash('sha256').update(matching).digest('hex');
    const { promise } = attempt(matching, {
      record: { ...record, bootstrap: { ...record.bootstrap, sha256: digest } },
      run: (file: string) => {
        seen.push(file);
      },
    });
    await promise;
    expect(seen).toHaveLength(1);
    expect(fs.existsSync(seen[0])).toBe(false);
  });

  it('selects the PowerShell bootstrap on Windows', async () => {
    const { promise, fetched } = attempt(bootstrapBytes, { platform: 'win32' });
    await promise.catch(() => undefined);
    expect(fetched[0]).toContain('install.ps1');
  });
});

describe('the provisioning entry point', () => {
  function run(prefix: string, flags: string[] = []) {
    try {
      return {
        status: 0,
        output: execFileSync(
          process.execPath,
          [path.join(repoRoot, 'scripts/install-ds-skills.mjs'), ...flags],
          {
            encoding: 'utf8',
            env: { ...process.env, DS_SKILLS_PREFIX: prefix },
            stdio: ['ignore', 'pipe', 'pipe'],
          }
        ),
      };
    } catch (error) {
      const failure = error as { status: number; stdout?: string; stderr?: string };
      return { status: failure.status, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}` };
    }
  }

  it('--check acquires nothing when the release is absent', () => {
    // The pre-push path (§10.7). A gate that installs on demand turns a network
    // outage into a failing push.
    const prefix = tmp();
    const result = run(prefix, ['--check']);
    expect(result.status).toBe(1);
    expect(result.output).toContain('just ds-skills-install');
    expect(result.output).not.toContain('fetching');
    expect(fs.readdirSync(prefix)).toEqual([]);
  });

  it('acquires nothing when the release is already provisioned', () => {
    const prefix = tmp();
    plant(prefix);
    const result = run(prefix);
    expect(result.status).toBe(0);
    expect(result.output).toContain('already provisioned');
    expect(result.output).not.toContain('fetching');
  });

  it('--print emits only the executable path, for a caller to bind to', () => {
    const prefix = tmp();
    const home = plant(prefix);
    const result = run(prefix, ['--print']);
    expect(result.status).toBe(0);
    expect(result.output.trim()).toBe(path.join(home, 'bin', 'ds-skills'));
  });
});

describe('the pre-push path acquires nothing', () => {
  /**
   * §10.7: the local gate must not reach the network. A pre-push hook that
   * installs on demand turns a flaky connection into a failing push, and turns
   * "the gate passed" into "the gate passed, with whatever it fetched today".
   *
   * This walks what `just preflight` actually reaches rather than reading the
   * recipe that happens to be named preflight — the acquisition could be added
   * three recipes deep and the one-line check would still be green.
   */
  const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
  const packageScripts = (
    JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    }
  ).scripts;

  function recipeBody(name: string): string[] {
    const pattern = new RegExp(`^${name}(?: [^:\\n]*)?:.*$\\n((?:^(?:\\s+.*)?$\\n)*)`, 'm');
    const match = justfile.match(pattern);
    if (!match) return [];
    const header = justfile.match(new RegExp(`^${name}(?: [^:\\n]*)?:(.*)$`, 'm'));
    const dependencies = (header?.[1] ?? '').trim().split(/\s+/).filter(Boolean);
    return [...dependencies.map((d) => `just ${d}`), ...match[1].split('\n')];
  }

  function reachableCommands(): string[] {
    const seen = new Set<string>();
    const commands: string[] = [];
    const queue = ['preflight'];
    while (queue.length > 0) {
      const recipe = queue.shift() as string;
      if (seen.has(recipe)) continue;
      seen.add(recipe);
      for (const rawLine of recipeBody(recipe)) {
        const line = rawLine.trim().replace(/^@/, '');
        if (!line || line.startsWith('#') || line.startsWith('echo ')) continue;
        commands.push(line);
        const nested = line.match(/^just\s+([\w:-]+)/);
        if (nested) queue.push(nested[1]);
        const script = line.match(/^pnpm\s+(?:run\s+)?([\w:-]+)/);
        if (script && packageScripts[script[1]]) commands.push(packageScripts[script[1]]);
      }
    }
    return commands;
  }

  it('reaches preflight through the recipe graph, not just its first line', () => {
    // Inverse control for the walk itself: a traversal that found nothing would
    // satisfy every assertion below by vacuum.
    const commands = reachableCommands();
    expect(commands).toContain('pnpm govern:tokens');
    expect(commands).toContain('node scripts/govern-tokens.mjs');
    expect(commands.length).toBeGreaterThan(10);
  });

  it('runs no command that would acquire ds-skills', () => {
    const acquiring = reachableCommands().filter(
      (command) =>
        /install-ds-skills|ds-skills:install/.test(command) && !command.includes('--check')
    );
    expect(acquiring).toEqual([]);
  });
});

describe('the release ships skills that Collider has not activated', () => {
  /**
   * T16b stages the approved release's skill assets; T17 is what switches
   * discovery onto them. Until then Collider must still resolve its skills from
   * the frozen in-repo snapshot — a half-flipped state, where some skills come
   * from the install and some from the checkout, is the split authority this
   * migration exists to end.
   */
  it('resolves its own skills from the checkout, not from an install prefix', () => {
    const local = path.join(repoRoot, '.agents', 'skills');
    expect(fs.existsSync(local)).toBe(true);
    expect(fs.lstatSync(local).isSymbolicLink()).toBe(false);
  });

  it('names no install-prefix path in any skill or agent instruction', () => {
    const roots = [path.join(repoRoot, '.agents'), path.join(repoRoot, 'docs')];
    const offenders: string[] = [];
    for (const root of roots) {
      const stack = [root];
      while (stack.length > 0) {
        const dir = stack.pop() as string;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) stack.push(full);
          else if (/\.(md|json|mjs)$/.test(entry.name)) {
            const text = fs.readFileSync(full, 'utf8');
            // A doc may *describe* the prefix; what it may not do is instruct a
            // reader to run skills from there while the checkout still owns them.
            if (/ds-skills\/v[\d.]+\/lib\/skills/.test(text)) offenders.push(full);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
