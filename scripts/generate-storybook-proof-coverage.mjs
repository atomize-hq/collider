#!/usr/bin/env node
import process from 'node:process';

import {
  createStorybookProofCoverageReport,
  defaultStorybookProofCoveragePath,
  formatStorybookProofCoverageSummary,
  writeStorybookProofCoverageReport,
} from './lib/storybook-proof-coverage.mjs';
import { loadAndValidateStorybookProofStructure } from './lib/storybook-proof-structure.mjs';

export const storybookProofCoverageUsage =
  'Usage: node scripts/generate-storybook-proof-coverage.mjs [output-path]';

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error(storybookProofCoverageUsage);
  process.exit(1);
}

try {
  const rootDir = process.env.STORYBOOK_PROOF_ROOT_DIR;
  const proofStructureResult = loadAndValidateStorybookProofStructure(rootDir ? { rootDir } : {});

  if (proofStructureResult.errors.length > 0) {
    for (const error of proofStructureResult.errors) {
      console.error(error);
    }
    process.exit(1);
  }

  const report = createStorybookProofCoverageReport(proofStructureResult);
  const outputPath = args[0] ?? defaultStorybookProofCoveragePath;
  const absPath = writeStorybookProofCoverageReport(report, outputPath, {
    rootDir: proofStructureResult.rootDir,
  });

  console.log(`✓ Storybook proof coverage report written: ${absPath}`);
  console.log(formatStorybookProofCoverageSummary(report));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
