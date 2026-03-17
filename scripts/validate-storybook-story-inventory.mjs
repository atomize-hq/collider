#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-storybook-story-inventory.mjs <path-to-story-inventory.json>');
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

const allowedKinds = new Set([
  'default',
  'variant-matrix',
  'state-matrix',
  'actions',
  'controlled',
  'keyboard',
  'focus',
  'workflow',
  'motion',
  'async',
  'docs',
  'responsive',
  'composition'
]);

assert(typeof data.inventoryVersion === 'string' && data.inventoryVersion.length > 0, 'inventoryVersion is required');
assert(data.component && typeof data.component === 'object', 'component object is required');
assert(typeof data.component.name === 'string' && data.component.name.length > 0, 'component.name is required');
assert(typeof data.component.tier === 'string' && data.component.tier.length > 0, 'component.tier is required');
assert(Array.isArray(data.stories) && data.stories.length > 0, 'stories must be a non-empty array');

for (const [index, story] of data.stories.entries()) {
  assert(typeof story.name === 'string' && story.name.length > 0, `stories[${index}].name is required`);
  assert(typeof story.kind === 'string' && allowedKinds.has(story.kind), `stories[${index}].kind must be one of the allowed values`);
  assert(typeof story.required === 'boolean', `stories[${index}].required must be boolean`);
  assert(typeof story.implemented === 'boolean', `stories[${index}].implemented must be boolean`);
}

const hasDefault = data.stories.some((s) => s.kind === 'default');
assert(hasDefault, 'at least one default story is required');

console.log(`✓ Storybook story inventory is structurally valid: ${abs}`);
