#!/usr/bin/env node
import process from 'node:process';

import {
  chromaticStatusRestoreUsage,
  parseChromaticStatusRestoreArgs,
  runChromaticStatusRestore,
} from './lib/chromatic-status-artifact.mjs';

const { error, parsed } = parseChromaticStatusRestoreArgs(process.argv.slice(2));
if (error || !parsed) {
  if (error) {
    console.error(error);
  }
  console.error(chromaticStatusRestoreUsage);
  process.exit(1);
}

const result = await runChromaticStatusRestore({
  gitSha: parsed.gitSha ?? undefined,
  repoSlug: parsed.repoSlug ?? undefined,
});

if (result.exitCode === 0) {
  console.log(`✓ Restored chromatic status artifact: ${result.targetPath}`);
  console.log(`Source artifact: ${result.artifactName} (run ${result.sourceRunId})`);
  process.exit(0);
}

if (result.error) {
  console.error(result.error.message);
}
process.exit(result.exitCode);
