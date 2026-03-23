import fs from 'node:fs';
import path from 'node:path';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  defaultChromaticStatusMaxAgeMinutes,
  evaluateChromaticStatus,
  readChromaticStatusArtifact,
} from './chromatic-status-validator.mjs';
import {
  defaultStorybookProofCoveragePath,
  readStorybookProofCoverageReport,
} from './storybook-proof-coverage.mjs';
import {
  defaultStoryInventoryPath,
  loadAndValidateStoryInventory,
} from './storybook-story-inventory.mjs';
import {
  reusableComponentMappingContractVersion,
  reusableComponentMappingProjectionKinds,
} from './reusable-component-mapping-contract.mjs';
import { formatJsonArtifact } from './prettier-json.mjs';
import { validateComponentSpec } from './storybook-component-spec.mjs';

export const componentMappingVersion = reusableComponentMappingContractVersion;
export const componentMappingStatusVersion = '1';
export const componentMappingCompletenessVersion = componentMappingStatusVersion;
export const componentMappingRootDirEnvVar = 'COMPONENT_MAPPING_ROOT_DIR';
export const defaultStorybookConnectDir = 'storybook/connect';
export const defaultFigmaCodeConnectDir = 'figma/code-connect';
export const defaultReusableComponentMappingStatusPath =
  'artifacts/harness/reusable-component-mapping-status.json';
export const defaultComponentMappingCompletenessPath = defaultReusableComponentMappingStatusPath;

const defaultComponentSpecsDir = 'storybook/component-specs';
const defaultRecipeIndexPath = 'design-tokens/src/recipes/index.json';
const defaultChromaticStatusPath = 'artifacts/chromatic/status.json';

export function createComponentMappingArtifacts(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const componentSpecsDir = path.resolve(
    rootDir,
    options.componentSpecsDir ?? defaultComponentSpecsDir
  );
  const recipeIndexPath = path.resolve(rootDir, options.recipeIndexPath ?? defaultRecipeIndexPath);
  const inventoryResult = loadAndValidateStoryInventory(
    path.resolve(rootDir, options.inventoryPath ?? defaultStoryInventoryPath)
  );
  if (inventoryResult.errors.length > 0) {
    throw new Error(inventoryResult.errors.join('\n'));
  }

  const componentSpecs = loadComponentSpecs(componentSpecsDir);
  if (componentSpecs.errors.length > 0) {
    throw new Error(componentSpecs.errors.join('\n'));
  }

  const proofCoverage = readStorybookProofCoverageReport(
    options.proofCoveragePath ?? defaultStorybookProofCoveragePath,
    { rootDir }
  );
  const pilotComponentIds = loadPilotComponentIds(recipeIndexPath);
  const chromaticStatus = loadOptionalChromaticStatus({
    maxAgeMinutes: options.chromaticStatusMaxAgeMinutes ?? defaultChromaticStatusMaxAgeMinutes,
    now: options.now,
    rootDir,
    target: options.chromaticStatusPath ?? defaultChromaticStatusPath,
  });

  const components = pilotComponentIds.map((componentId) =>
    createComponentMappingRecord({
      chromaticStatus,
      componentId,
      componentSpecs,
      inventory: inventoryResult.data,
      proofCoverage: proofCoverage.data,
      rootDir,
    })
  );

  return {
    statusReport: createComponentMappingStatusReport(components),
    components,
    rootDir,
  };
}

export async function writeComponentMappingArtifacts(artifacts, options = {}) {
  const rootDir = path.resolve(options.rootDir ?? artifacts.rootDir ?? repoRoot);
  const storybookConnectDir = path.resolve(
    rootDir,
    options.storybookConnectDir ?? defaultStorybookConnectDir
  );
  const figmaCodeConnectDir = path.resolve(
    rootDir,
    options.figmaCodeConnectDir ?? defaultFigmaCodeConnectDir
  );
  const statusPath = path.resolve(
    rootDir,
    options.completenessPath ?? defaultComponentMappingCompletenessPath
  );

  const outputPaths = [];
  for (const component of artifacts.components) {
    outputPaths.push(
      await writeJson(
        path.join(storybookConnectDir, `${component.componentId}.json`),
        component.storybookConnect
      )
    );
    outputPaths.push(
      await writeJson(
        path.join(figmaCodeConnectDir, `${component.componentId}.json`),
        component.figmaCodeConnect
      )
    );
  }

  const completenessReportPath = await writeJson(statusPath, artifacts.statusReport);
  return {
    completenessReportPath,
    outputPaths,
  };
}

