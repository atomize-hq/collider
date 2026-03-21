#!/usr/bin/env node
import process from 'node:process';

import {
  createReusableComponentStatus,
  reusableComponentStatusChangeClassEnvVar,
  reusableComponentStatusMaxAgeMinutesEnvVar,
  reusableComponentStatusRootDirEnvVar,
  writeReusableComponentStatus,
} from './lib/reusable-component-status.mjs';

export const reusableComponentStatusGenerationUsage =
  'Usage: node scripts/generate-reusable-component-status.mjs';

const args = process.argv.slice(2);
if (args.length > 0) {
  console.error(reusableComponentStatusGenerationUsage);
  process.exit(1);
}

try {
  const status = createReusableComponentStatus({
    changeClass: process.env[reusableComponentStatusChangeClassEnvVar],
    chromaticStatusMaxAgeMinutes: process.env[reusableComponentStatusMaxAgeMinutesEnvVar],
    rootDir: process.env[reusableComponentStatusRootDirEnvVar],
  });
  const outputPath = await writeReusableComponentStatus(status, {
    rootDir: process.env[reusableComponentStatusRootDirEnvVar],
  });

  console.log(`✓ Reusable component status written: ${outputPath}`);
  console.log(
    `Highest earned claim: ${status.highestEarnedClaim.profileId}/${status.highestEarnedClaim.claimId}`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
