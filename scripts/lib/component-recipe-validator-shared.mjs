import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '../..');

export function readJson(filePath, startup) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      startup
        ? `recipe validator setup: $ [startup] ${reason}`
        : `${relativePath(filePath)}: $ [json-parse] ${reason}`
    );
  }
}

export function relativePath(filePath) {
  return path.relative(repoRoot, filePath) || path.basename(filePath);
}

export function formatDiagnostic(filePath, error) {
  return `${relativePath(filePath)}: ${error.path} [${error.rule}] ${error.message}`;
}

export function resolveFiles(pattern) {
  const absolute = path.isAbsolute(pattern);
  const normalizedPattern = normalizePath(pattern);
  const prefix = absolute ? path.parse(normalizedPattern).root : '';
  const root = absolute
    ? path.join(prefix, staticSearchRoot(normalizedPattern.slice(prefix.length), '.'))
    : path.join(repoRoot, staticSearchRoot(normalizedPattern, '.'));
  const matcher = createGlobMatcher(normalizedPattern);
  return walkFiles(root)
    .filter((filePath) => {
      const candidate = absolute ? normalizePath(filePath) : normalizePath(relativePath(filePath));
      return matcher.test(candidate);
    })
    .sort((a, b) => a.localeCompare(b));
}

export function diag(pathValue, rule, message) {
  return { path: pathValue, rule, message };
}

export function isObject(value) {
  return Boolean(value) && Object.prototype.toString.call(value) === '[object Object]';
}

export function formatPath(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
}

export function expectValue(ok, pathValue, rule, message) {
  return ok ? null : diag(pathValue, rule, message);
}

export function expectObject(value, jsonPath, message) {
  return expectValue(isObject(value), jsonPath, 'type', message);
}

export function expectIdentifier(value, rules, jsonPath, message) {
  return expectValue(
    typeof value === 'string' && rules.identifier.test(value),
    jsonPath,
    'pattern',
    message
  );
}

export function expectRequired(value, required, jsonPath) {
  for (const key of required) {
    if (!(key in value)) {
      return diag(jsonPath, 'required', `missing required property "${key}"`);
    }
  }
  return null;
}

export function expectNoExtras(value, allowed, jsonPath, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      return diag(
        `${jsonPath}${formatPath(key)}`,
        'additional-property',
        `unknown ${label} property "${key}"`
      );
    }
  }
  return null;
}

function walkFiles(startPath) {
  if (!existsSync(startPath)) return [];
  if (statSync(startPath).isFile()) return [path.resolve(startPath)];
  return readdirSync(startPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(startPath, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [path.resolve(entryPath)];
  });
}

function staticSearchRoot(pattern, fallbackRoot) {
  const pieces = pattern.split('/');
  const staticPieces = [];
  for (const piece of pieces) {
    if (/[?*[\]{}]/.test(piece)) break;
    if (piece.length && piece !== '.') staticPieces.push(piece);
  }
  return staticPieces.length ? staticPieces.join('/') : fallbackRoot;
}

function normalizePath(value) {
  return value.replaceAll(path.sep, '/');
}

function createGlobMatcher(pattern) {
  let source = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === '*' && next === '*') {
      source += '.*';
      index += 1;
      continue;
    }
    if (char === '*') {
      source += '[^/]*';
      continue;
    }
    if (char === '?') {
      source += '[^/]';
      continue;
    }
    source += /[\\^$+?.()|{}[\]]/.test(char) ? `\\${char}` : char;
  }
  return new RegExp(`${source}$`);
}
