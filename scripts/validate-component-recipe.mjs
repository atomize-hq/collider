#!/usr/bin/env node
import process from 'node:process';
import {
  formatDiagnostic,
  loadValidatorContext,
  relativePath,
  resolveRecipeFiles,
  validateRecipeFile,
} from './lib/component-recipe-validator.mjs';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-component-recipe.mjs <recipe-or-glob>');
  process.exit(1);
}

try {
  const context = loadValidatorContext();
  const files = resolveRecipeFiles(target);

  if (files.length === 0) {
    console.error(`No recipe files matched: ${target}`);
    process.exit(1);
  }

  for (const filePath of files) {
    const error = validateRecipeFile(filePath, context);
    if (error) {
      console.error(formatDiagnostic(filePath, error));
      process.exit(1);
    }
  }

  const validated = files.map((filePath) => relativePath(filePath)).join(', ');
  console.log(`✓ Validated ${files.length} component recipe file(s): ${validated}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
