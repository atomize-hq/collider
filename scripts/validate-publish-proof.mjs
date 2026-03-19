#!/usr/bin/env node
import process from 'node:process';
import {
  defaultPublishProofPath,
  loadAndValidatePublishProof,
  publishProofUsage,
} from './lib/publish-proof.mjs';

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error(publishProofUsage);
  process.exit(1);
}

try {
  const target = args[0] ?? defaultPublishProofPath;
  const { absPath, errors } = loadAndValidatePublishProof(target);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`✓ Publish proof is structurally valid: ${absPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
  process.exit(3);
}
