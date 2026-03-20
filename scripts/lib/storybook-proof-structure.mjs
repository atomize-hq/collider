import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import ts from 'typescript';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  allowedStorybookValidatorKinds,
  loadAndValidateStoryInventory,
} from './storybook-story-inventory.mjs';
import { loadAndValidateComponentTierPolicy } from './storybook-tier-policy.mjs';
import { validateComponentSpec } from './storybook-component-spec.mjs';

const require = createRequire(import.meta.url);
const { storyNameFromExport, toId } = require('storybook/internal/csf');
const validatorKindOrder = new Map(
  allowedStorybookValidatorKinds.map((kind, index) => [kind, index])
);

export const storybookProofStructureUsage =
  'Usage: node scripts/validate-storybook-proof-structure.mjs [path-to-repo-root]';

export function loadAndValidateStorybookProofStructure(options = {}) {
  const context = createValidationContext(options);
  const errors = [];

  const inventoryResult = loadAndValidateStoryInventory(context.inventoryPath);
  errors.push(...inventoryResult.errors);

  const tierPolicyResult = loadAndValidateComponentTierPolicy(context.componentTierPolicyPath);
  errors.push(...tierPolicyResult.errors);

  const specLoadResult = loadComponentSpecs(context.componentSpecsDir);
  errors.push(...specLoadResult.errors);

  const duplicateComponentIdErrors = validateDuplicateComponentIds(
    inventoryResult.data,
    specLoadResult.records,
    context.rootDir
  );
  errors.push(...duplicateComponentIdErrors);

  if (
    inventoryResult.errors.length > 0 ||
    tierPolicyResult.errors.length > 0 ||
    specLoadResult.errors.length > 0
  ) {
    return {
      data: {
        componentFacts: null,
        componentSpecs: specLoadResult.records,
        componentTierPolicy: tierPolicyResult.data,
        inventory: inventoryResult.data,
        storyIndex: null,
      },
      errors,
      rootDir: context.rootDir,
    };
  }

  const storyIndex = buildStoryIndex(context.storyRoots);
  errors.push(...storyIndex.errors);

  if (storyIndex.errors.length > 0) {
    return {
      data: {
        componentFacts: null,
        componentSpecs: specLoadResult.records,
        componentTierPolicy: tierPolicyResult.data,
        inventory: inventoryResult.data,
        storyIndex: storyIndex.data,
      },
      errors,
      rootDir: context.rootDir,
    };
  }

  const proofStructureInputs = {
    componentSpecs: specLoadResult.records,
    componentTierPolicy: tierPolicyResult.data,
    inventory: inventoryResult.data,
    rootDir: context.rootDir,
    storyIndex: storyIndex.data,
  };

  errors.push(...validateProofStructure(proofStructureInputs));

  return {
    data: {
      componentFacts: errors.length === 0 ? buildProofCoverageFacts(proofStructureInputs) : null,
      componentSpecs: specLoadResult.records,
      componentTierPolicy: tierPolicyResult.data,
      inventory: inventoryResult.data,
      storyIndex: storyIndex.data,
    },
    errors,
    rootDir: context.rootDir,
  };
}

function createValidationContext(options) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);

  return {
    componentSpecsDir: path.resolve(
      options.componentSpecsDir ?? path.join(rootDir, 'storybook/component-specs')
    ),
    componentTierPolicyPath: path.resolve(
      options.componentTierPolicyPath ?? path.join(rootDir, 'storybook/component-tier-policy.json')
    ),
    inventoryPath: path.resolve(
      options.inventoryPath ?? path.join(rootDir, 'storybook/story-inventory.json')
    ),
    rootDir,
    storyRoots: (
      options.storyRoots ?? [path.join(rootDir, 'src'), path.join(rootDir, 'storybook/stories')]
    ).map((storyRoot) => path.resolve(storyRoot)),
  };
}

