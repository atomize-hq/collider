#!/usr/bin/env node
import process from 'node:process';

import { runReusableComponentMappingValidationCli } from './lib/reusable-component-mapping-validator.mjs';

const exitCode = await runReusableComponentMappingValidationCli();
process.exit(exitCode);