function createComponentMappingRecord(context) {
  const componentSpecRecord = findByComponentId(
    context.componentSpecs.records,
    context.componentId
  );
  if (!componentSpecRecord) {
    throw new Error(
      `[CT-11B_COMPONENT_SPEC_MISSING] componentId "${context.componentId}" is missing ${defaultComponentSpecsDir}/${context.componentId}.json`
    );
  }

  const inventoryComponent = findByComponentId(context.inventory.components, context.componentId);
  if (!inventoryComponent) {
    throw new Error(
      `[CT-11B_INVENTORY_COMPONENT_MISSING] componentId "${context.componentId}" is missing from ${defaultStoryInventoryPath}`
    );
  }

  const proofCoverageComponent = findByComponentId(
    context.proofCoverage.components,
    context.componentId
  );
  if (!proofCoverageComponent) {
    throw new Error(
      `[CT-11B_PROOF_COVERAGE_COMPONENT_MISSING] componentId "${context.componentId}" is missing from ${defaultStorybookProofCoveragePath}`
    );
  }

  const implementedStoryIds = inventoryComponent.implementedStoryRefs.map((entry) => entry.storyId);
  const exampleStoryIds = [...componentSpecRecord.data.downstreamHooks.exampleStoryIds];
  const recipeProjection = loadRecipeProjection(
    context.rootDir,
    componentSpecRecord.data.downstreamHooks.codeEntrypoint
  );
  const storyLink = resolvePublishedStorybookLink({
    chromaticStatus: context.chromaticStatus,
    componentId: context.componentId,
    exampleStoryIds,
  });

  const blockingFields = collectBlockingFields({
    codeEntrypoint: componentSpecRecord.data.downstreamHooks.codeEntrypoint,
    exampleStoryIds,
    figmaComponentRef: componentSpecRecord.data.downstreamHooks.figmaComponentRef,
    implementedStoryIds,
    publishedStorybookUrl: storyLink.publishedStorybookUrl,
    slotNames: recipeProjection.slotNames,
    storyLinkStatus: storyLink.storyLinkStatus,
    supportedVariants: recipeProjection.supportedVariants,
  });

  const sharedRecord = {
    mappingVersion: componentMappingVersion,
    componentId: context.componentId,
    componentSpecPath: path.posix.join(defaultComponentSpecsDir, componentSpecRecord.filename),
    storyInventoryPath: defaultStoryInventoryPath,
    proofCoveragePath: defaultStorybookProofCoveragePath,
    chromaticStatusPath: defaultChromaticStatusPath,
    codeEntrypoint: componentSpecRecord.data.downstreamHooks.codeEntrypoint,
    figmaComponentRef: componentSpecRecord.data.downstreamHooks.figmaComponentRef,
    supportedVariantsSource: componentSpecRecord.data.downstreamHooks.supportedVariantsSource,
    slotNamesSource: componentSpecRecord.data.downstreamHooks.slotNamesSource,
    supportedVariants: recipeProjection.supportedVariants,
    slotNames: recipeProjection.slotNames,
    exampleStoryIds,
    implementedStoryIds,
    publishedStorybookUrl: storyLink.publishedStorybookUrl,
    publishedStorybookRevisionGitSha: storyLink.publishedStorybookRevisionGitSha,
    publishedStorybookComponentIds: storyLink.publishedStorybookComponentIds,
    publishedStorybookStoryIds: storyLink.publishedStorybookStoryIds,
    storyLinkStatus: storyLink.storyLinkStatus,
    blockingFields,
    sources: {
      componentSpec: path.posix.join(defaultComponentSpecsDir, componentSpecRecord.filename),
      proofCoverage: defaultStorybookProofCoveragePath,
      storyInventory: defaultStoryInventoryPath,
      supportedVariantsSource: componentSpecRecord.data.downstreamHooks.supportedVariantsSource,
      slotNamesSource: componentSpecRecord.data.downstreamHooks.slotNamesSource,
      chromaticStatus: defaultChromaticStatusPath,
    },
  };

  return {
    blockingFields,
    componentId: context.componentId,
    figmaCodeConnect: {
      projectionKind: reusableComponentMappingProjectionKinds.figmaCodeConnect,
      ...sharedRecord,
      figma: {
        componentRef: sharedRecord.figmaComponentRef,
      },
    },
    status: blockingFields.length === 0 ? 'complete' : 'incomplete',
    storyLinkStatus: storyLink.storyLinkStatus,
    storybookConnect: {
      projectionKind: reusableComponentMappingProjectionKinds.storybookConnect,
      ...sharedRecord,
      storybook: {
        proofCoverageStatus: proofCoverageComponent.status,
        requiredKinds: [...proofCoverageComponent.requiredKinds],
      },
    },
  };
}

