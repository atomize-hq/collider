#!/usr/bin/env node
import process from 'node:process';

import {
  defaultUpstreamPolicyPath,
  evaluateUpstreamPolicy,
  loadAndValidateUpstreamPolicy,
  upstreamPolicyUsage,
} from './lib/upstream-policy.mjs';

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error(upstreamPolicyUsage);
  process.exit(1);
}

try {
  const {
    absPath,
    data,
    errors: shapeErrors,
  } = loadAndValidateUpstreamPolicy(args[0] ?? defaultUpstreamPolicyPath);

  if (shapeErrors.length > 0) {
    for (const error of shapeErrors) {
      console.error(error);
    }
    process.exit(1);
  }

  const { errors } = evaluateUpstreamPolicy(data);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
      console.error('');
    }
    process.exit(1);
  }

  const counts = `${data.invariants.length} invariants, ${data.deviations.length} deviations, ${data.contracts.length} contracts`;
  console.log(`✓ Upstream policy holds (${counts}): ${absPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