function loadComponentSpecs(componentSpecsDir) {
  const errors = [];
  const records = [];

  if (!fs.existsSync(componentSpecsDir)) {
    return {
      errors: [
        `[CT-9B_PROOF_STRUCTURE_COMPONENT_SPEC_DIR_MISSING] component specs directory does not exist: ${componentSpecsDir}`,
      ],
      records,
    };
  }

  const entries = fs
    .readdirSync(componentSpecsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const absPath = path.join(componentSpecsDir, entry.name);
    const filenameStem = path.basename(entry.name, '.json');
    const data = JSON.parse(fs.readFileSync(absPath, 'utf8'));
    const specErrors = validateComponentSpec(data, { filenameStem });

    errors.push(...specErrors);
    records.push({
      absPath,
      data,
      filename: entry.name,
      filenameStem,
      relPath: normalizeRepoPath(path.relative(path.dirname(componentSpecsDir), absPath)),
    });
  }

  return { errors, records };
}

function buildStoryIndex(storyRoots) {
  const errors = [];
  const storiesByFile = new Map();
  const fileByStoryId = new Map();

  for (const storyRoot of storyRoots) {
    if (!fs.existsSync(storyRoot)) {
      continue;
    }

    for (const storyFile of collectStoryFiles(storyRoot)) {
      const result = parseStoryFile(storyFile);
      errors.push(...result.errors);

      if (result.storyIds.length === 0) {
        continue;
      }

      storiesByFile.set(storyFile, result.storyIds);
      for (const storyId of result.storyIds) {
        const existing = fileByStoryId.get(storyId);
        if (existing && existing !== storyFile) {
          errors.push(
            `[CT-9B_PROOF_STRUCTURE_DUPLICATE_STORY_ID] storyId "${storyId}" is declared by both ${existing} and ${storyFile}`
          );
          continue;
        }

        fileByStoryId.set(storyId, storyFile);
      }
    }
  }

  return {
    data: {
      fileByStoryId,
      storiesByFile,
    },
    errors,
  };
}

function collectStoryFiles(rootDir) {
  const results = [];
  const pending = [rootDir];

  while (pending.length > 0) {
    const nextDir = pending.pop();
    const entries = fs.readdirSync(nextDir, { withFileTypes: true });

    for (const entry of entries) {
      const absPath = path.join(nextDir, entry.name);
      if (entry.isDirectory()) {
        pending.push(absPath);
        continue;
      }

      if (entry.isFile() && /\.stories\.(ts|tsx)$/.test(entry.name)) {
        results.push(absPath);
      }
    }
  }

  return results.sort((left, right) => left.localeCompare(right));
}

function parseStoryFile(filePath) {
  const errors = [];
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const variableExpressions = new Map();
  let defaultExportExpression = null;
  const exportedStoryNames = [];

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      const isExported = hasExportModifier(statement);
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) {
          continue;
        }

        if (declaration.initializer) {
          variableExpressions.set(declaration.name.text, declaration.initializer);
        }

        if (isExported && isStoryExportName(declaration.name.text)) {
          exportedStoryNames.push(declaration.name.text);
        }
      }
      continue;
    }

    if (ts.isFunctionDeclaration(statement) && hasExportModifier(statement) && statement.name) {
      if (isStoryExportName(statement.name.text)) {
        exportedStoryNames.push(statement.name.text);
      }
      continue;
    }

    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      defaultExportExpression = statement.expression;
    }
  }

  const metaExpression = resolveExpression(defaultExportExpression, variableExpressions);
  const title = extractMetaTitle(metaExpression);

  if (!title) {
    errors.push(
      `[CT-9B_PROOF_STRUCTURE_STORY_META_TITLE_MISSING] ${filePath} must export a default meta object with a string title`
    );
    return { errors, storyIds: [] };
  }

  const storyIds = exportedStoryNames
    .sort((left, right) => left.localeCompare(right))
    .map((exportName) => toId(title, storyNameFromExport(exportName)));

  return { errors, storyIds };
}