function createComponentMappingStatusReport(components) {
  const completeCount = components.filter((component) => component.status === 'complete').length;
  const incompleteCount = components.filter(
    (component) => component.status === 'incomplete'
  ).length;

  return {
    mappingStatusVersion: componentMappingStatusVersion,
    generatedAt: new Date().toISOString(),
    summary: {
      componentCount: components.length,
      completeCount,
      incompleteCount,
      invalidCount: 0,
    },
    components: components.map((component) => ({
      componentId: component.componentId,
      state: component.status,
      linkState: normalizeLinkState(component.storyLinkStatus),
      issues: component.blockingFields.map(
        (field) =>
          `[CT-11B_MAPPING_INCOMPLETE_FIELD] componentId "${component.componentId}" requires ${field} before the mapping is complete`
      ),
      drift: [],
      sourcePaths: {
        componentSpec: component.storybookConnect.componentSpecPath,
        storyInventory: component.storybookConnect.storyInventoryPath,
        proofCoverage: component.storybookConnect.proofCoveragePath,
        chromaticStatus: component.storybookConnect.chromaticStatusPath,
      },
      outputPaths: {
        figmaCodeConnect: `${defaultFigmaCodeConnectDir}/${component.componentId}.json`,
        storybookConnect: `${defaultStorybookConnectDir}/${component.componentId}.json`,
      },
    })),
  };
}

function collectBlockingFields(input) {
  const blockingFields = [];

  if (!input.codeEntrypoint) {
    blockingFields.push('codeEntrypoint');
  }
  if (!input.figmaComponentRef) {
    blockingFields.push('figmaComponentRef');
  }
  if (input.supportedVariants.length === 0) {
    blockingFields.push('supportedVariants');
  }
  if (input.slotNames.length === 0) {
    blockingFields.push('slotNames');
  }
  if (
    input.exampleStoryIds.length === 0 ||
    !sameOrderedArray(input.exampleStoryIds, input.implementedStoryIds)
  ) {
    blockingFields.push('exampleStoryIds');
  }
  if (input.storyLinkStatus !== 'resolved' || input.publishedStorybookUrl === null) {
    blockingFields.push('publishedStorybookUrl');
  }

  return blockingFields;
}

function resolvePublishedStorybookLink(input) {
  if (input.chromaticStatus.kind === 'missing') {
    return {
      publishedStorybookUrl: null,
      publishedStorybookRevisionGitSha: null,
      publishedStorybookComponentIds: null,
      publishedStorybookStoryIds: null,
      storyLinkStatus: 'missing-status-artifact',
    };
  }

  if (input.chromaticStatus.kind === 'invalid') {
    return {
      publishedStorybookUrl: null,
      publishedStorybookRevisionGitSha: null,
      publishedStorybookComponentIds: null,
      publishedStorybookStoryIds: null,
      storyLinkStatus: input.chromaticStatus.storyLinkStatus,
    };
  }

  const selectedComponentIds = new Set(
    input.chromaticStatus.data.proofInventory.selectedComponentIds
  );
  if (!selectedComponentIds.has(input.componentId)) {
    return {
      publishedStorybookUrl: null,
      publishedStorybookRevisionGitSha: null,
      publishedStorybookComponentIds: null,
      publishedStorybookStoryIds: null,
      storyLinkStatus: 'component-not-in-published-scope',
    };
  }

  const selectedStoryIds = new Set(input.chromaticStatus.data.proofInventory.selectedStoryIds);
  if (!input.exampleStoryIds.every((storyId) => selectedStoryIds.has(storyId))) {
    return {
      publishedStorybookUrl: null,
      publishedStorybookRevisionGitSha: null,
      publishedStorybookComponentIds: null,
      publishedStorybookStoryIds: null,
      storyLinkStatus: 'story-scope-mismatch',
    };
  }

  return {
    publishedStorybookUrl: input.chromaticStatus.data.build.url,
    publishedStorybookRevisionGitSha: input.chromaticStatus.data.revision.gitSha,
    publishedStorybookComponentIds: [
      ...input.chromaticStatus.data.proofInventory.selectedComponentIds,
    ],
    publishedStorybookStoryIds: [...input.chromaticStatus.data.proofInventory.selectedStoryIds],
    storyLinkStatus: 'resolved',
  };
}

