import path from 'node:path';
import process from 'node:process';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  createStorybookProofCoverageReport,
  defaultStorybookProofCoveragePath,
  formatStorybookProofCoverageSummary,
  readStorybookProofCoverageReport,
  writeStorybookProofCoverageReport,
} from './storybook-proof-coverage.mjs';
import { loadAndValidateStorybookProofStructure } from './storybook-proof-structure.mjs';

export const storybookProofGateUsage = 'Usage: pnpm govern:storybook-proof';
export const storybookProofGateSteps = [
  'validate:storybook-proof-structure',
  'generate:storybook-proof-coverage',
  'enforce:storybook-proof-gate',
];

export async function runStorybookProofGate(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const rootDir = path.resolve(options.rootDir ?? process.env.STORYBOOK_PROOF_ROOT_DIR ?? repoRoot);
  const reportPath = options.reportPath ?? defaultStorybookProofCoveragePath;
  const loadProofStructure =
    options.loadProofStructure ??
    ((loadOptions = {}) => loadAndValidateStorybookProofStructure({ rootDir, ...loadOptions }));
  const createCoverageReport = options.createCoverageReport ?? createStorybookProofCoverageReport;
  const writeCoverageReport = options.writeCoverageReport ?? writeStorybookProofCoverageReport;
  const readCoverageReport = options.readCoverageReport ?? readStorybookProofCoverageReport;
  const summaryFormatter = options.formatCoverageSummary ?? formatStorybookProofCoverageSummary;

  const proofStructureResult = loadProofStructure({ rootDir });
  if (proofStructureResult.errors.length > 0) {
    for (const error of proofStructureResult.errors) {
      writeLine(stderr, error);
    }
    return 1;
  }

  const report = createCoverageReport(proofStructureResult);
  const absReportPath = await writeCoverageReport(report, reportPath, { rootDir });

  let persistedReport;
  try {
    persistedReport = readCoverageReport(absReportPath, { rootDir });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(
      stderr,
      `[CT-9B_PROOF_GATE_REPORT_READ_FAILED] Storybook proof gate could not read ${absReportPath}: ${message}`
    );
    return 1;
  }

  const evaluation = evaluateStorybookProofGateReport(persistedReport.data, {
    reportPath: persistedReport.absPath,
  });

  writeLine(stdout, `✓ Storybook proof coverage report written: ${persistedReport.absPath}`);
  writeLine(stdout, summaryFormatter(persistedReport.data));

  if (!evaluation.ok) {
    for (const error of evaluation.errors) {
      writeLine(stderr, error);
    }
    return 1;
  }

  writeLine(stdout, `✓ Storybook proof gate passed: ${persistedReport.absPath}`);
  writeLine(stdout, 'Published proof threads: THR-02, THR-04, THR-08');
  return 0;
}

export async function runStorybookProofGateCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const stderr = options.stderr ?? process.stderr;
  const runGate = options.runGate ?? runStorybookProofGate;

  if (args.length > 0) {
    writeLine(stderr, storybookProofGateUsage);
    return 1;
  }

  try {
    return await runGate();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(stderr, `[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
    return 3;
  }
}

export function evaluateStorybookProofGateReport(report, options = {}) {
  const reportPath = options.reportPath ?? defaultStorybookProofCoveragePath;
  const errors = [];

  if (!isPlainObject(report)) {
    return {
      ok: false,
      errors: [
        `[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} must contain a JSON object rooted at proofCoverageVersion, summary, and components`,
      ],
    };
  }

  if (report.proofCoverageVersion !== '1') {
    errors.push(
      `[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} must set proofCoverageVersion to "1"`
    );
  }

  if (!isPlainObject(report.summary)) {
    errors.push(
      `[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} must contain a summary object with componentCount, readyCount, and failingCount`
    );
  }

  if (!Array.isArray(report.components)) {
    errors.push(`[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} must contain a components array`);
    return { ok: errors.length === 0, errors };
  }

  let readyCount = 0;
  let failingCount = 0;

  for (const [index, component] of report.components.entries()) {
    const label = `components[${index}]`;
    if (!isPlainObject(component)) {
      errors.push(`[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} ${label} must be an object`);
      continue;
    }

    const componentId =
      typeof component.componentId === 'string' && component.componentId.length > 0
        ? component.componentId
        : `unknown@${index}`;
    const missingKinds = Array.isArray(component.missingKinds)
      ? component.missingKinds.filter((kind) => typeof kind === 'string' && kind.length > 0)
      : null;

    if (component.status === 'ready') {
      readyCount += 1;
      if (missingKinds !== null && missingKinds.length > 0) {
        errors.push(
          `[CT-9B_PROOF_GATE_INVALID_REPORT] componentId "${componentId}" is marked ready in ${reportPath} but still lists missingKinds`
        );
      }
      continue;
    }

    failingCount += 1;

    if (component.status !== 'missing-required-kinds') {
      errors.push(
        `[CT-9B_PROOF_GATE_INVALID_REPORT] componentId "${componentId}" has unsupported status "${String(component.status)}" in ${reportPath}`
      );
      continue;
    }

    if (missingKinds === null || missingKinds.length === 0) {
      errors.push(
        `[CT-9B_PROOF_GATE_INVALID_REPORT] componentId "${componentId}" must list missingKinds when status is "missing-required-kinds" in ${reportPath}`
      );
      continue;
    }

    errors.push(
      `[CT-9B_PROOF_GATE_MISSING_REQUIRED_KIND] componentId "${componentId}" is missing required proof kinds: ${missingKinds.join(', ')}. Review storybook/story-inventory.json, storybook/component-specs/${componentId}.json, and ${reportPath}.`
    );
  }

  if (isPlainObject(report.summary)) {
    if (report.summary.componentCount !== report.components.length) {
      errors.push(
        `[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} summary.componentCount must equal the number of components`
      );
    }

    if (report.summary.readyCount !== readyCount) {
      errors.push(
        `[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} summary.readyCount must equal the number of ready components`
      );
    }

    if (report.summary.failingCount !== failingCount) {
      errors.push(
        `[CT-9B_PROOF_GATE_INVALID_REPORT] ${reportPath} summary.failingCount must equal the number of failing components`
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
