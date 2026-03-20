#!/usr/bin/env node
import process from 'node:process';

import {
  defaultComponentTierPolicyPath,
  loadAndValidateComponentTierPolicy,
  storybookTierPolicyUsage,
} from './lib/storybook-tier-policy.mjs';

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error(storybookTierPolicyUsage);
  process.exit(1);
}

try {
  const target = args[0] ?? defaultComponentTierPolicyPath;
  const { absPath, errors } = loadAndValidateComponentTierPolicy(target);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`✓ Storybook component tier policy is structurally valid: ${absPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