function loadRecipeProjection(rootDir, codeEntrypoint) {
  if (typeof codeEntrypoint !== 'string' || codeEntrypoint.length === 0) {
    return { slotNames: [], supportedVariants: [] };
  }

  const absPath = path.resolve(rootDir, codeEntrypoint);
  const recipe = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  const supportedVariants = Array.isArray(recipe.variantAxes)
    ? recipe.variantAxes.map((axis) => ({
        name: axis.name,
        values: Array.isArray(axis.values) ? [...axis.values] : [],
      }))
    : [];
  const slotNames =
    recipe.slots && typeof recipe.slots === 'object'
      ? Object.keys(recipe.slots).sort((left, right) => left.localeCompare(right))
      : [];

  return { slotNames, supportedVariants };
}

function loadPilotComponentIds(recipeIndexPath) {
  const recipeIndex = JSON.parse(fs.readFileSync(recipeIndexPath, 'utf8'));
  if (!Array.isArray(recipeIndex.recipes)) {
    throw new Error(
      '[CT-11B_RECIPE_INDEX_INVALID] design-tokens/src/recipes/index.json must include a recipes array'
    );
  }

  return recipeIndex.recipes
    .filter((entry) => entry.status === 'pilot')
    .map((entry) => entry.componentId)
    .sort((left, right) => left.localeCompare(right));
}

function loadOptionalChromaticStatus(options) {
  try {
    const artifact = readChromaticStatusArtifact(options.target, { rootDir: options.rootDir });
    const evaluation = evaluateChromaticStatus(artifact.data, {
      maxAgeMinutes: options.maxAgeMinutes,
      now: options.now,
    });

    if (!evaluation.ok) {
      return {
        errors: evaluation.errors,
        kind: 'invalid',
        storyLinkStatus: evaluation.errors.some((error) =>
          error.includes('[CT-10B_CHROMATIC_STATUS_STALE]')
        )
          ? 'stale-status-artifact'
          : 'invalid-status-artifact',
      };
    }

    return {
      data: artifact.data,
      kind: 'present',
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return { kind: 'missing' };
    }
    throw error;
  }
}

function loadComponentSpecs(componentSpecsDir) {
  const errors = [];
  const records = [];

  const entries = fs
    .readdirSync(componentSpecsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const absPath = path.join(componentSpecsDir, entry.name);
    const filenameStem = path.basename(entry.name, '.json');
    const data = JSON.parse(fs.readFileSync(absPath, 'utf8'));
    errors.push(...validateComponentSpec(data, { filenameStem }));
    records.push({
      absPath,
      data,
      filename: entry.name,
    });
  }

  return { errors, records };
}

async function writeJson(absPath, value) {
  const formatted = await formatJsonArtifact(value, absPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, formatted);
  return absPath;
}

function findByComponentId(collection, componentId) {
  return (
    collection.find(
      (entry) => entry.componentId === componentId || entry.data?.componentId === componentId
    ) ?? null
  );
}

function sameOrderedArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function normalizeLinkState(storyLinkStatus) {
  switch (storyLinkStatus) {
    case 'resolved':
      return 'resolved-current';
    case 'stale-status-artifact':
      return 'stale';
    case 'invalid-status-artifact':
      return 'invalid-provenance';
    default:
      return 'unresolved';
  }
}
