#!/usr/bin/env node
import process from 'node:process';

import {
  loadAndValidateStorybookProofStructure,
  storybookProofStructureUsage,
} from './lib/storybook-proof-structure.mjs';

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error(storybookProofStructureUsage);
  process.exit(1);
}

try {
  const rootDir = args[0];
  const { errors } = loadAndValidateStorybookProofStructure(rootDir ? { rootDir } : undefined);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log('✓ Storybook proof structure is structurally valid');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
