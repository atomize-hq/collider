import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, runtimeCssPath, toRepoRelative } from '../../design-tokens/build/paths.mjs';

export const runtimeCompatibilitySurfacePath = path.join(
  repoRoot,
  'scripts/token-runtime-compatibility-surface.json'
);
export const runtimeCompatibilityRebuildHint =
  'Rebuild generated token artifacts with `pnpm build:tokens`.';

export function runRuntimeCssCompatibilityCheck(options = {}) {
  const runtimeCssFilePath = options.runtimeCssPath ?? runtimeCssPath;
  const compatibilitySurface = loadRuntimeCompatibilitySurface(options.surfacePath);
  const runtimeCss = fs.readFileSync(runtimeCssFilePath, 'utf8');
  const declaredVariables = extractCustomPropertyNames(runtimeCss);
  const missingProperties = compatibilitySurface.requiredCustomProperties.filter(
    (propertyName) => !declaredVariables.has(propertyName)
  );

  return {
    ok: missingProperties.length === 0,
    diagnostics: missingProperties.map((propertyName) =>
      createRuntimeCompatibilityDiagnostic(propertyName, runtimeCssFilePath)
    ),
  };
}

export function loadRuntimeCompatibilitySurface(surfacePath = runtimeCompatibilitySurfacePath) {
  const parsed = JSON.parse(fs.readFileSync(surfacePath, 'utf8'));
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray(parsed.requiredCustomProperties) ||
    parsed.requiredCustomProperties.some(
      (propertyName) => typeof propertyName !== 'string' || propertyName.length === 0
    )
  ) {
    throw new Error(
      'runtime compatibility surface must define a non-empty requiredCustomProperties string array'
    );
  }

  return parsed;
}

export function extractCustomPropertyNames(cssSource) {
  return new Set([...cssSource.matchAll(/^\s*(--[a-z0-9-]+):/gmu)].map((match) => match[1]));
}

function createRuntimeCompatibilityDiagnostic(propertyName, runtimeCssFilePath) {
  return {
    severity: 'error',
    code: 'RUNTIME_CSS_COMPATIBILITY_MISSING',
    message: `generated runtime CSS is missing required legacy custom property "${propertyName}". ${runtimeCompatibilityRebuildHint}`,
    path: toRepoRelative(runtimeCssFilePath),
    rule: 'CT-6',
  };
}
