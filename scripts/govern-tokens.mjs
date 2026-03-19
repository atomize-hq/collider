#!/usr/bin/env node
// SEAM-6 owns this fixed validation -> freshness -> build entrypoint; later
// governance slices
// extend this command instead of creating new package-level orchestration names.
import process from 'node:process';
import { runTokenGovernanceCli } from './lib/token-governance.mjs';

process.exit(runTokenGovernanceCli());
