import fs from 'node:fs';
import process from 'node:process';
import {
  runtimeAliasMapPath as defaultRuntimeAliasMapPath,
  runtimeCssPath as defaultRuntimeCssPath,
  runtimeInventoryPath as defaultRuntimeInventoryPath,
  toRepoRelative,
} from '../../design-tokens/build/paths.mjs';
import { rebuildHint } from './token-artifact-freshness.mjs';
import { formatDiagnostic, sortDiagnostics } from './token-validation.mjs';

export const runtimeCompatibilityUsage =
  'Usage: node scripts/validate-token-runtime-compatibility.mjs';

export async function runTokenRuntimeCompatibilityCheck(options = {}) {
  const runtimeCssPath = options.runtimeCssPath ?? defaultRuntimeCssPath;
  const runtimeInventoryPath = options.runtimeInventoryPath ?? defaultRuntimeInventoryPath;
  const runtimeAliasMapPath = options.runtimeAliasMapPath ?? defaultRuntimeAliasMapPath;
  const diagnostics = [];

  const runtimeCssSource =
    options.runtimeCssSource ??
    readTextFile(runtimeCssPath, diagnostics, 'runtime css artifact is unavailable');
  const inventory =
    options.inventory ??
    readJsonFile(runtimeInventoryPath, diagnostics, 'runtime inventory is unavailable');
  const aliasMap =
    options.aliasMap ??
    readJsonFile(runtimeAliasMapPath, diagnostics, 'runtime alias map is unavailable');

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics: sortDiagnostics(diagnostics) };
  }

  const inventorySurface = collectLegacyVars(
    inventory,
    toRepoRelative(runtimeInventoryPath),
    'runtime inventory'
  );
  const aliasSurface = collectLegacyVars(
    aliasMap,
    toRepoRelative(runtimeAliasMapPath),
    'alias map'
  );
  diagnostics.push(...inventorySurface.diagnostics, ...aliasSurface.diagnostics);

  if (diagnostics.length === 0) {
    diagnostics.push(
      ...createContractMismatchDiagnostics(
        inventorySurface.legacyVars,
        aliasSurface.legacyVars,
        toRepoRelative(runtimeInventoryPath),
        toRepoRelative(runtimeAliasMapPath)
      )
    );
  }

  if (diagnostics.length === 0) {
    const declaredVariables = extractCssCustomProperties(runtimeCssSource);
    for (const legacyVar of inventorySurface.legacyVars) {
      if (declaredVariables.has(legacyVar)) {
        continue;
      }

      diagnostics.push(
        createDiagnostic(
          'RUNTIME_COMPATIBILITY_VARIABLE_MISSING',
          `Generated runtime CSS is missing required legacy variable "${legacyVar}". ${rebuildHint}`,
          toRepoRelative(runtimeCssPath)
        )
      );
    }
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics: sortDiagnostics(diagnostics),
  };
}

export async function runTokenRuntimeCompatibilityCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const runCheck = options.runCheck ?? runTokenRuntimeCompatibilityCheck;

  if (args.length > 0) {
    writeLine(stderr, runtimeCompatibilityUsage);
    return 1;
  }

  try {
    const result = await runCheck();
    if (!result.ok) {
      for (const diagnostic of result.diagnostics) {
        writeLine(stderr, formatDiagnostic(diagnostic));
      }
      writeLine(stderr, rebuildHint);
      return 1;
    }

    writeLine(stdout, '✓ Runtime CSS compatibility surface is intact');
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLine(stderr, `[UNEXPECTED_RUNTIME_FAILURE] ${message}`);
    return 3;
  }
}

export function extractCssCustomProperties(cssSource) {
  return new Set([...cssSource.matchAll(/^\s*(--[a-z0-9-]+):\s*.+;$/gm)].map((match) => match[1]));
}

function readTextFile(filePath, diagnostics, message) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    diagnostics.push(
      createDiagnostic(
        'RUNTIME_COMPATIBILITY_CONTRACT_INVALID',
        `${message}: ${formatError(error)}. ${rebuildHint}`,
        toRepoRelative(filePath)
      )
    );
    return null;
  }
}

function readJsonFile(filePath, diagnostics, message) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    diagnostics.push(
      createDiagnostic(
        'RUNTIME_COMPATIBILITY_CONTRACT_INVALID',
        `${message}: ${formatError(error)}. ${rebuildHint}`,
        toRepoRelative(filePath)
      )
    );
    return null;
  }
}

function collectLegacyVars(document, path, label) {
  const entries = document?.entries;
  if (!Array.isArray(entries)) {
    return {
      legacyVars: [],
      diagnostics: [
        createDiagnostic(
          'RUNTIME_COMPATIBILITY_CONTRACT_INVALID',
          `Runtime compatibility ${label} must expose an entries array. ${rebuildHint}`,
          path
        ),
      ],
    };
  }

  const legacyVars = [];
  const seenLegacyVars = new Set();
  const diagnostics = [];

  entries.forEach((entry, index) => {
    const legacyVar = entry?.legacyVar;
    if (typeof legacyVar !== 'string' || legacyVar.length === 0) {
      diagnostics.push(
        createDiagnostic(
          'RUNTIME_COMPATIBILITY_CONTRACT_INVALID',
          `Runtime compatibility ${label} entry ${index} must declare a non-empty legacyVar string. ${rebuildHint}`,
          path
        )
      );
      return;
    }

    if (seenLegacyVars.has(legacyVar)) {
      diagnostics.push(
        createDiagnostic(
          'RUNTIME_COMPATIBILITY_CONTRACT_INVALID',
          `Runtime compatibility ${label} contains duplicate legacy variable "${legacyVar}". ${rebuildHint}`,
          path
        )
      );
      return;
    }

    seenLegacyVars.add(legacyVar);
    legacyVars.push(legacyVar);
  });

  return { legacyVars, diagnostics };
}

function createContractMismatchDiagnostics(
  inventoryLegacyVars,
  aliasLegacyVars,
  inventoryPath,
  aliasMapPath
) {
  const inventorySet = new Set(inventoryLegacyVars);
  const aliasSet = new Set(aliasLegacyVars);
  const diagnostics = [];

  for (const legacyVar of inventoryLegacyVars) {
    if (aliasSet.has(legacyVar)) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(
        'RUNTIME_COMPATIBILITY_CONTRACT_MISMATCH',
        `Runtime compatibility alias map is missing legacy variable "${legacyVar}" declared in the runtime inventory. ${rebuildHint}`,
        aliasMapPath
      )
    );
  }

  for (const legacyVar of aliasLegacyVars) {
    if (inventorySet.has(legacyVar)) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(
        'RUNTIME_COMPATIBILITY_CONTRACT_MISMATCH',
        `Runtime compatibility inventory is missing legacy variable "${legacyVar}" declared in the alias map. ${rebuildHint}`,
        inventoryPath
      )
    );
  }

  return diagnostics;
}

function createDiagnostic(code, message, path) {
  return {
    severity: 'error',
    code,
    message,
    path,
    rule: 'CT-6',
  };
}

function formatError(error) {
  return error instanceof Error && error.message.length > 0 ? error.message : 'unknown failure';
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
