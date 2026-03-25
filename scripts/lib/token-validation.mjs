import fs from 'node:fs';
import path from 'node:path';
import {
  pilotComponentsPath as defaultPilotComponentsPath,
  recipeFilesGlob as defaultRecipeFilesGlob,
  recipeSchemaPath as defaultRecipeSchemaPath,
  repoRoot as defaultRepoRoot,
  themeRegistryPath as defaultThemeRegistryPath,
  tokenFilesGlob as defaultTokenFilesGlob,
} from '../../design-tokens/build/paths.mjs';
import {
  createActivePilotRegistry,
  validatePilotContract,
  validateTokenLeaves,
} from './component-recipe-validator-conformance.mjs';
import { createRules, validateRecipeShape } from './component-recipe-validator-shape.mjs';
import { isObject, readJson, resolveFiles } from './component-recipe-validator-shared.mjs';

const tokenReferencePattern = /^\{([^}]+)\}$/;

export function runTokenValidation(options = {}) {
  const config = {
    repoRoot: options.repoRoot ?? defaultRepoRoot,
    tokenGlob: options.tokenGlob ?? defaultTokenFilesGlob,
    recipeGlob: options.recipeGlob ?? defaultRecipeFilesGlob,
    registryPath: options.registryPath ?? defaultThemeRegistryPath,
    recipeSchemaPath: options.recipeSchemaPath ?? defaultRecipeSchemaPath,
    pilotComponentsPath: options.pilotComponentsPath ?? defaultPilotComponentsPath,
  };

  const tokenFiles = resolveTokenFiles(config.tokenGlob);
  const recipeFiles = resolveFiles(config.recipeGlob);
  const parseDiagnostics = [
    ...missingSourceDiagnostics(tokenFiles, config.tokenGlob, 'TOKEN_SOURCE_MISSING', 'CT-1'),
    ...(recipeFiles.length === 0 ? [] : []), // Recipes are optional — zero recipe files is valid
    ...missingFileDiagnostics(
      config.registryPath,
      'THEME_REGISTRY_MISSING',
      'CT-2',
      config.repoRoot
    ),
  ];

  const sourceDocs = new Map();
  for (const filePath of [...tokenFiles, config.registryPath, ...recipeFiles]) {
    if (sourceDocs.has(filePath)) continue;
    const parsed = parseJsonSource(filePath, config.repoRoot);
    if ('diagnostic' in parsed) {
      parseDiagnostics.push(parsed.diagnostic);
      continue;
    }
    sourceDocs.set(filePath, parsed.value);
  }

  if (parseDiagnostics.length > 0) {
    return { ok: false, diagnostics: sortDiagnostics(parseDiagnostics) };
  }

  const shapeDiagnostics = [];
  for (const filePath of tokenFiles) {
    shapeDiagnostics.push(
      ...validateTokenDocument(sourceDocs.get(filePath), filePath, config.repoRoot)
    );
  }
  if (shapeDiagnostics.length > 0) {
    return { ok: false, diagnostics: sortDiagnostics(shapeDiagnostics) };
  }

  const themeDiagnostics = validateThemeRegistry({
    tokenFiles,
    tokenDocs: sourceDocs,
    registryPath: config.registryPath,
    repoRoot: config.repoRoot,
  });
  if (themeDiagnostics.length > 0) {
    return { ok: false, diagnostics: sortDiagnostics(themeDiagnostics) };
  }

  const rules = createRules(readJson(config.recipeSchemaPath, true));
  const activePilots = createActivePilotRegistry(readJson(config.pilotComponentsPath, true));
  const recipeDiagnostics = [];
  for (const filePath of recipeFiles) {
    const recipe = sourceDocs.get(filePath);
    const fileStem = path.basename(filePath, '.recipe.json');
    const shapeError =
      validateRecipeShape(recipe, fileStem, rules) ?? validatePilotContract(recipe, activePilots);

    if (shapeError) {
      recipeDiagnostics.push(
        createDiagnostic({
          code: 'INVALID_RECIPE_SHAPE',
          message: shapeError.message,
          path: filePath,
          rule: 'CT-3',
          repoRoot: config.repoRoot,
        })
      );
    }
  }

  if (recipeDiagnostics.length > 0) {
    return { ok: false, diagnostics: sortDiagnostics(recipeDiagnostics) };
  }

  const tokenInventory = buildTokenInventory(tokenFiles, sourceDocs);
  const referenceDiagnostics = [];
  for (const filePath of tokenFiles) {
    referenceDiagnostics.push(
      ...validateTokenReferences(
        sourceDocs.get(filePath),
        filePath,
        config.repoRoot,
        tokenInventory
      )
    );
  }
  for (const filePath of recipeFiles) {
    const recipe = sourceDocs.get(filePath);
    const error =
      validateTokenLeaves(recipe.slots, '$.slots', tokenInventory, rules) ??
      validateTokenLeaves(recipe.states, '$.states', tokenInventory, rules);
    if (error) {
      referenceDiagnostics.push(
        createDiagnostic({
          code: 'BROKEN_TOKEN_REFERENCE',
          message: error.message,
          path: filePath,
          rule: 'CT-1',
          repoRoot: config.repoRoot,
        })
      );
    }
  }

  return {
    ok: referenceDiagnostics.length === 0,
    diagnostics: sortDiagnostics(referenceDiagnostics),
  };
}

