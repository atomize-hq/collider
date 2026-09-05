#!/usr/bin/env node
// Pins what upstream looked like when we last compared against it.
//
// Every earlier comparison in this repo ran against unversioned registry URLs, which
// makes a finding true on the day it was measured and unreproducible after.
//
// Two rules here exist because of a specific mistake. An earlier version probed
// `registry.ai-sdk.dev`, which answers and serves a SUBSET: ~20 of our components
// resolved and the rest 404'd, which reads exactly like "upstream deleted them". It
// then reported 26 phantom deletions. So:
//
//   1. The base is the one docs/ai-elements-inventory.md records. Check that file
//      before changing the constant below.
//   2. A 404 is NEVER, on its own, evidence of removal. Membership is decided by the
//      canonical index; a component listed there but failing to fetch is an incident
//      (`error`), not a deletion. Only "absent from the index" supports `orphaned`.
//
// Writes src/components/upstream-baseline.json. Network-bound and deliberate: run it
// when adopting an upstream revision, not on every check. `just check` reads the file,
// never the network.
//
//   pnpm baseline:upstream            refresh the baseline
//   pnpm baseline:upstream --dry-run  print what would change, write nothing

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import prettier from 'prettier';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import { listSourceFiles, primitivesDir, consumersDir } from './lib/consumer-contract.mjs';

const SHADCN_STYLE = 'new-york-v4';
const SHADCN_BASE = `https://ui.shadcn.com/r/styles/${SHADCN_STYLE}`;
const AI_ELEMENTS_BASE = 'https://elements.ai-sdk.dev/api/registry';
const OUT_FILE = 'src/components/upstream-baseline.json';
const CONCURRENCY = 6;

// Which of our files are our own LOC splits of an upstream component, recorded rather
// than inferred. Prefix-matching guessed this before, and a guess cannot tell a split
// apart from an independent local component that happens to share a prefix. This is
// repo provenance: when a split is added or removed, edit it here.
const SPLIT_OF = {
  'attachment-parts': 'attachments',
  'code-block-body': 'code-block',
  'code-block-highlight': 'code-block',
  'code-block-parts': 'code-block',
  'code-block-theme': 'code-block',
  'commit-files': 'commit',
  'context-usage': 'context',
  'environment-variables-parts': 'environment-variables',
  'file-tree-items': 'file-tree',
  'inline-citation-carousel': 'inline-citation',
  'jsx-preview-parts': 'jsx-preview',
  'message-branch': 'message',
  'open-in-chat-providers': 'open-in-chat',
  'package-info-parts': 'package-info',
  'prompt-input-actions': 'prompt-input',
  'prompt-input-context': 'prompt-input',
  'prompt-input-controls': 'prompt-input',
  'prompt-input-helpers': 'prompt-input',
  'prompt-input-hooks': 'prompt-input',
  'prompt-input-parts': 'prompt-input',
  'prompt-input-select': 'prompt-input',
  'queue-item': 'queue',
  'schema-display-parts': 'schema-display',
  'schema-display-property': 'schema-display',
  'stack-trace-frames': 'stack-trace',
  'stack-trace-header': 'stack-trace',
  'terminal-parts': 'terminal',
  'test-results-suite': 'test-results',
  'test-results-test': 'test-results',
  'web-preview-console': 'web-preview',
};

const dryRun = process.argv.slice(2).includes('--dry-run');

const primitiveNames = listSourceFiles(path.resolve(repoRoot, primitivesDir)).map(basename);
const consumerNames = listSourceFiles(path.resolve(repoRoot, consumersDir)).map(basename);

console.log(`Fetching ${SHADCN_STYLE} for ${primitiveNames.length} primitives…`);
const primitives = await resolveAll(primitiveNames, (name) => `${SHADCN_BASE}/${name}.json`, null);

console.log('Reading the ai-elements canonical index…');
const listed = await fetchIndex(`${AI_ELEMENTS_BASE}/registry.json`);
console.log(`  ${listed.size} components listed`);

console.log(`Resolving ${consumerNames.length} vendored files…`);
const consumers = await resolveAll(
  consumerNames,
  (name) => `${AI_ELEMENTS_BASE}/${name}.json`,
  listed
);

for (const [name, entry] of Object.entries(consumers)) {
  if (entry.status !== 'absent') {
    continue;
  }
  consumers[name] = SPLIT_OF[name]
    ? { status: 'split', splitOf: SPLIT_OF[name] }
    : { status: 'orphaned' };
}

const baseline = {
  baselineVersion: '2',
  capturedAt: new Date().toISOString().slice(0, 10),
  note:
    'What upstream contained when this repo last compared against it. `payloadSha256` is ' +
    'the full digest of the canonical registry payload, so a change there means upstream ' +
    'moved. Regenerate with `pnpm baseline:upstream`.',
  primitives: {
    role: 'migration-target',
    registry: SHADCN_BASE,
    style: SHADCN_STYLE,
    components: sortKeys(primitives),
  },
  aiElements: {
    role: 'current-source',
    registry: AI_ELEMENTS_BASE,
    indexedComponents: listed.size,
    components: sortKeys(consumers),
  },
};

