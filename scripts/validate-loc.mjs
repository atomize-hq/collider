#!/usr/bin/env node
import process from 'node:process';

const input = await readStdin();
if (!input.trim()) {
  fail('Expected tokei JSON on stdin.');
}

const payload = JSON.parse(input);
const [target, ...limitArgs] = process.argv.slice(2);

if (!target) {
  fail('Usage: node scripts/validate-loc.mjs <rs|ts> <limits...>');
}

if (target === 'rs') {
  const [rustLimitArg] = limitArgs;
  const rustLimit = Number(rustLimitArg);
  assertFinitePositive(rustLimit, 'Rust limit must be a positive number.');
  validateRust(payload, rustLimit);
  process.exit(0);
}

if (target === 'ts') {
  const [tsxLimitArg, tsLimitArg] = limitArgs;
  const tsxLimit = Number(tsxLimitArg);
  const tsLimit = Number(tsLimitArg);
  assertFinitePositive(tsxLimit, 'TSX limit must be a positive number.');
  assertFinitePositive(tsLimit, 'TS limit must be a positive number.');
  validateTypeScript(payload, { tsLimit, tsxLimit });
  process.exit(0);
}

fail(`Unsupported LOC target "${target}". Expected "rs" or "ts".`);

function validateRust(tokeiPayload, rustLimit) {
  const rustReports = getReports(tokeiPayload, 'Rust');
  const offenders = rustReports
    .filter((report) => report.stats.code > rustLimit)
    .sort((left, right) => right.stats.code - left.stats.code);

  if (offenders.length === 0) {
    return;
  }

  fail(
    formatViolationMessage({
      heading: `Rust LOC guard failed (max ${rustLimit} code lines per file).`,
      offenders,
    })
  );
}

function validateTypeScript(tokeiPayload, { tsLimit, tsxLimit }) {
  const tsOffenders = getReports(tokeiPayload, 'TypeScript')
    .filter((report) => isTrackedTsFile(report.name))
    .filter((report) => report.stats.code > tsLimit)
    .sort((left, right) => right.stats.code - left.stats.code);

  const tsxOffenders = getReports(tokeiPayload, 'TSX')
    .filter((report) => isTrackedTsxFile(report.name))
    .filter((report) => report.stats.code > tsxLimit)
    .sort((left, right) => right.stats.code - left.stats.code);

  if (tsOffenders.length === 0 && tsxOffenders.length === 0) {
    return;
  }

  const sections = [];
  if (tsOffenders.length > 0) {
    sections.push(
      formatViolationMessage({
        heading: `TypeScript LOC guard failed (max ${tsLimit} code lines per file).`,
        offenders: tsOffenders,
      })
    );
  }
  if (tsxOffenders.length > 0) {
    sections.push(
      formatViolationMessage({
        heading: `TSX LOC guard failed (max ${tsxLimit} code lines per file).`,
        offenders: tsxOffenders,
      })
    );
  }

  fail(sections.join('\n\n'));
}

function getReports(tokeiPayload, languageKey) {
  const directReports = Array.isArray(tokeiPayload?.[languageKey]?.reports)
    ? tokeiPayload[languageKey].reports
    : [];
  const totalReports = Array.isArray(tokeiPayload?.Total?.children?.[languageKey])
    ? tokeiPayload.Total.children[languageKey]
    : [];

  return directReports.length > 0 ? directReports : totalReports;
}

function isTrackedTsFile(filePath) {
  return filePath.endsWith('.ts') && !isExcludedTsArtifact(filePath);
}

function isTrackedTsxFile(filePath) {
  return filePath.endsWith('.tsx') && !isExcludedTsArtifact(filePath);
}

function isExcludedTsArtifact(filePath) {
  return (
    filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('.stories.')
  );
}

function formatViolationMessage({ heading, offenders }) {
  return [heading, ...offenders.map((report) => `- ${report.name}: ${report.stats.code}`)].join(
    '\n'
  );
}

function assertFinitePositive(value, message) {
  if (!Number.isFinite(value) || value <= 0) {
    fail(message);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let buffer = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
    });
    process.stdin.on('end', () => resolve(buffer));
    process.stdin.on('error', reject);
  });
}