export function sortDiagnostics(diagnostics) {
  return [...diagnostics].sort((left, right) => {
    const pathCompare = (left.path ?? '').localeCompare(right.path ?? '');
    if (pathCompare !== 0) return pathCompare;

    const lineCompare =
      (left.line ?? Number.MAX_SAFE_INTEGER) - (right.line ?? Number.MAX_SAFE_INTEGER);
    if (lineCompare !== 0) return lineCompare;

    const columnCompare =
      (left.column ?? Number.MAX_SAFE_INTEGER) - (right.column ?? Number.MAX_SAFE_INTEGER);
    if (columnCompare !== 0) return columnCompare;

    return left.code.localeCompare(right.code);
  });
}

export function formatDiagnostic(diagnostic) {
  const location =
    diagnostic.line && diagnostic.column ? `:${diagnostic.line}:${diagnostic.column}` : '';
  const filePath = diagnostic.path ? `${diagnostic.path}${location}` : '<root>';
  const rule = diagnostic.rule ? ` [${diagnostic.rule}]` : '';
  return `${filePath}: [${diagnostic.code}]${rule} ${diagnostic.message}`;
}

function validateTokenDocument(node, filePath, repoRoot) {
  return walkTokenNode(node, '$', filePath, repoRoot);
}

function walkTokenNode(node, jsonPath, filePath, repoRoot) {
  if (!isObject(node)) {
    return [
      createDiagnostic({
        code: 'INVALID_DTCG_JSON',
        message: 'token nodes must be objects',
        path: filePath,
        rule: 'CT-1',
        repoRoot,
      }),
    ];
  }

  const keys = Object.keys(node);
  const nonMetaKeys = keys.filter((key) => !key.startsWith('$'));
  const hasValue = '$value' in node;
  const hasType = '$type' in node;
  if (hasValue || hasType) {
    if (nonMetaKeys.length > 0) {
      return [
        createDiagnostic({
          code: 'INVALID_DTCG_JSON',
          message: `${jsonPath} cannot mix token leaves with nested groups`,
          path: filePath,
          rule: 'CT-1',
          repoRoot,
        }),
      ];
    }
    if (!hasValue || !hasType) {
      return [
        createDiagnostic({
          code: 'INVALID_DTCG_JSON',
          message: `${jsonPath} must include both $value and $type`,
          path: filePath,
          rule: 'CT-1',
          repoRoot,
        }),
      ];
    }
    if (typeof node.$type !== 'string' || node.$type.length === 0) {
      return [
        createDiagnostic({
          code: 'INVALID_DTCG_JSON',
          message: `${jsonPath} has an invalid $type`,
          path: filePath,
          rule: 'CT-1',
          repoRoot,
        }),
      ];
    }
    return [];
  }

  const diagnostics = [];
  for (const key of nonMetaKeys) {
    const child = node[key];
    const childPath = `${jsonPath}.${key}`;
    diagnostics.push(...walkTokenNode(child, childPath, filePath, repoRoot));
  }
  return diagnostics;
}

