#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-storybook-version-policy.mjs <path-to-storybook-version-policy.json>');
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

assert(typeof data.policyVersion === 'string' && data.policyVersion.length > 0, 'policyVersion is required');
assert(typeof data.framework === 'string' && data.framework.length > 0, 'framework is required');
assert(typeof data.storybookVersion === 'string' && /^\d+\.\d+\.\d+$/.test(data.storybookVersion), 'storybookVersion must be exact major.minor.patch');
assert(Array.isArray(data.requiredAddons), 'requiredAddons must be an array');
assert(data.requiredAddons.length > 0, 'requiredAddons must not be empty');
assert(data.requiredImports && typeof data.requiredImports === 'object', 'requiredImports is required');
assert(typeof data.requiredImports.test === 'string' && data.requiredImports.test.length > 0, 'requiredImports.test is required');
assert(typeof data.requiredImports.previewApi === 'string' && data.requiredImports.previewApi.length > 0, 'requiredImports.previewApi is required');
assert(typeof data.requiredImports.actions === 'string' && data.requiredImports.actions.length > 0, 'requiredImports.actions is required');

console.log(`✓ Storybook version policy is structurally valid: ${abs}`);
