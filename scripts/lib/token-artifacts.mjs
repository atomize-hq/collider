import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import StyleDictionary from 'style-dictionary';
import {
  buildArtifacts,
  buildWriteTargets,
  figmaTokensPath,
  generatedFileBanner,
  runtimeCssPath,
  stagedRuntimeCssPath,
  toRepoRelative,
  typedTokensPath,
} from '../../design-tokens/build/paths.mjs';
import {
  createStyleDictionaryConfig,
  ensureStyleDictionaryHooksRegistered,
} from '../../design-tokens/build/style-dictionary.config.mjs';
import { buildPublishedRuntimeCss } from './runtime-css-publication.mjs';
import { createFigmaTokenDocument, loadBuildGraph } from './token-build-graph.mjs';

const newline = '\n';
const typedFileBanner = `// ${generatedFileBanner.slice(3, -3).trim()}`;

export async function buildTokenArtifacts(options = {}) {
  const graph = loadBuildGraph(options);
  const artifactManifest = options.artifacts ?? buildArtifacts;
  const before = captureArtifactContents(artifactManifest);
  const cssContents = await buildRuntimeCssArtifact(graph.materializedTokens, options);
  const publishedRuntimeCss = buildPublishedRuntimeCss({
    stagedCss: cssContents,
    themeId: graph.themeId,
    generatedFileBanner,
    runtimeAliasMapPath: options.runtimeAliasMapPath,
    runtimeInventoryPath: options.runtimeInventoryPath,
  });
  const typedModule = await generateTypedTokenModule(graph);
  const figmaDocument = serializeJson(createFigmaTokenDocument(graph));

  const statuses = {
    'typed-tokens': writeTextArtifact(
      options.typedTokensPath ?? typedTokensPath,
      typedModule,
      before
    ),
    'figma-tokens': writeTextArtifact(
      options.figmaTokensPath ?? figmaTokensPath,
      figmaDocument,
      before
    ),
    'runtime-css': writeTextArtifact(
      options.runtimeCssPath ?? runtimeCssPath,
      publishedRuntimeCss,
      before
    ),
  };

  return {
    graph,
    artifacts: artifactManifest.map((artifact) => ({
      id: artifact.id,
      kind: artifact.kind,
      path: artifact.relPath,
      status: statuses[artifact.id],
    })),
  };
}

export async function generateTypedTokenModule(graph) {
  const sections = [
    typedFileBanner,
    '',
    `export const themeRegistry = ${serializeJson(graph.themeRegistry).trimEnd()} as const;`,
    '',
    `export const tokenMap = ${serializeJson(graph.tokenMap).trimEnd()} as const;`,
    '',
    `export const recipeMap = ${serializeJson(graph.recipeMap).trimEnd()} as const;`,
    '',
    `export type ThemeId = (typeof themeRegistry.themes)[number]['id'];`,
    `export type TokenId = keyof typeof tokenMap;`,
    `export type RecipeComponentId = keyof typeof recipeMap;`,
    '',
  ];

  const prettierConfig = (await prettier.resolveConfig(typedTokensPath)) ?? {};

  return prettier.format(sections.join(newline), {
    ...prettierConfig,
    filepath: typedTokensPath,
  });
}

export function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}${newline}`;
}

function captureArtifactContents(artifacts) {
  return new Map(
    artifacts.map((artifact) => [
      artifact.absPath,
      fs.existsSync(artifact.absPath)
        ? normalizeText(fs.readFileSync(artifact.absPath, 'utf8'))
        : null,
    ])
  );
}

async function buildRuntimeCssArtifact(tokens, options = {}) {
  const runtimeCssStagePath = options.stagedRuntimeCssPath ?? stagedRuntimeCssPath;

  ensureStyleDictionaryHooksRegistered(StyleDictionary);
  const config = createStyleDictionaryConfig(tokens, {
    cssBuildPath: path.dirname(runtimeCssStagePath),
  });
  const dictionary = new StyleDictionary(config, { verbosity: 'silent' });
  await dictionary.buildAllPlatforms();

  const rawCss = fs.readFileSync(runtimeCssStagePath, 'utf8');
  const normalized = normalizeText(rawCss);
  ensureParentDirectory(runtimeCssStagePath);
  atomicWriteText(runtimeCssStagePath, normalized);
  return normalized;
}

function writeTextArtifact(filePath, contents, before) {
  const normalized = normalizeText(contents);
  const previous = before.get(filePath) ?? null;
  if (previous === normalized && fs.existsSync(filePath)) {
    return 'unchanged';
  }

  ensureParentDirectory(filePath);
  atomicWriteText(filePath, normalized);
  return 'written';
}

function ensureParentDirectory(filePath) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  } catch (error) {
    throw createArtifactWriteContractError(filePath, error);
  }
}

function atomicWriteText(filePath, contents) {
  const tempPath = `${filePath}.tmp-${process.pid}`;

  try {
    fs.writeFileSync(tempPath, contents, 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    try {
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { force: true });
      }
    } catch {}
    throw createArtifactWriteContractError(filePath, error);
  }
}

function normalizeText(text) {
  return text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replace(/\n?$/, '\n');
}

function createArtifactWriteContractError(filePath, error) {
  const reason = error instanceof Error ? error.message : String(error);
  const wrapped = new Error(
    `artifact write contract failure for ${toRepoRelative(filePath)}: ${reason}`
  );
  wrapped.name = 'ArtifactWriteContractError';
  wrapped.diagnostics = [createArtifactWriteDiagnostic(filePath, reason)];
  return wrapped;
}

function createArtifactWriteDiagnostic(filePath, message) {
  return {
    severity: 'error',
    code: 'ARTIFACT_PATH_UNWRITABLE',
    message,
    path: toRepoRelative(filePath),
    rule: 'CT-5',
  };
}

export function isArtifactWriteContractError(error) {
  return (
    error instanceof Error &&
    error.name === 'ArtifactWriteContractError' &&
    Array.isArray(error.diagnostics)
  );
}

export function getBuildWriteTargets(options = {}) {
  const runtimeCssStagePath = options.stagedRuntimeCssPath ?? stagedRuntimeCssPath;
  const runtimeCssDestinationPath = options.runtimeCssPath ?? runtimeCssPath;
  const typedTokensDestinationPath = options.typedTokensPath ?? typedTokensPath;
  const figmaTokensDestinationPath = options.figmaTokensPath ?? figmaTokensPath;

  return buildWriteTargets.map((artifact) => {
    if (artifact.id === 'runtime-css-stage') {
      return {
        ...artifact,
        absPath: runtimeCssStagePath,
      };
    }
    if (artifact.id === 'runtime-css') {
      return {
        ...artifact,
        absPath: runtimeCssDestinationPath,
      };
    }
    if (artifact.id === 'typed-tokens') {
      return {
        ...artifact,
        absPath: typedTokensDestinationPath,
      };
    }
    if (artifact.id === 'figma-tokens') {
      return {
        ...artifact,
        absPath: figmaTokensDestinationPath,
      };
    }
    return artifact;
  });
}
