#!/usr/bin/env node
import process from 'node:process';
import { runTokenRuntimeCompatibilityCli } from './lib/token-runtime-compatibility.mjs';

process.exit(await runTokenRuntimeCompatibilityCli());
