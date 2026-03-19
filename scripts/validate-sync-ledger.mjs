#!/usr/bin/env node
import process from 'node:process';
import { runValidateSyncLedgerCli } from './lib/sync-ledger.mjs';

process.exit(runValidateSyncLedgerCli());
