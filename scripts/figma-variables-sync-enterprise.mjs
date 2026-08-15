#!/usr/bin/env node
// Optional Enterprise-only rail: writes token variables to Figma via the Variables
// REST API (requires an Enterprise plan + Full seat). NOT the default sync path — the
// default is the repo-owned plugin `Collider Token Sync` (`pnpm figma:plugin:build`,
// mode `plugin-import-manual`). See src/figma/README.md.
import process from 'node:process';
import { runFigmaVariablesSyncCli } from './lib/figma-variables-sync-enterprise.mjs';

process.exitCode = await runFigmaVariablesSyncCli();
