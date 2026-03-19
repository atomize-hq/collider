import fs from 'node:fs';
import path from 'node:path';
import StyleDictionary from 'style-dictionary';
import {
  buildArtifacts,
  figmaTokensPath,
  generatedFileBanner,
  stagedRuntimeCssPath,
  typedTokensPath,
} from '../../design-tokens/build/paths.mjs';
import {
  createStyleDictionaryConfig,
  ensureStyleDictionaryHooksRegistered,
} from '../../design-tokens/build/style-dictionary.config.mjs';
import { createFigmaTokenDocument, loadBuildGraph } from './token-build-graph.mjs';

const newline = '\n';
const typedFileBanner = `// ${generatedFileBanner.slice(3, -3).trim()}`;

export async function buildTokenArtifacts(options = {}) {
  const graph = loadBuildGraph(options);
  const before = captureArtifactContents(buildArtifacts);
  const cssContents = await buildRuntimeCssArtifact(graph.materializedTokens);
  const typedModule = generateTypedTokenModule(graph);
  const figmaDocument = serializeJson(createFigmaTokenDocument(graph));

  const statuses = {
    'runtime-css': before.get(stagedRuntimeCssPath) === cssContents ? 'unchanged' : 'written',
    'typed-tokens': writeTextArtifact(typedTokensPath, typedModule, before),
    'figma-tokens': writeTextArtifact(figmaTokensPath, figmaDocument, before),
  };

  return {
    graph,
    artifacts: buildArtifacts.map((artifact) => ({
      id: artifact.id,
      kind: artifact.kind,
      path: artifact.relPath,
      status: statuses[artifact.id],
    })),
  };
}

export function generateTypedTokenModule(graph) {
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

  return sections.join(newline);
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

async function buildRuntimeCssArtifact(tokens) {
  ensureStyleDictionaryHooksRegistered(StyleDictionary);
  const config = createStyleDictionaryConfig(tokens);
  const dictionary = new StyleDictionary(config, { verbosity: 'silent' });
  await dictionary.buildAllPlatforms();

  const rawCss = fs.readFileSync(stagedRuntimeCssPath, 'utf8');
  const normalized = normalizeText(rawCss);
  ensureParentDirectory(stagedRuntimeCssPath);
  fs.writeFileSync(stagedRuntimeCssPath, normalized, 'utf8');
  return normalized;
}

function writeTextArtifact(filePath, contents, before) {
  ensureParentDirectory(filePath);
  const normalized = normalizeText(contents);
  const previous = before.get(filePath) ?? null;
  if (previous !== normalized) {
    fs.writeFileSync(filePath, normalized, 'utf8');
    return 'written';
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, normalized, 'utf8');
    return 'written';
  }

  return 'unchanged';
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(text) {
  return text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replace(/\n?$/, '\n');
}
