#!/usr/bin/env node
import process from 'node:process';

import {
  componentMappingRootDirEnvVar,
  createComponentMappingArtifacts,
  writeComponentMappingArtifacts,
} from './lib/component-mapping.mjs';

export const componentMappingUsage = 'Usage: node scripts/generate-component-mapping.mjs';

const args = process.argv.slice(2);
if (args.length > 0) {
  console.error(componentMappingUsage);
  process.exit(1);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

async function main() {
  const rootDir = process.env[componentMappingRootDirEnvVar];
  const artifacts = createComponentMappingArtifacts(rootDir ? { rootDir } : {});
  const output = await writeComponentMappingArtifacts(artifacts);

  console.log(`✓ Component mapping artifacts written: ${output.outputPaths.length + 1} files`);
  console.log(`Completeness report: ${output.completenessReportPath}`);
}