function validateProofStructure({
  componentSpecs,
  componentTierPolicy,
  inventory,
  rootDir,
  storyIndex,
}) {
  const errors = [];
  const specsByComponentId = new Map();
  const inventoryByComponentId = new Map();

  for (const specRecord of componentSpecs) {
    specsByComponentId.set(specRecord.data.componentId, specRecord);
  }

  for (const component of inventory.components) {
    inventoryByComponentId.set(component.componentId, component);
  }

  for (const component of inventory.components) {
    const specRecord = specsByComponentId.get(component.componentId);
    if (!specRecord) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_MISSING_SPEC_FILE] componentId "${component.componentId}" is present in storybook/story-inventory.json but missing storybook/component-specs/${component.componentId}.json`
      );
      continue;
    }

    validateSpecTier(component.componentId, specRecord.data, componentTierPolicy, errors);
    validateInventoryStoryRefs(
      component.componentId,
      component,
      specRecord,
      rootDir,
      storyIndex,
      errors
    );
  }

  for (const specRecord of componentSpecs) {
    if (!inventoryByComponentId.has(specRecord.data.componentId)) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_ORPHAN_SPEC] componentId "${specRecord.data.componentId}" is defined by ${toRootRelative(rootDir, specRecord.absPath)} but missing from storybook/story-inventory.json`
      );
    }

    validateGeneratedArtifactRefs(
      specRecord.data.componentId,
      specRecord.data,
      rootDir,
      storyIndex,
      errors
    );
  }

  return errors;
}

function buildProofCoverageFacts({ componentSpecs, componentTierPolicy, inventory }) {
  const specsByComponentId = new Map(
    componentSpecs.map((specRecord) => [specRecord.data.componentId, specRecord.data])
  );

  return [...inventory.components]
    .sort((left, right) => left.componentId.localeCompare(right.componentId))
    .map((component) => {
      const componentSpec = specsByComponentId.get(component.componentId);
      const tierMinimumKinds =
        componentTierPolicy.tiers?.[componentSpec.tier]?.minimumRequiredKinds.map(
          (entry) => entry.kind
        ) ?? [];

      return {
        componentId: component.componentId,
        generatedArtifactRefs: { ...componentSpec.generatedArtifactRefs },
        implementedKinds: sortValidatorKinds(
          component.implementedStoryRefs.map((storyRef) => storyRef.kind)
        ),
        requiredKinds: sortValidatorKinds([
          ...tierMinimumKinds,
          ...componentSpec.requiredStoryKinds,
        ]),
        tier: componentSpec.tier,
      };
    });
}

function validateDuplicateComponentIds(inventory, specRecords, rootDir) {
  const errors = [];
  const inventorySources = new Map();
  const specSources = new Map();

  if (Array.isArray(inventory?.components)) {
    for (const [index, component] of inventory.components.entries()) {
      if (typeof component?.componentId !== 'string' || component.componentId.length === 0) {
        continue;
      }

      pushComponentIdSource(
        inventorySources,
        component.componentId,
        `storyInventory.components[${index}]`
      );
    }
  }

  for (const specRecord of specRecords) {
    if (
      typeof specRecord.data?.componentId !== 'string' ||
      specRecord.data.componentId.length === 0
    ) {
      continue;
    }

    pushComponentIdSource(
      specSources,
      specRecord.data.componentId,
      toRootRelative(rootDir, specRecord.absPath)
    );
  }

  for (const [componentId, sources] of inventorySources.entries()) {
    if (sources.length > 1) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_DUPLICATE_COMPONENT_ID] componentId "${componentId}" appears multiple times in storybook/story-inventory.json: ${sources.join(', ')}`
      );
    }
  }

  for (const [componentId, sources] of specSources.entries()) {
    if (sources.length > 1) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_DUPLICATE_COMPONENT_ID] componentId "${componentId}" appears in multiple component spec files: ${sources.join(', ')}`
      );
    }
  }

  return errors;
}

function validateSpecTier(componentId, componentSpec, componentTierPolicy, errors) {
  const tierEntry = componentTierPolicy.tiers?.[componentSpec.tier];
  if (!tierEntry) {
    errors.push(
      `[CT-9B_PROOF_STRUCTURE_UNKNOWN_TIER] componentId "${componentId}" references unknown tier "${componentSpec.tier}" in componentSpec.tier`
    );
    return;
  }

  const requiredStoryKindSet = new Set(componentSpec.requiredStoryKinds);
  for (const requiredEntry of tierEntry.minimumRequiredKinds) {
    if (requiredStoryKindSet.has(requiredEntry.kind)) {
      continue;
    }

    errors.push(
      `[CT-9B_PROOF_STRUCTURE_TIER_MINIMUM_KIND_MISSING] componentId "${componentId}" tier "${componentSpec.tier}" requires kind "${requiredEntry.kind}" in componentSpec.requiredStoryKinds`
    );
  }
}

