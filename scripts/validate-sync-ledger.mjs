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

assert(typeof data.ledgerVersion === 'string' && data.ledgerVersion.length > 0, 'ledgerVersion is required');
assert(typeof data.scope === 'string' && data.scope.length > 0, 'scope is required');
assert(typeof data.name === 'string' && data.name.length > 0, 'name is required');
assert(data.links && typeof data.links === 'object', 'links are required');
assert(data.status && typeof data.status === 'object', 'status is required');
assert(Array.isArray(data.drift), 'drift must be an array');

console.log(`✓ Sync ledger is structurally valid: ${abs}`);
