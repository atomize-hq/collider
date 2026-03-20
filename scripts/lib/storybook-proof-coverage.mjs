import fs from 'node:fs';
import path from 'node:path';

import prettier from 'prettier';

import { repoRoot } from '../../design-tokens/build/paths.mjs';

export const defaultStorybookProofCoveragePath = 'artifacts/storybook/proof-coverage.json';

export function createStorybookProofCoverageReport(proofStructureResult) {
  if (proofStructureResult.errors.length > 0 || proofStructureResult.data.componentFacts === null) {
    throw new Error(
      'Cannot build Storybook proof coverage report from structurally invalid proof metadata.'
    );
  }

  const components = proofStructureResult.data.componentFacts.map((componentFact) => {
    const missingKinds = componentFact.requiredKinds.filter(
      (kind) => !componentFact.implementedKinds.includes(kind)
    );

    return {
      componentId: componentFact.componentId,
      tier: componentFact.tier,
      status: missingKinds.length === 0 ? 'ready' : 'missing-required-kinds',
      requiredKinds: [...componentFact.requiredKinds],
      implementedKinds: [...componentFact.implementedKinds],
      missingKinds,
      generatedArtifactRefs: { ...componentFact.generatedArtifactRefs },
    };
  });

  const readyCount = components.filter((component) => component.status === 'ready').length;

  return {
    proofCoverageVersion: '1',
    summary: {
      componentCount: components.length,
      readyCount,
      failingCount: components.length - readyCount,
    },
    components,
  };
}

export async function writeStorybookProofCoverageReport(
  report,
  outputPath = defaultStorybookProofCoveragePath,
  options = {}
) {
  const rootDir = options.rootDir ?? repoRoot;
  const absPath = path.isAbsolute(outputPath) ? outputPath : path.resolve(rootDir, outputPath);
  const formattedReport = await prettier.format(JSON.stringify(report), { filepath: absPath });

  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, formattedReport);

  return absPath;
}

export function readStorybookProofCoverageReport(
  target = defaultStorybookProofCoveragePath,
  options = {}
) {
  const rootDir = options.rootDir ?? repoRoot;
  const absPath = path.isAbsolute(target) ? target : path.resolve(rootDir, target);

  return {
    absPath,
    data: JSON.parse(fs.readFileSync(absPath, 'utf8')),
  };
}

export function formatStorybookProofCoverageSummary(report) {
  return `Proof coverage: ${report.summary.componentCount} components, ${report.summary.readyCount} ready, ${report.summary.failingCount} failing`;
}
