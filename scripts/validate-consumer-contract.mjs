#!/usr/bin/env node
import process from 'node:process';

import {
  buildConsumerContract,
  consumerContractUsage,
  evaluateConsumerContract,
  summarizeConsumerContract,
} from './lib/consumer-contract.mjs';

const args = process.argv.slice(2);
const report = args.includes('--report');
if (args.some((arg) => arg !== '--report')) {
  console.error(consumerContractUsage);
  process.exit(1);
}

try {
  const contract = buildConsumerContract();

  if (report) {
    const rows = new Map();
    for (const imports of contract.consumers.values()) {
      for (const [primitive, names] of imports) {
        if (!rows.has(primitive)) {
          rows.set(primitive, new Set());
        }
        for (const name of names) {
          rows.get(primitive).add(name);
        }
      }
    }
    console.log('Primitive API surface consumed by ai-elements:\n');
    for (const [primitive, names] of [...rows].sort()) {
      console.log(`  ${primitive.padEnd(16)} ${[...names].sort().join(', ')}`);
    }
    const unused = [...contract.primitives.keys()].filter((name) => !rows.has(name));
    console.log(`\n  Not consumed by ai-elements: ${unused.join(', ') || 'none'}`);
    console.log('\nSlots:\n');
    for (const [slot, files] of [...contract.declaredSlots].sort()) {
      const selectedBy = contract.selectedSlots.get(slot);
      const marker = selectedBy ? 'selected' : 'declared only';
      console.log(`  ${slot.padEnd(24)} ${marker.padEnd(14)} ${dedupe(files).join(', ')}`);
    }
    console.log('');
  }

  const { errors } = evaluateConsumerContract(contract);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
      console.error('');
    }
    process.exit(1);
  }

  const summary = summarizeConsumerContract(contract);
  console.log(
    `✓ Consumer contract holds (${summary.consumerCount} of ${summary.scannedFileCount} scanned ` +
      `files import primitives → ${summary.importedExports} imports across ` +
      `${summary.consumedPrimitives}/${summary.primitiveCount} primitives; ` +
      `${summary.selectedSlots} of ${summary.declaredSlots} slots selected)`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function dedupe(values) {
  return [...new Set(values)];
}