function validateInventoryStoryRefs(
  componentId,
  inventoryEntry,
  specRecord,
  rootDir,
  storyIndex,
  errors
) {
  const ownedStoryIds = new Set(specRecord.data.ownedStoryRefs.map((entry) => entry.storyId));
  const generatedArtifactPaths = getGeneratedArtifactPaths(specRecord.data, rootDir);

  for (const storyRef of inventoryEntry.implementedStoryRefs) {
    const sourceFile = storyIndex.fileByStoryId.get(storyRef.storyId);
    if (!sourceFile) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_UNRESOLVED_STORY_REF] componentId "${componentId}" references unresolved storyId "${storyRef.storyId}" in storyInventory.implementedStoryRefs`
      );
      continue;
    }

    if (ownedStoryIds.has(storyRef.storyId)) {
      continue;
    }

    if (generatedArtifactPaths.has(sourceFile)) {
      continue;
    }

    errors.push(
      `[CT-9B_PROOF_STRUCTURE_STORY_NOT_OWNED_BY_SPEC] componentId "${componentId}" references storyId "${storyRef.storyId}" but ${toRootRelative(rootDir, sourceFile)} is not listed in componentSpec.generatedArtifactRefs and the story is not owned by the component spec`
    );
  }
}

function validateGeneratedArtifactRefs(componentId, componentSpec, rootDir, storyIndex, errors) {
  for (const [fieldName, repoPath] of Object.entries(componentSpec.generatedArtifactRefs)) {
    if (repoPath === null) {
      continue;
    }

    const absPath = path.resolve(rootDir, repoPath);
    if (!fs.existsSync(absPath)) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_UNRESOLVED_GENERATED_ARTIFACT_REF] componentId "${componentId}" references missing generated artifact path "${repoPath}" in componentSpec.generatedArtifactRefs.${fieldName}`
      );
      continue;
    }

    const storyIds = storyIndex.storiesByFile.get(absPath);
    if (!storyIds || storyIds.length === 0) {
      errors.push(
        `[CT-9B_PROOF_STRUCTURE_UNRESOLVED_GENERATED_ARTIFACT_REF] componentId "${componentId}" references "${repoPath}" in componentSpec.generatedArtifactRefs.${fieldName}, but that file does not contribute any resolvable Storybook story IDs`
      );
    }
  }
}

function getGeneratedArtifactPaths(componentSpec, rootDir) {
  const paths = new Set();

  for (const repoPath of Object.values(componentSpec.generatedArtifactRefs)) {
    if (repoPath === null) {
      continue;
    }

    paths.add(path.resolve(rootDir, repoPath));
  }

  return paths;
}

function resolveExpression(expression, variableExpressions) {
  let current = unwrapExpression(expression);

  while (current && ts.isIdentifier(current)) {
    current = unwrapExpression(variableExpressions.get(current.text) ?? null);
  }

  return current;
}

function extractMetaTitle(expression) {
  const resolved = unwrapExpression(expression);
  if (!resolved || !ts.isObjectLiteralExpression(resolved)) {
    return null;
  }

  for (const property of resolved.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const propertyName = getPropertyName(property.name);
    if (propertyName !== 'title') {
      continue;
    }

    const initializer = unwrapExpression(property.initializer);
    if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
      return initializer.text;
    }
  }

  return null;
}

function unwrapExpression(expression) {
  let current = expression ?? null;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isTypeAssertionExpression(current))
  ) {
    current = current.expression;
  }

  return current;
}

function getPropertyName(name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNoSubstitutionTemplateLiteral(name)
  ) {
    return name.text;
  }

  return null;
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function isStoryExportName(name) {
  return ![
    '__namedExportsOrder',
    'args',
    'argTypes',
    'decorators',
    'loaders',
    'parameters',
    'play',
    'render',
  ].includes(name);
}

function pushComponentIdSource(componentIdSources, componentId, source) {
  const sources = componentIdSources.get(componentId) ?? [];
  sources.push(source);
  componentIdSources.set(componentId, sources);
}

function sortValidatorKinds(kinds) {
  return [...new Set(kinds)].sort((left, right) => {
    return validatorKindOrder.get(left) - validatorKindOrder.get(right);
  });
}

function toRootRelative(rootDir, absPath) {
  return normalizeRepoPath(path.relative(rootDir, absPath));
}

function normalizeRepoPath(filePath) {
  return filePath.replaceAll(path.sep, '/');
}
