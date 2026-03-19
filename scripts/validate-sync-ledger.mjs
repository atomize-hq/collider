#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-sync-ledger.mjs <path-to-sync-ledger.json>');
  process.exit(1);
}

const abs = path.resolve(target);
const raw = fs.readFileSync(abs, 'utf8');
const data = JSON.parse(raw);

function assert(cond, message) {
  if (!cond) {
    throw new Error(message);
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  assert(isPlainObject(value), `${label} must be an object`);
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  assert(
    actualKeys.length === sortedExpectedKeys.length &&
      actualKeys.every((key, index) => key === sortedExpectedKeys[index]),
    `${label} must only contain: ${sortedExpectedKeys.join(', ')}`
  );
}

function isRepoRelativePath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.startsWith('./') &&
    !value.startsWith('../')
  );
}

function isIsoUtcTimestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  ) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function isValidFigmaReference(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    (value.startsWith('figma://file/') ||
      /^https:\/\/www\.figma\.com\/(?:design|file)\//.test(value))
  );
}

const rootKeys = ['ledgerVersion', 'scope', 'name', 'links', 'status', 'drift'];
const linkKeys = ['figmaFile', 'artifact', 'policy', 'parityPolicy'];
const statusRequiredKeys = [
  'syncMode',
  'artifactPath',
  'artifactGitSha',
  'themeIds',
  'themeMapping',
  'parityMode',
  'lastSuccessfulPullAt',
  'canonicalSource',
];
const driftKeys = ['code', 'severity', 'message', 'status', 'field'];
const severityValues = new Set(['info', 'warn', 'error']);
const driftStatusValues = new Set(['open', 'resolved']);
const parityModes = new Set(['deferred', 'required']);

assertExactKeys(data, rootKeys, 'sync ledger');
assert(data.ledgerVersion === '1', 'ledgerVersion must be "1"');
assert(data.scope === 'figma-pilot', 'scope must be "figma-pilot"');
assert(typeof data.name === 'string' && data.name.trim().length > 0, 'name is required');

assertExactKeys(data.links, linkKeys, 'links');
assert(
  isValidFigmaReference(data.links.figmaFile),
  'links.figmaFile must be a Figma URL or figma://file reference'
);
assert(
  data.links.artifact === 'design-tokens/dist/figma/tokens.json',
  'links.artifact must be "design-tokens/dist/figma/tokens.json"'
);
assert(data.links.policy === 'src/figma/README.md', 'links.policy must be "src/figma/README.md"');
assert(
  data.links.parityPolicy === 'src/figma/parity-policy.md',
  'links.parityPolicy must be "src/figma/parity-policy.md"'
);
assert(isRepoRelativePath(data.links.artifact), 'links.artifact must be repo-relative');
assert(isRepoRelativePath(data.links.policy), 'links.policy must be repo-relative');
assert(isRepoRelativePath(data.links.parityPolicy), 'links.parityPolicy must be repo-relative');

assert(isPlainObject(data.status), 'status must be an object');
const statusKeys = Object.keys(data.status);
for (const requiredKey of statusRequiredKeys) {
  assert(requiredKey in data.status, `status.${requiredKey} is required`);
}
const allowedStatusKeys = new Set([...statusRequiredKeys, 'parityDeferredReason']);
assert(
  statusKeys.every((key) => allowedStatusKeys.has(key)),
  `status contains unknown keys; allowed keys are: ${[...allowedStatusKeys].join(', ')}`
);
assert(data.status.syncMode === 'pull-url-readonly', 'status.syncMode must be "pull-url-readonly"');
assert(
  data.status.artifactPath === 'design-tokens/dist/figma/tokens.json',
  'status.artifactPath must be "design-tokens/dist/figma/tokens.json"'
);
assert(
  typeof data.status.artifactGitSha === 'string' &&
    /^[0-9a-f]{40}$/.test(data.status.artifactGitSha),
  'status.artifactGitSha must be a 40-character lowercase git SHA'
);
assert(data.status.canonicalSource === 'repo-pr', 'status.canonicalSource must be "repo-pr"');
assert(
  parityModes.has(data.status.parityMode),
  'status.parityMode must be "deferred" or "required"'
);
assert(
  Array.isArray(data.status.themeIds) &&
    data.status.themeIds.length > 0 &&
    data.status.themeIds.every(
      (themeId) => typeof themeId === 'string' && themeId.trim().length > 0
    ),
  'status.themeIds must be a non-empty array of non-empty strings'
);

