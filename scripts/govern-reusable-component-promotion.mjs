#!/usr/bin/env node
import process from 'node:process';

import { runReusableComponentPromotionGateCli } from './lib/reusable-component-promotion-gate.mjs';

process.exit(await runReusableComponentPromotionGateCli());
