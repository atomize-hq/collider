/**
 * Resolve the pinned `ds-skills` executable from the reviewed release record.
 *
 * SPEC.md §10.6: Collider resolves the binary from the reviewed record's version
 * at the version-specific path, **never from PATH**. An ambient `ds-skills` on a
 * developer's machine must not be able to satisfy a gate — and must not be
 * executed at all, not even to read its version. Running an unknown binary to
 * decide whether to trust it is not a check.
 *
 * So identity is read from a FILE the payload carries (`release.json`, stamped
 * at staging time), never from a subprocess. That is the whole reason this
 * module never spawns anything.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const RECORD_FILENAME = 'ds-skills.release.json';

/** The command a human should run when resolution fails. One string, one place. */
export const INSTALL_COMMAND = 'just ds-skills-install';

const REQUIRED_RECORD_KEYS = ['repository', 'release', 'sourceCommit', 'bootstrap', 'assets'];

/**
 * Read and shape-check the record. A malformed record fails loudly; it never
 * falls back to a default, because a default here would silently un-pin the
 * toolchain this file exists to pin.
 */
/**
 * @param {string} repoRoot
 * @returns {any}
 */
export function readReleaseRecord(repoRoot) {
  const file = path.join(repoRoot, RECORD_FILENAME);
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    throw new DsSkillsError('record-missing', `no ${RECORD_FILENAME} at ${file}`);
  }
  let record;
  try {
    record = JSON.parse(raw);
  } catch (error) {
    throw new DsSkillsError(
      'record-malformed',
      `${RECORD_FILENAME} is not valid JSON: ${error.message}`
    );
  }
  const missing = REQUIRED_RECORD_KEYS.filter((key) => record[key] === undefined);
  if (missing.length > 0) {
    throw new DsSkillsError(
      'record-malformed',
      `${RECORD_FILENAME} is missing: ${missing.join(', ')}`
    );
  }
  return record;
}

/**
 * Map a Node platform/arch pair onto the record's asset keys — the same
 * selection contract the installers implement (§10.5). An unlisted pair fails
 * with the supported list rather than resolving to something that will not run.
 */
/**
 * @param {{ assets: Record<string, unknown> }} record
 * @param {string} [platform]
 * @param {string} [arch]
 * @returns {string}
 */
export function platformKey(record, platform = process.platform, arch = process.arch) {
  const osName = { darwin: 'macos', linux: 'linux', win32: 'windows' }[platform];
  const archName = { arm64: 'arm64', x64: 'x86_64' }[arch];
  const supported = Object.keys(record.assets).sort().join(', ');
  if (!osName || !archName) {
    throw new DsSkillsError(
      'unsupported-platform',
      `ds-skills publishes no asset for ${platform}/${arch}. Supported: ${supported}`
    );
  }
  // Windows ships only x86_64; arm64 Windows runs it under emulation, which is
  // a claim nobody has tested, so it is not offered.
  const key = osName === 'windows' ? 'windows_x86_64' : `${osName}_${archName}`;
  if (!record.assets[key]) {
    throw new DsSkillsError(
      'unsupported-platform',
      `ds-skills publishes no asset for ${platform}/${arch} (${key}). Supported: ${supported}`
    );
  }
  return key;
}

/**
 * §10.6's install locations. `DS_SKILLS_PREFIX` wins because CI installs into a
 * job-local prefix under the runner temp dir — that is a location choice, not an
 * escape hatch: the version-specific subdirectory and the identity check below
 * apply to it exactly as they do to the default.
 */
/**
 * @param {Record<string, string | undefined>} [env]
 * @param {string} [platform]
 * @returns {string}
 */
export function installPrefix(env = process.env, platform = process.platform) {
  if (env.DS_SKILLS_PREFIX) return env.DS_SKILLS_PREFIX;
  if (platform === 'win32') {
    const local = env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local');
    return path.join(local, 'ds-skills');
  }
  return path.join(env.HOME ?? os.homedir(), '.local', 'share', 'ds-skills');
}