const absPath = path.resolve(repoRoot, OUT_FILE);
const previous = fs.existsSync(absPath) ? JSON.parse(fs.readFileSync(absPath, 'utf8')) : null;
reportDrift(previous, baseline);

const counts = tally(consumers);
console.log('');
console.log(`  primitives   ${tally(primitives).tracked} tracked at ${SHADCN_STYLE}`);
console.log(
  `  ai-elements  ${counts.tracked} tracked, ${counts.split} splits, ` +
    `${counts.orphaned} orphaned, ${counts.error} errored`
);

if (counts.error > 0) {
  console.error('\nSome components are listed upstream but did not fetch. That is an incident,');
  console.error('not a removal — refusing to write a baseline that could be read as deletions.');
  process.exit(1);
}

if (dryRun) {
  console.log(`\n(dry run — ${OUT_FILE} not written)`);
} else {
  // Format with the repo's own config. `JSON.stringify` output does not match what
  // `prettier --check` wants, so writing it raw left `just check` failing after every
  // refresh — the tool would break the build each time it was used correctly.
  const config = await prettier.resolveConfig(absPath);
  const formatted = await prettier.format(JSON.stringify(baseline, null, 2), {
    ...config,
    filepath: absPath,
  });
  fs.writeFileSync(absPath, formatted);
  console.log(`\n✓ Wrote ${OUT_FILE}`);
}

async function fetchIndex(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`canonical index ${url} returned ${response.status} — cannot classify`);
  }
  const payload = await response.json();
  const items = payload.items ?? [];
  if (items.length === 0) {
    throw new Error('canonical index is empty — refusing to call every component missing');
  }
  return new Set(items.map((item) => item.name));
}

async function resolveAll(names, toUrl, listed) {
  const out = {};
  for (let index = 0; index < names.length; index += CONCURRENCY) {
    await Promise.all(
      names.slice(index, index + CONCURRENCY).map(async (name) => {
        out[name] = await resolveOne(name, toUrl(name), listed);
      })
    );
  }
  return out;
}

async function resolveOne(name, url, listed) {
  // Membership first. Without an index (shadcn), a 404 is still just absent; with one,
  // only absence from the index may be reported as a removal.
  if (listed && !listed.has(name)) {
    return { status: 'absent' };
  }

  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(url);
      break;
    } catch (error) {
      if (attempt === 2) {
        return { status: 'error', detail: error.message };
      }
    }
  }
  if (!response.ok) {
    return listed
      ? { status: 'error', detail: `listed in the index but returned ${response.status}` }
      : { status: 'absent' };
  }

  const raw = await response.text();
  const payload = JSON.parse(raw);
  const files = payload.files ?? [];
  const primary = files.find((entry) =>
    (entry.path ?? entry.target ?? '').replace(/\\/g, '/').endsWith(`${name}.tsx`)
  );
  if (!primary) {
    return { status: 'error', detail: `payload has no ${name}.tsx — registry shape changed` };
  }

  // Hash the whole payload, not just the one file we happen to read. Registry items also
  // carry sibling files, npm dependencies and registryDependencies; a change in any of
  // those is a change we want to see at the next adoption.
  return {
    status: 'tracked',
    payloadSha256: sha256(raw),
    files: Object.fromEntries(
      files
        .map((entry) => [path.basename(entry.path ?? entry.target ?? ''), sha256(entry.content)])
        .sort(([left], [right]) => left.localeCompare(right))
    ),
    dependencies: payload.dependencies ?? [],
    registryDependencies: payload.registryDependencies ?? [],
    bytes: Buffer.byteLength(primary.content),
  };
}

function reportDrift(previous, next) {
  if (!previous) {
    console.log('\nNo previous baseline — this run establishes it.');
    return;
  }
  const changes = [];
  for (const group of ['primitives', 'aiElements']) {
    const before = previous[group]?.components ?? {};
    const after = next[group]?.components ?? {};
    for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
      const from = describe(before[name]);
      const to = describe(after[name]);
      if (from !== to) {
        changes.push(`  ${group}/${name}: ${from} → ${to}`);
      }
    }
  }
  console.log(changes.length === 0 ? '\nNo upstream drift since the last baseline.' : '\nDrift:');
  for (const line of changes.sort()) {
    console.log(line);
  }
}

function describe(entry) {
  if (!entry) {
    return 'absent';
  }
  const digest = entry.payloadSha256 ?? entry.sha256;
  return digest ? `${entry.status}@${digest.slice(0, 12)}` : entry.status;
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value ?? '')
    .digest('hex');
}

function tally(entries) {
  const counts = { tracked: 0, split: 0, orphaned: 0, error: 0 };
  for (const entry of Object.values(entries)) {
    counts[entry.status] = (counts[entry.status] ?? 0) + 1;
  }
  return counts;
}

function sortKeys(object) {
  return Object.fromEntries(
    Object.entries(object).sort(([left], [right]) => left.localeCompare(right))
  );
}

function basename(absFile) {
  return path.basename(absFile).replace(/\.tsx?$/, '');
}
