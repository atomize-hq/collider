#!/usr/bin/env node
import process from 'node:process';

import { runChromaticStatusValidationCli } from './lib/chromatic-status-validator.mjs';

const exitCode = await runChromaticStatusValidationCli();
process.exit(exitCode);