/**
 * @param {string} [platform]
 * @returns {string}
 */
export function executableName(platform = process.platform) {
  return platform === 'win32' ? 'ds-skills.cmd' : 'ds-skills';
}

/**
 * Resolve, or explain. Returns `{ ok: false, code, message }` rather than
 * throwing for the *expected* failures — a caller that gates CI wants to print
 * the install command, not a stack trace. Only a broken record throws.
 */
/**
 * @param {{
 *   repoRoot?: string,
 *   env?: Record<string, string | undefined>,
 *   platform?: string,
 *   arch?: string,
 *   record?: any,
 * }} [options]
 * @returns {{
 *   ok: boolean, code: string, release: string, prefix: string, home: string,
 *   executable: string, message?: string, sourceCommit?: string, skillsDir?: string,
 * }}
 */
export function resolveDsSkills({
  repoRoot,
  env = process.env,
  platform = process.platform,
  arch = process.arch,
  record,
} = {}) {
  const resolved = record ?? readReleaseRecord(repoRoot);
  platformKey(resolved, platform, arch);

  const prefix = installPrefix(env, platform);
  const home = path.join(prefix, resolved.release);
  const executable = path.join(home, 'bin', executableName(platform));
  const context = { release: resolved.release, prefix, home, executable };

  if (!fs.existsSync(home)) {
    return fail(
      'not-installed',
      `ds-skills ${resolved.release} is not installed at ${home}.`,
      context
    );
  }

  // Identity comes from files the payload carries, stamped at staging time.
  // Reading a file is not executing a binary — that distinction is the point
  // (§10.6). The payload unpacks as bin/ + lib/, with the package root at lib/.
  const identity = readIdentity(path.join(home, 'lib', 'release.json'));
  if (!identity) {
    return fail(
      'identity-missing',
      `${home} exists but carries no readable lib/release.json, so it cannot be identified as ${resolved.release}.`,
      context
    );
  }
  if (identity.release !== resolved.release || identity.sourceCommit !== resolved.sourceCommit) {
    return fail(
      'identity-mismatch',
      `the install at ${home} identifies itself as ${identity.release} (${identity.sourceCommit ?? 'no commit'}), ` +
        `not the reviewed ${resolved.release} (${resolved.sourceCommit}).`,
      context
    );
  }

  // §10.6: the CLI and its materialized skills share one release identity and
  // refuse to run mismatched. The skills travel — a consumer materializes them
  // elsewhere — so the copy carries its own provenance, and skew is only
  // detectable if someone compares the two. This is that someone.
  const skills = readIdentity(path.join(home, 'lib', 'skills', 'RELEASE.json'));
  if (!skills) {
    return fail(
      'skills-missing',
      `${home} carries no readable lib/skills/RELEASE.json, so its skill assets cannot be identified.`,
      context
    );
  }
  if (skills.release !== identity.release || skills.sourceCommit !== identity.sourceCommit) {
    return fail(
      'skill-skew',
      `the install at ${home} pairs CLI ${identity.release} (${identity.sourceCommit}) with skills ` +
        `${skills.release} (${skills.sourceCommit}). One release identity, or neither is trustworthy.`,
      context
    );
  }
  if (!fs.existsSync(executable)) {
    return fail('executable-missing', `no executable at ${executable}.`, context);
  }

  return {
    ok: true,
    code: 'resolved',
    ...context,
    sourceCommit: identity.sourceCommit,
    skillsDir: path.join(home, 'lib', 'skills'),
  };
}

function readIdentity(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function fail(code, detail, context) {
  return {
    ok: false,
    code,
    ...context,
    message: `${detail}\nCollider runs the ds-skills release pinned in ${RECORD_FILENAME} and never one from PATH.\nInstall it with:\n  ${INSTALL_COMMAND}`,
  };
}

export class DsSkillsError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DsSkillsError';
    this.code = code;
  }
}
