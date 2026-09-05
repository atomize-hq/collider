#!/usr/bin/env node
// Pins what upstream looked like when we last compared against it.
//
// Every earlier comparison in this repo ran against unversioned registry URLs, which
// makes a finding true on the day it was measured and unreproducible after.
//
// The ai-elements base below is load-bearing and easy to get wrong. `registry.ai-sdk.dev`
// also answers, and serves a SUBSET — roughly 20 of our components resolve there and the
// rest 404, which reads exactly like "upstream deleted them" and is not. The canonical
// endpoint is the one docs/ai-elements-inventory.md records. Check that file before
// changing this constant.
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

import { repoRoot } from '../design-tokens/build/paths.mjs';
import { listSourceFiles, primitivesDir, consumersDir } from './lib/consumer-contract.mjs';

const SHADCN_STYLE = 'new-york-v4';
const SHADCN_BASE = `https://ui.shadcn.com/r/styles/${SHADCN_STYLE}`;
const AI_ELEMENTS_BASE = 'https://elements.ai-sdk.dev/api/registry';
const OUT_FILE = 'src/components/upstream-baseline.json';
const CONCURRENCY = 6;

const dryRun = process.argv.slice(2).includes('--dry-run');

const primitiveNames = listSourceFiles(path.resolve(repoRoot, primitivesDir)).map(basename);
const consumerNames = listSourceFiles(path.resolve(repoRoot, consumersDir)).map(basename);

console.log(`Fetching ${SHADCN_STYLE} for ${primitiveNames.length} primitives…`);
const primitives = await resolveAll(primitiveNames, (name) => `${SHADCN_BASE}/${name}.json`);

console.log(`Probing ai-elements for ${consumerNames.length} vendored files…`);
const consumers = await resolveAll(consumerNames, (name) => `${AI_ELEMENTS_BASE}/${name}.json`);

// A file whose own name 404s may still be one of our LOC splits of a component that
// does resolve (`prompt-input-controls` under `prompt-input`). Anything left over has
// no upstream at all.
//
// One split does not prefix-match its base, because we named the file singular and the
// registry component plural. It is a split, not an orphan — attachments.tsx re-exports
// it — so state that rather than letting a naming slip read as a missing upstream.
const SPLIT_OVERRIDES = { 'attachment-parts': 'attachments' };

const trackedConsumers = new Set(
  Object.entries(consumers)
    .filter(([, entry]) => entry.status === 'tracked')
    .map(([name]) => name)
);
for (const [name, entry] of Object.entries(consumers)) {
  if (entry.status !== 'absent') {
    continue;
  }
  const base =
    SPLIT_OVERRIDES[name] ??
    [...trackedConsumers]
      .filter((candidate) => name.startsWith(`${candidate}-`))
      .sort((left, right) => right.length - left.length)[0];
  if (base) {
    consumers[name] = { status: 'split', splitOf: base };
  } else {
    consumers[name] = { status: 'orphaned' };
  }
}

const baseline = {
  baselineVersion: '1',
  capturedAt: new Date().toISOString().slice(0, 10),
  note:
    'Content hashes of the upstream registry payloads this repo was last compared against. ' +
    'Regenerate with `pnpm baseline:upstream`; a changed hash means upstream moved, not that we did.',
  primitives: {
    registry: SHADCN_BASE,
    style: SHADCN_STYLE,
    components: sortKeys(primitives),
  },
  aiElements: {
    registry: AI_ELEMENTS_BASE,
    components: sortKeys(consumers),
  },
};

const counts = tally(consumers);
const absPath = path.resolve(repoRoot, OUT_FILE);
const previous = fs.existsSync(absPath) ? JSON.parse(fs.readFileSync(absPath, 'utf8')) : null;
reportDrift(previous, baseline);

console.log('');
console.log(`  primitives   ${tally(primitives).tracked} tracked at ${SHADCN_STYLE}`);
console.log(
  `  ai-elements  ${counts.tracked} tracked, ${counts.split} splits, ${counts.orphaned} orphaned`
);

if (dryRun) {
  console.log(`\n(dry run — ${OUT_FILE} not written)`);
} else {
  fs.writeFileSync(absPath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`\n✓ Wrote ${OUT_FILE}`);
}

async function resolveAll(names, toUrl) {
  const out = {};
  for (let index = 0; index < names.length; index += CONCURRENCY) {
    await Promise.all(
      names.slice(index, index + CONCURRENCY).map(async (name) => {
        out[name] = await resolveOne(name, toUrl(name));
      })
    );
  }
  return out;
}

async function resolveOne(name, url) {
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(url);
      break;
    } catch (error) {
      if (attempt === 2) {
        throw new Error(`${name}: ${error.message}`);
      }
    }
  }
  if (response.status === 404) {
    return { status: 'absent' };
  }
  if (!response.ok) {
    throw new Error(`${name}: upstream returned ${response.status} — refusing a partial baseline`);
  }

  const payload = await response.json();
  const file = (payload.files ?? []).find((entry) =>
    (entry.path ?? entry.target ?? '').replace(/\\/g, '/').endsWith(`${name}.tsx`)
  );
  if (!file) {
    throw new Error(`${name}: payload has no ${name}.tsx — registry shape changed`);
  }

  return {
    status: 'tracked',
    sha256: crypto.createHash('sha256').update(file.content).digest('hex').slice(0, 16),
    bytes: Buffer.byteLength(file.content),
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
  return entry.sha256 ? `${entry.status}@${entry.sha256}` : entry.status;
}

function tally(entries) {
  const counts = { tracked: 0, split: 0, orphaned: 0 };
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
