import { globSync } from 'node:fs';
import path from 'node:path';
import { readJson, repoRoot, resolveFiles } from './component-recipe-validator-shared.mjs';
import {
  buildTokenInventory,
  createActivePilotRegistry,
  validatePilotConformance,
} from './component-recipe-validator-conformance.mjs';
import { createRules, validateRecipeShape } from './component-recipe-validator-shape.mjs';

const schemaPath = path.join(repoRoot, 'design-tokens/src/recipes/schema/recipe.schema.json');
const pilotPath = path.join(repoRoot, 'design-tokens/src/recipes/pilot-components.json');

export { formatDiagnostic, relativePath, repoRoot } from './component-recipe-validator-shared.mjs';

export function loadValidatorContext() {
  return {
    rules: createRules(readJson(schemaPath, true)),
    activePilots: createActivePilotRegistry(readJson(pilotPath, true)),
    tokenInventory: buildTokenInventory(),
  };
}

export function resolveRecipeFiles(pattern) {
  return resolveFiles(pattern);
}

export function validateRecipeFile(filePath, context) {
  const recipe = readJson(filePath, false);
  const fileStem = inferComponentStem(filePath);
  return (
    validateRecipeShape(recipe, fileStem, context.rules) ??
    validatePilotConformance(recipe, context.activePilots, context.tokenInventory, context.rules)
  );
}

function inferComponentStem(filePath) {
  const base = path.basename(filePath, '.recipe.json');
  const fixtureMatch = /^(?<component>[a-z0-9-]+)\.(valid|invalid-[a-z0-9-]+)$/.exec(base);
  return fixtureMatch?.groups?.component ?? base;
}