const uniqueThemeIds = new Set(data.status.themeIds);
assert(uniqueThemeIds.size === data.status.themeIds.length, 'status.themeIds must be unique');
assert(uniqueThemeIds.has('dark'), 'status.themeIds must include "dark"');

assert(
  Array.isArray(data.status.themeMapping) && data.status.themeMapping.length > 0,
  'status.themeMapping must be a non-empty array'
);

for (const [index, mapping] of data.status.themeMapping.entries()) {
  assert(isPlainObject(mapping), `status.themeMapping[${index}] must be an object`);
  assertExactKeys(mapping, ['themeId', 'figmaMode'], `status.themeMapping[${index}]`);
  assert(
    typeof mapping.themeId === 'string' && mapping.themeId.trim().length > 0,
    `status.themeMapping[${index}].themeId is required`
  );
  assert(
    typeof mapping.figmaMode === 'string' && mapping.figmaMode.trim().length > 0,
    `status.themeMapping[${index}].figmaMode is required`
  );
  assert(
    uniqueThemeIds.has(mapping.themeId),
    `status.themeMapping[${index}].themeId must exist in status.themeIds`
  );
}

const mappedThemeIds = new Set(data.status.themeMapping.map((mapping) => mapping.themeId));
assert(
  mappedThemeIds.size === data.status.themeIds.length,
  'status.themeMapping must include exactly one entry per status.themeIds item'
);

if (data.status.parityMode === 'deferred') {
  assert(
    'parityDeferredReason' in data.status &&
      typeof data.status.parityDeferredReason === 'string' &&
      data.status.parityDeferredReason.trim().length > 0,
    'status.parityDeferredReason is required when status.parityMode is "deferred"'
  );
} else {
  assert(
    !('parityDeferredReason' in data.status),
    'status.parityDeferredReason must be omitted when status.parityMode is "required"'
  );
}

assert(
  data.status.lastSuccessfulPullAt === null || isIsoUtcTimestamp(data.status.lastSuccessfulPullAt),
  'status.lastSuccessfulPullAt must be null or an ISO-8601 UTC timestamp'
);

assert(Array.isArray(data.drift), 'drift must be an array');
for (const [index, entry] of data.drift.entries()) {
  assert(isPlainObject(entry), `drift[${index}] must be an object`);
  const entryKeys = Object.keys(entry);
  assert(
    entryKeys.every((key) => driftKeys.includes(key)),
    `drift[${index}] contains unknown keys`
  );
  for (const requiredKey of ['code', 'severity', 'message', 'status']) {
    assert(requiredKey in entry, `drift[${index}].${requiredKey} is required`);
  }
  assert(
    typeof entry.code === 'string' && entry.code.trim().length > 0,
    `drift[${index}].code is required`
  );
  assert(
    typeof entry.message === 'string' && entry.message.trim().length > 0,
    `drift[${index}].message is required`
  );
  assert(
    severityValues.has(entry.severity),
    `drift[${index}].severity must be one of: ${[...severityValues].join(', ')}`
  );
  assert(
    driftStatusValues.has(entry.status),
    `drift[${index}].status must be one of: ${[...driftStatusValues].join(', ')}`
  );
  if ('field' in entry) {
    assert(
      typeof entry.field === 'string' && entry.field.trim().length > 0,
      `drift[${index}].field must be a non-empty string when present`
    );
  }
}

console.log(`✓ Sync ledger is structurally valid: ${abs}`);
