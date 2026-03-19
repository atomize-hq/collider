import {
  diag,
  formatPath,
  isObject,
  readJson,
  resolveFiles,
} from './component-recipe-validator-shared.mjs';

export function createActivePilotRegistry(pilot) {
  if (!isObject(pilot)) {
    throw new Error('recipe validator setup: $ [startup] pilot registry must be an object');
  }
  if (pilot.registryVersion !== '1') {
    throw new Error('recipe validator setup: $ [startup] pilot registryVersion must be "1"');
  }
  if (!Array.isArray(pilot.components)) {
    throw new Error(
      'recipe validator setup: $ [startup] pilot registry components must be an array'
    );
  }

  const active = new Map();
  for (const item of pilot.components) {
    if (!isObject(item) || typeof item.componentId !== 'string') {
      throw new Error(
        'recipe validator setup: $ [startup] pilot registry components require componentId'
      );
    }
    if (item.pilotStatus === 'active') {
      active.set(item.componentId, item);
    }
  }
  return active;
}

export function buildTokenInventory() {
  const ids = new Set();
  const tokenFiles = resolveTokenFiles('design-tokens/src/tokens/**/*.tokens.json');

  for (const filePath of tokenFiles) {
    collectTokenIds(readJson(filePath, true), tokenIdPrefix(filePath), ids);
  }

  return ids;
}

export function validatePilotConformance(recipe, activePilots, tokenInventory, rules) {
  return (
    validatePilotContract(recipe, activePilots) ??
    validateTokenLeaves(recipe.slots, '$.slots', tokenInventory, rules) ??
    validateTokenLeaves(recipe.states, '$.states', tokenInventory, rules)
  );
}

export function validatePilotContract(recipe, activePilots) {
  const pilot = activePilots.get(recipe.componentId);
  if (!pilot) {
    return diag(
      '$.componentId',
      'pilot-component',
      `component "${recipe.componentId}" is not an active pilot component`
    );
  }

  const axes = new Map();
  for (const [index, axis] of recipe.variantAxes.entries()) {
    if (axes.has(axis.name)) {
      return diag(
        `$.variantAxes[${index}].name`,
        'duplicate-axis',
        `duplicate axis "${axis.name}"`
      );
    }
    axes.set(axis.name, { index, values: axis.values });
  }

  const expectedAxes = new Map(pilot.variantAxes.map((axis) => [axis.name, axis.values]));
  const axisError = validateSet(
    [...axes.keys()],
    [...expectedAxes.keys()],
    '$.variantAxes',
    'axis names'
  );
  if (axisError) return axisError;

  for (const [name, expectedValues] of expectedAxes.entries()) {
    const actual = axes.get(name);
    const valueError = validateSet(
      actual.values,
      expectedValues,
      `$.variantAxes[${actual.index}].values`,
      `axis "${name}" values`
    );
    if (valueError) return valueError;
  }

  const defaultsError = validateSet(
    Object.keys(recipe.defaults.variants),
    [...expectedAxes.keys()],
    '$.defaults.variants',
    'default variant keys'
  );
  if (defaultsError) return defaultsError;

  for (const [name, value] of Object.entries(recipe.defaults.variants)) {
    if (value !== pilot.defaults.variants[name]) {
      return diag(
        `$.defaults.variants${formatPath(name)}`,
        'pilot-default',
        `default for "${name}" must be "${pilot.defaults.variants[name]}"`
      );
    }
  }
  if (recipe.defaults.state !== pilot.defaults.state) {
    return diag(
      '$.defaults.state',
      'pilot-default',
      `default state must be "${pilot.defaults.state}"`
    );
  }

  const slotError = validateSet(Object.keys(recipe.slots), pilot.slots, '$.slots', 'slot names');
  if (slotError) return slotError;

  const stateError = validateSet(
    Object.keys(recipe.states),
    pilot.states,
    '$.states',
    'state names'
  );
  if (stateError) return stateError;

  for (const [stateName, overrides] of Object.entries(recipe.states)) {
    for (const slotName of Object.keys(overrides)) {
      if (!pilot.slots.includes(slotName)) {
        return diag(
          `$.states${formatPath(stateName)}${formatPath(slotName)}`,
          'pilot-slot',
          `unknown slot "${slotName}" for state "${stateName}"`
        );
      }
    }
  }

  if (recipe.fallbacks.missingVariantBehavior !== pilot.fallbacks.missingVariantBehavior) {
    return diag(
      '$.fallbacks.missingVariantBehavior',
      'pilot-fallback',
      `missingVariantBehavior must be "${pilot.fallbacks.missingVariantBehavior}"`
    );
  }

  const fallbackError = validateSet(
    Object.keys(recipe.fallbacks.stateFallbacks),
    Object.keys(pilot.fallbacks.stateFallbacks),
    '$.fallbacks.stateFallbacks',
    'state fallback keys'
  );
  if (fallbackError) return fallbackError;

  for (const [name, value] of Object.entries(recipe.fallbacks.stateFallbacks)) {
    if (value !== pilot.fallbacks.stateFallbacks[name]) {
      return diag(
        `$.fallbacks.stateFallbacks${formatPath(name)}`,
        'pilot-fallback',
        `fallback for "${name}" must be "${pilot.fallbacks.stateFallbacks[name]}"`
      );
    }
  }

  return null;
}

function collectTokenIds(node, trail, ids) {
  if (!isObject(node)) return;
  if ('$value' in node && '$type' in node) {
    ids.add(trail.join('.'));
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$')) {
      collectTokenIds(value, [...trail, key], ids);
    }
  }
}

function tokenIdPrefix(filePath) {
  if (filePath.endsWith('/core.tokens.json')) return ['core'];
  if (filePath.endsWith('/semantic.tokens.json')) return ['semantic'];
  if (filePath.endsWith('/motion.tokens.json')) return ['motion'];
  return [];
}

function resolveTokenFiles(pattern) {
  const nestedFiles = resolveFiles(pattern);
  const rootPattern = pattern.replace('/**/*.tokens.json', '/*.tokens.json');
  const rootFiles = rootPattern === pattern ? [] : resolveFiles(rootPattern);
  return [...new Set([...nestedFiles, ...rootFiles])].sort((left, right) =>
    left.localeCompare(right)
  );
}

export function validateTokenLeaves(node, jsonPath, tokenInventory, rules) {
  if (typeof node === 'string') {
    if (!rules.tokenReference.test(node)) {
      return diag(
        jsonPath,
        'token-reference',
        'inline scalar values are not allowed; expected CT-1 token reference'
      );
    }

    const tokenId = node.slice(1, -1);
    return tokenInventory.has(tokenId)
      ? null
      : diag(jsonPath, 'token-inventory', `unknown CT-1 token reference "${node}"`);
  }

  for (const [key, child] of Object.entries(node)) {
    const error = validateTokenLeaves(
      child,
      `${jsonPath}${formatPath(key)}`,
      tokenInventory,
      rules
    );
    if (error) return error;
  }

  return null;
}

function validateSet(actual, expected, jsonPath, label) {
  const extras = actual.filter((value) => !expected.includes(value)).sort();
  if (extras.length) {
    return diag(jsonPath, 'pilot-contract', `unknown ${label}: ${extras.join(', ')}`);
  }

  const missing = expected.filter((value) => !actual.includes(value)).sort();
  return missing.length
    ? diag(jsonPath, 'pilot-contract', `missing ${label}: ${missing.join(', ')}`)
    : null;
}
