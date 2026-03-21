#!/usr/bin/env node
import process from 'node:process';

import { runChromaticReview } from './lib/chromatic-review.mjs';

const result = await runChromaticReview();

if (result.message) {
  console.log(result.message);
}

if (result.absArtifactPath) {
  console.log(`✓ Chromatic review status written: ${result.absArtifactPath}`);
}

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.exitCode);
