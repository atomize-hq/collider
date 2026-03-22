#!/usr/bin/env node
import process from 'node:process';
import { runFigmaVariablesSyncCli } from './lib/figma-variables-sync-enterprise.mjs';

process.exitCode = await runFigmaVariablesSyncCli();
