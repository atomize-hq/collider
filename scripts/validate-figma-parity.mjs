#!/usr/bin/env node
import process from 'node:process';
import { runValidateFigmaParityCli } from './lib/figma-parity.mjs';

process.exit(runValidateFigmaParityCli());
