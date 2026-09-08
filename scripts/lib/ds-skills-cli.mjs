/**
 * Spawning the pinned CLI, kept apart from resolving it.
 *
 * `ds-skills.mjs` resolves and never spawns — that is what lets the pre-push
 * path check for the release without running anything. This module is the other
 * half: it runs the executable that resolution chose, and nothing else. There is
 * no fallback to an ambient binary and none to the retired local implementation.
 *
 * The §4.3 result contract, which the strictness below exists to honour:
 *
 *   exit 0  conformant   — a result on stdout
 *   exit 1  nonconformant — a result on stdout
 *   exit 2  could not evaluate — **no stdout**, diagnostics on stderr
 *
 * A caller that reads a missing result as an empty rail keeps CI green while the
 * gate is dead, so an unparseable or unexpected payload is an error here, never
 * a default.
 */
import { spawnSync } from 'node:child_process';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import { resolveDsSkills } from './ds-skills.mjs';

/** The result shape this consumer was written against. */
export const supportedResultVersion = '1';

/**
 * @param {string[]} args
 * @param {{ cwd?: string }} [options]
 * @returns {{ ok: boolean, status: number, stdout: string, stderr: string, message?: string }}
 */
export function runDsSkills(args, options = {}) {
  const resolved = resolveDsSkills({ repoRoot });
  if (!resolved.ok) {
    return { ok: false, status: 2, stdout: '', stderr: '', message: resolved.message };
  }

  const result = spawnSync(resolved.executable, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
  });
  if (result.error) {
    return {
      ok: false,
      status: 2,
      stdout: '',
      stderr: '',
      message: `${resolved.executable}: ${result.error.message}`,
    };
  }

  const status = typeof result.status === 'number' ? result.status : 2;
  return {
    ok: status === 0,
    status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/**
 * Runs a machine-readable command and returns its parsed result.
 *
 * @param {string[]} args command and options, without `--json`
 * @param {{ cwd?: string }} [options]
 * @returns {{ ok: true, result: any } | { ok: false, errors: string[] }}
 */
export function readDsSkillsResult(args, options = {}) {
  const run = runDsSkills([...args, '--json'], options);

  // Exit 2 is the absence of an answer, and it writes nothing to stdout.
  if (run.status === 2) {
    const detail = run.message ?? run.stderr.trim();
    return { ok: false, errors: [detail || `ds-skills ${args.join(' ')} could not evaluate`] };
  }

  let parsed;
  try {
    parsed = JSON.parse(run.stdout);
  } catch {
    return {
      ok: false,
      errors: [`ds-skills ${args.join(' ')} exited ${run.status} without a parseable result`],
    };
  }

  if (parsed?.resultVersion !== supportedResultVersion) {
    // Reading an unknown shape optimistically is how a caller reports a rail it
    // never actually understood.
    return {
      ok: false,
      errors: [
        `ds-skills ${args.join(' ')} returned resultVersion ${JSON.stringify(parsed?.resultVersion)}, ` +
          `this consumer reads ${supportedResultVersion}`,
      ],
    };
  }

  return { ok: true, result: parsed };
}
