#!/usr/bin/env node
import process from 'node:process';

import { runStorybookProofGateCli } from './lib/storybook-proof-gate.mjs';

process.exit(await runStorybookProofGateCli());
