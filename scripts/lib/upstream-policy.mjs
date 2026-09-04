// Guards the repo's relationship with its two upstreams: shadcn (src/components/ui)
// and ai-elements (src/components/ai-elements).
//
// Both are vendored-by-copy registries, so the CLI that installed a file can also
// overwrite it. That overwrite is silent for the small stuff — a re-added focus ring,
// a reverted contrast fix — and those are exactly the changes nobody re-reads in a
// diff. This checks three things:
//
//   invariants  a rule every file in a directory must obey, so a NEW primitive
//               violating repo policy fails too, not just a reverted one
//   deviations  a specific place we intentionally differ from upstream
//   contracts   upstream API we depend on and must not refactor away
//
// It never touches the network: patterns are matched against the working tree. That
// means it catches deviations being lost, not upstream changes being missed — the
// former is the accidental failure mode, the latter is a deliberate review.

import fs from 'node:fs';
import path from 'node:path';

import { repoRoot } from '../../design-tokens/build/paths.mjs';

export const defaultUpstreamPolicyPath = 'src/components/upstream-policy.json';
export const upstreamPolicyUsage = 'Usage: pnpm validate:upstream-policy [path-to-policy.json]';
export const upstreamPolicyVersion = '1';

const RULE_SECTIONS = ['invariants', 'deviations', 'contracts'];

export function loadAndValidateUpstreamPolicy(target = defaultUpstreamPolicyPath, options = {}) {
  const rootDir = options.rootDir ?? repoRoot;
  const absPath = path.resolve(rootDir, target);
  const data = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  return { absPath, data, errors: validateUpstreamPolicyShape(data) };
}

export function validateUpstreamPolicyShape(data) {
  const errors = [];
  if (!isObject(data)) {
    return [diag('POLICY_INVALID', 'policy must be an object')];
  }
  if (data.policyVersion !== upstreamPolicyVersion) {
    errors.push(diag('POLICY_INVALID', `policyVersion must be "${upstreamPolicyVersion}"`));
  }

  const seen = new Set();
  for (const section of RULE_SECTIONS) {
    const rules = data[section];
    if (!Array.isArray(rules)) {
      errors.push(diag('POLICY_INVALID', `${section} must be an array`));
      continue;
    }
    for (const [index, rule] of rules.entries()) {
      const label = `${section}[${index}]`;
      if (!isObject(rule) || typeof rule.id !== 'string' || rule.id.length === 0) {
        errors.push(diag('POLICY_INVALID', `${label} requires a non-empty id`));
        continue;
      }
      if (seen.has(rule.id)) {
        errors.push(diag('POLICY_INVALID', `duplicate rule id "${rule.id}"`));
      }
      seen.add(rule.id);

      if (typeof rule.reason !== 'string' || rule.reason.length === 0) {
        errors.push(diag('POLICY_INVALID', `${label} "${rule.id}" requires a reason`));
      }
      const scopeKey = section === 'invariants' ? 'directory' : 'file';
      if (typeof rule[scopeKey] !== 'string' || rule[scopeKey].length === 0) {
        errors.push(diag('POLICY_INVALID', `${label} "${rule.id}" requires ${scopeKey}`));
      }
      const requires = rule.require ?? [];
      const forbids = rule.forbid ?? [];
      if (!Array.isArray(requires) || !Array.isArray(forbids)) {
        errors.push(diag('POLICY_INVALID', `${label} "${rule.id}" require/forbid must be arrays`));
        continue;
      }
      if (requires.length + forbids.length === 0) {
        errors.push(diag('POLICY_INVALID', `${label} "${rule.id}" asserts nothing`));
      }
      if (section === 'contracts' && forbids.length > 0) {
        errors.push(diag('POLICY_INVALID', `${label} "${rule.id}" contracts may only require`));
      }
      for (const pattern of [...requires, ...forbids]) {
        if (typeof pattern !== 'string') {
          errors.push(diag('POLICY_INVALID', `${label} "${rule.id}" patterns must be strings`));
          continue;
        }
        try {
          new RegExp(pattern);
        } catch (error) {
          errors.push(
            diag(
              'POLICY_INVALID',
              `${label} "${rule.id}" bad pattern: ${pattern} — ${error.message}`
            )
          );
        }
      }
    }
  }
  return errors;
}

export function evaluateUpstreamPolicy(policy, options = {}) {
  const rootDir = options.rootDir ?? repoRoot;
  const errors = [];

  for (const rule of policy.invariants) {
    const files = listTsxFiles(path.resolve(rootDir, rule.directory));
    if (files.length === 0) {
      errors.push(diag('SCOPE_EMPTY', `"${rule.id}" matched no files in ${rule.directory}`));
      continue;
    }
    for (const absFile of files) {
      errors.push(...applyRule(rule, absFile, rootDir, 'INVARIANT_VIOLATED'));
    }
  }

  for (const [section, code] of [
    ['deviations', 'DEVIATION_LOST'],
    ['contracts', 'CONTRACT_LOST'],
  ]) {
    for (const rule of policy[section]) {
      const absFile = path.resolve(rootDir, rule.file);
      if (!fs.existsSync(absFile)) {
        errors.push(diag('SCOPE_EMPTY', `"${rule.id}" targets missing file ${rule.file}`));
        continue;
      }
      errors.push(...applyRule(rule, absFile, rootDir, code));
    }
  }

  return { errors };
}

function applyRule(rule, absFile, rootDir, code) {
  const source = fs.readFileSync(absFile, 'utf8');
  const relFile = path.relative(rootDir, absFile);
  const found = [];

  for (const pattern of rule.require ?? []) {
    if (!new RegExp(pattern).test(source)) {
      found.push(explain(code, relFile, rule, 'expected `' + pattern + '` — not found'));
    }
  }
  for (const pattern of rule.forbid ?? []) {
    const match = new RegExp(pattern).exec(source);
    if (match) {
      found.push(
        explain(
          code,
          relFile,
          rule,
          'found forbidden `' + pattern + '` — matched "' + match[0] + '"'
        )
      );
    }
  }
  return found;
}

function explain(code, relFile, rule, detail) {
  const lines = [
    `[UPSTREAM_${code}] ${relFile}: "${rule.id}" — ${detail}`,
    `  Reason: ${rule.reason}`,
  ];
  if (rule.instead) {
    lines.push(`  Use instead: ${rule.instead}`);
  }
  lines.push(
    code === 'CONTRACT_LOST'
      ? '  This is upstream API we depend on. Restore it rather than hand-rolling a local equivalent.'
      : '  Likely cause: a registry overwrite (`shadcn add --overwrite` / `ai-elements add`).',
    `  Re-apply from ${defaultUpstreamPolicyPath}; do not accept the upstream file as-is.`
  );
  return lines.join('\n');
}

function listTsxFiles(absDir) {
  if (!fs.existsSync(absDir)) {
    return [];
  }
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
    .filter((entry) => !entry.name.endsWith('.stories.tsx') && !entry.name.endsWith('.test.tsx'))
    .map((entry) => path.join(absDir, entry.name))
    .sort();
}

function diag(code, message) {
  return `[UPSTREAM_${code}] ${message}`;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
