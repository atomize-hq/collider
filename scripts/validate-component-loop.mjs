#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-component-loop.mjs <path-to-component-loop.json>');
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

assert(typeof data.loopVersion === 'string' && data.loopVersion.length > 0, 'loopVersion is required');
assert(data.component && typeof data.component === 'object', 'component is required');
assert(typeof data.component.name === 'string' && data.component.name.length > 0, 'component.name is required');
assert(data.seed && typeof data.seed === 'object', 'seed is required');
assert(data.figma && typeof data.figma === 'object', 'figma is required');
assert(data.codeConnect && typeof data.codeConnect === 'object', 'codeConnect is required');
assert(data.verification && typeof data.verification === 'object', 'verification is required');
assert(data.sync && typeof data.sync === 'object', 'sync is required');

console.log(`✓ Component loop is structurally valid: ${abs}`);
