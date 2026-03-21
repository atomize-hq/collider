#!/usr/bin/env node
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { resolveChromaticReviewInvocation } from './lib/chromatic-review-command.mjs';

try {
  const invocation = resolveChromaticReviewInvocation();

  if (invocation.mode === 'local-refusal') {
    console.log(invocation.message);
    process.exit(0);
  }

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