function validateThemeRegistry({ tokenFiles, tokenDocs, registryPath, repoRoot }) {
  const diagnostics = [];
  const registry = tokenDocs.get(registryPath);
  if (!isObject(registry) || !Array.isArray(registry.themes)) {
    return [
      createDiagnostic({
        code: 'INVALID_THEME_REGISTRY',
        message: 'theme registry must be an object with a themes array',
        path: registryPath,
        rule: 'CT-2',
        repoRoot,
      }),
    ];
  }

  const themeEntries = new Map();
  for (const theme of registry.themes) {
    if (!isObject(theme) || typeof theme.id !== 'string' || typeof theme.file !== 'string') {
      diagnostics.push(
        createDiagnostic({
          code: 'INVALID_THEME_REGISTRY',
          message: 'theme entries require string id and file properties',
          path: registryPath,
          rule: 'CT-2',
          repoRoot,
        })
      );
      continue;
    }
    themeEntries.set(theme.id, theme);
  }

  if (registry.defaultThemeId !== 'dark' || registry.terminalFallbackThemeId !== 'dark') {
    diagnostics.push(
      createDiagnostic({
        code: 'INVALID_THEME_ID',
        message: 'defaultThemeId and terminalFallbackThemeId must both be "dark"',
        path: registryPath,
        rule: 'CT-2',
        repoRoot,
      })
    );
  }

  if (registry.unknownThemeIdBehavior !== 'error') {
    diagnostics.push(
      createDiagnostic({
        code: 'INVALID_THEME_ID',
        message: 'unknownThemeIdBehavior must be "error"',
        path: registryPath,
        rule: 'CT-2',
        repoRoot,
      })
    );
  }

  const darkTheme = themeEntries.get('dark');
  if (!darkTheme || darkTheme.required !== true || darkTheme.extends !== null) {
    diagnostics.push(
      createDiagnostic({
        code: 'INVALID_THEME_ID',
        message: 'dark must exist as the required root theme with extends set to null',
        path: registryPath,
        rule: 'CT-2',
        repoRoot,
      })
    );
  }

  for (const [themeId, theme] of themeEntries) {
    if (theme.extends !== null && !themeEntries.has(theme.extends)) {
      diagnostics.push(
        createDiagnostic({
          code: 'INVALID_THEME_ID',
          message: `theme "${themeId}" extends unknown theme "${theme.extends}"`,
          path: registryPath,
          rule: 'CT-2',
          repoRoot,
        })
      );
    }

    const themeFile = tokenFiles.find((filePath) => filePath.endsWith(`/themes/${theme.file}`));
    if (!themeFile) {
      diagnostics.push(
        createDiagnostic({
          code: 'THEME_FILE_MISSING',
          message: `theme "${themeId}" references missing file "${theme.file}"`,
          path: registryPath,
          rule: 'CT-2',
          repoRoot,
        })
      );
      continue;
    }

    const declaredThemeId =
      tokenDocs.get(themeFile)?.$extensions?.['com.atomizehq.collider']?.themeId ?? null;
    if (declaredThemeId !== themeId) {
      diagnostics.push(
        createDiagnostic({
          code: 'INVALID_THEME_ID',
          message: `theme file "${relativePath(themeFile, repoRoot)}" must declare themeId "${themeId}"`,
          path: themeFile,
          rule: 'CT-2',
          repoRoot,
        })
      );
    }
  }

  return diagnostics;
}

