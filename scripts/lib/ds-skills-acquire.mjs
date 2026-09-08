/**
 * Acquire the pinned ds-skills bootstrap: fetch, verify, and only then execute.
 *
 * The ordering is the entire point (SPEC.md §10.3). Bytes that do not match the
 * digest in the reviewed record must never reach a runnable file, let alone a
 * shell. Transport and execution are injected so a test can assert that the
 * execution step was **not reached**, rather than inferring it from an exit code
 * a mismatch would produce either way.
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DsSkillsError } from './ds-skills.mjs';

/**
 * @param {any} record
 * @param {string} [platform]
 * @returns {{ asset: string, sha256: string }}
 */
export function bootstrapFor(record, platform = process.platform) {
  const bootstrap = platform === 'win32' ? record.bootstrapPowershell : record.bootstrap;
  if (!bootstrap) {
    throw new DsSkillsError('no-bootstrap', `the record names no bootstrap for ${platform}`);
  }
  return bootstrap;
}

/**
 * @param {{ repository: string, release: string }} record
 * @returns {string}
 */
export function releaseBaseUrl(record) {
  return `https://github.com/${record.repository}/releases/download/${record.release}`;
}

/**
 * @param {{
 *   record: any,
 *   prefix: string,
 *   platform?: string,
 *   baseUrl?: string,
 *   fetchBytes?: (url: string) => Promise<Buffer>,
 *   run?: (file: string, prefix: string, platform: string) => void,
 *   note?: (line: string) => void,
 * }} options
 * @returns {Promise<{ asset: string, url: string, digest: string }>}
 */
export async function acquireBootstrap({
  record,
  prefix,
  platform = process.platform,
  baseUrl,
  fetchBytes = downloadBytes,
  run = execute,
  note = () => {},
}) {
  const bootstrap = bootstrapFor(record, platform);
  // A mirror may serve the bytes; it may not change them. The digest compared
  // below is the reviewed one either way, which is what makes the override safe.
  const url = `${baseUrl ?? releaseBaseUrl(record)}/${bootstrap.asset}`;

  note(`fetching ${url}`);
  const bytes = await fetchBytes(url);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');

  if (digest !== bootstrap.sha256) {
    throw new DsSkillsError(
      'bootstrap-digest-mismatch',
      `${bootstrap.asset} does not match the digest reviewed in ds-skills.release.json.\n` +
        `  expected ${bootstrap.sha256}\n  actual   ${digest}\n` +
        'Nothing was executed and nothing was installed.'
    );
  }
  note(`verified ${bootstrap.asset} against the reviewed record`);

  // Only now does anything touch disk in an executable form. Writing after
  // verifying, rather than before, keeps unverified bytes from ever existing as
  // a runnable file.
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-skills-install-'));
  const file = path.join(work, bootstrap.asset);
  try {
    fs.writeFileSync(file, bytes, { mode: 0o700 });
    run(file, prefix, platform);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
  return { asset: bootstrap.asset, url, digest };
}

/** @param {string} url @returns {Promise<Buffer>} */
async function downloadBytes(url) {
  // No authentication is sent. The release is public, and a token here would
  // mean the path we test is not the path a fresh clone takes.
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new DsSkillsError(
      'download-failed',
      `could not download ${url} (HTTP ${response.status})`
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

/** @param {string} file @param {string} prefix @param {string} platform */
function execute(file, prefix, platform) {
  const [command, args] =
    platform === 'win32'
      ? ['powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', file]]
      : ['bash', [file]];
  execFileSync(command, args, {
    env: { ...process.env, DS_SKILLS_PREFIX: prefix },
    stdio: 'inherit',
  });
}
