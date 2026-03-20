#!/usr/bin/env node
import process from 'node:process';

import {
  defaultStoryInventoryPath,
  loadAndValidateStoryInventory,
  storyInventoryUsage,
} from './lib/storybook-story-inventory.mjs';

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error(storyInventoryUsage);
  process.exit(1);
}

try {
  const target = args[0] ?? defaultStoryInventoryPath;
  const { absPath, errors } = loadAndValidateStoryInventory(target);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`✓ Storybook story inventory is structurally valid: ${absPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
