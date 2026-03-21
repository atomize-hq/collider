#!/usr/bin/env node
import process from 'node:process';

import { runReusableComponentStatusValidationCli } from './lib/reusable-component-status-validator.mjs';

const exitCode = await runReusableComponentStatusValidationCli();
process.exit(exitCode);