function validateTokenReferences(node, filePath, repoRoot, tokenInventory) {
  const diagnostics = [];
  walkReferenceNodes(node, (jsonPath, value) => {
    const match = typeof value === 'string' ? tokenReferencePattern.exec(value) : null;
    if (!match) return;

    if (!tokenInventory.has(match[1])) {
      diagnostics.push(
        createDiagnostic({
          code: 'BROKEN_TOKEN_REFERENCE',
          message: `${jsonPath} references unknown token "${value}"`,
          path: filePath,
          rule: 'CT-1',
          repoRoot,
        })
      );
    }
  });
  return diagnostics;
}

function walkReferenceNodes(node, visit, trail = '$') {
  if (!isObject(node)) return;
  if ('$value' in node && '$type' in node) {
    visit(`${trail}.$value`, node.$value);
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    walkReferenceNodes(child, visit, `${trail}.${key}`);
  }
}

function buildTokenInventory(tokenFiles, tokenDocs) {
  const inventory = new Set();
  for (const filePath of tokenFiles) {
    collectTokenIds(tokenDocs.get(filePath), tokenIdPrefix(filePath), inventory);
  }
  return inventory;
}

function collectTokenIds(node, trail, inventory) {
  if (!isObject(node)) return;
  if ('$value' in node && '$type' in node) {
    inventory.add(trail.join('.'));
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith('$')) collectTokenIds(child, [...trail, key], inventory);
  }
}

function tokenIdPrefix(filePath) {
  if (filePath.endsWith('/core.tokens.json')) return ['core'];
  if (filePath.endsWith('/semantic.tokens.json')) return ['semantic'];
  if (filePath.endsWith('/motion.tokens.json')) return ['motion'];
  return [];
}

function parseJsonSource(filePath, repoRoot) {
  try {
    return { value: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (error) {
    const lineColumn = parseLineColumn(error, filePath);
    return {
      diagnostic: createDiagnostic({
        code: 'INVALID_JSON',
        message: error instanceof Error ? error.message : String(error),
        path: filePath,
        rule: inferRule(filePath),
        repoRoot,
        ...lineColumn,
      }),
    };
  }
}

function missingSourceDiagnostics(files, globPattern, code, rule) {
  return files.length > 0
    ? []
    : [createDiagnostic({ code, message: `no files matched "${globPattern}"`, rule })];
}

function missingFileDiagnostics(filePath, code, rule, repoRoot) {
  return fs.existsSync(filePath)
    ? []
    : [
        createDiagnostic({
          code,
          message: `required file is missing: ${relativePath(filePath, repoRoot)}`,
          path: filePath,
          rule,
          repoRoot,
        }),
      ];
}

function parseLineColumn(error, filePath) {
  const message = error instanceof Error ? error.message : String(error);
  const directMatch = /line (\d+) column (\d+)/i.exec(message);
  if (directMatch) {
    return { line: Number(directMatch[1]), column: Number(directMatch[2]) };
  }

  const positionMatch = /position (\d+)/i.exec(message);
  if (!positionMatch) return {};

  const offset = Number(positionMatch[1]);
  const prefix = fs.readFileSync(filePath, 'utf8').slice(0, offset);
  const lines = prefix.split('\n');
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function inferRule(filePath) {
  if (filePath.includes('/recipes/')) return 'CT-3';
  if (filePath.includes('/themes/registry.json')) return 'CT-2';
  return 'CT-1';
}

function createDiagnostic({
  code,
  message,
  path: filePath,
  rule,
  repoRoot = defaultRepoRoot,
  line,
  column,
}) {
  return {
    severity: 'error',
    code,
    message,
    ...(filePath ? { path: relativePath(filePath, repoRoot) } : {}),
    ...(rule ? { rule } : {}),
    ...(line ? { line } : {}),
    ...(column ? { column } : {}),
  };
}

function relativePath(filePath, repoRoot) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function resolveTokenFiles(pattern) {
  const nestedFiles = resolveFiles(pattern);
  const rootPattern = pattern.replace('/**/*.tokens.json', '/*.tokens.json');
  const rootFiles = rootPattern === pattern ? [] : resolveFiles(rootPattern);
  return [...new Set([...nestedFiles, ...rootFiles])].sort((left, right) =>
    left.localeCompare(right)
  );
}
