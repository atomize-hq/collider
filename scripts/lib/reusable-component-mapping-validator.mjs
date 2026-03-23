import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { repoRoot } from '../../design-tokens/build/paths.mjs';
import {
  componentMappingRootDirEnvVar,
  componentMappingStatusVersion,
  createComponentMappingArtifacts,
  defaultFigmaCodeConnectDir,
  defaultReusableComponentMappingStatusPath,
  defaultStorybookConnectDir,
} from './component-mapping.mjs';
import {
  reusableComponentMappingComparableFields,
  reusableComponentMappingRequiredProjectionFields,
} from './reusable-component-mapping-contract.mjs';
import { formatJsonArtifact } from './prettier-json.mjs';

export const reusableComponentMappingValidationUsage =
  'Usage: pnpm validate:reusable-component-mapping';

export async function runReusableComponentMappingValidation(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const rootDir = path.resolve(
    options.rootDir ?? process.env[componentMappingRootDirEnvVar] ?? repoRoot
  );
  const statusPath = options.statusPath ?? defaultReusableComponentMappingStatusPath;
  const evaluation = evaluateReusableComponentMapping({
    artifacts: options.artifacts,
    now: options.now,
    rootDir,
  });

  const absStatusPath = await writeJson(path.resolve(rootDir, statusPath), evaluation.report);
  writeLine(stdout, formatSummary(evaluation.report.summary, absStatusPath));

  if (!evaluation.ok) {
    for (const error of evaluation.errors) {
      writeLine(stderr, error);
    }
    return 1;
  }

  writeLine(stdout, `✓ Reusable component mapping validation passed: ${absStatusPath}`);
  return 0;
}

export async function runReusableComponentMappingValidationCli(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  if (args.length > 0) {
    (options.stderr ?? process.stderr).write(`${reusableComponentMappingValidationUsage}\n`);
    return 1;
  }

  try {
    return await runReusableComponentMappingValidation(options);
  } catch (error) {
    (options.stderr ?? process.stderr).write(
      `[UNEXPECTED_RUNTIME_FAILURE] ${error instanceof Error ? error.message : String(error)}\n`
    );
    return 3;
  }
}

export function evaluateReusableComponentMapping(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? repoRoot);
  const artifacts =
    options.artifacts ?? createComponentMappingArtifacts({ now: options.now, rootDir });
  const components = artifacts.components.map((component) =>
    evaluateComponent(component, { rootDir })
  );
  const summary = {
    componentCount: components.length,
    completeCount: components.filter((component) => component.state === 'complete').length,
    incompleteCount: components.filter((component) => component.state === 'incomplete').length,
    invalidCount: components.filter((component) => component.state === 'invalid').length,
  };
  const report = {
    mappingStatusVersion: componentMappingStatusVersion,
    generatedAt: new Date().toISOString(),
    summary,
    components: components.map((component) => ({
      componentId: component.componentId,
      state: component.state,
      linkState: component.linkState,
      issues: component.issues,
      drift: component.drift,
      sourcePaths: component.sourcePaths,
      outputPaths: component.outputPaths,
    })),
  };

  return {
    ok: summary.invalidCount === 0,
    errors: components
      .filter((component) => component.state === 'invalid')
      .flatMap((component) => [...component.issues, ...component.drift]),
    report,
  };
}

function evaluateComponent(component, context) {
  const outputPaths = {
    figmaCodeConnect: `${defaultFigmaCodeConnectDir}/${component.componentId}.json`,
    storybookConnect: `${defaultStorybookConnectDir}/${component.componentId}.json`,
  };
  const sourcePaths = {
    componentSpec: component.storybookConnect.componentSpecPath,
    storyInventory: component.storybookConnect.storyInventoryPath,
    proofCoverage: component.storybookConnect.proofCoveragePath,
    chromaticStatus: component.storybookConnect.chromaticStatusPath,
  };
  const issues = [];
  const drift = [];
  const storybookProjection = readProjection(
    path.resolve(context.rootDir, outputPaths.storybookConnect),
    {
      componentId: component.componentId,
      issues,
      projectionLabel: 'storybookConnect',
    }
  );
  const figmaProjection = readProjection(
    path.resolve(context.rootDir, outputPaths.figmaCodeConnect),
    {
      componentId: component.componentId,
      issues,
      projectionLabel: 'figmaCodeConnect',
    }
  );

  if (storybookProjection.data) {
    issues.push(
      ...validateRequiredFields(storybookProjection.data, {
        componentId: component.componentId,
        projectionLabel: 'storybookConnect',
      })
    );
    drift.push(
      ...compareProjection(component.storybookConnect, storybookProjection.data, {
        componentId: component.componentId,
        projectionLabel: 'storybookConnect',
      })
    );
  }

  if (figmaProjection.data) {
    issues.push(
      ...validateRequiredFields(figmaProjection.data, {
        componentId: component.componentId,
        projectionLabel: 'figmaCodeConnect',
      })
    );
    drift.push(
      ...compareProjection(component.figmaCodeConnect, figmaProjection.data, {
        componentId: component.componentId,
        projectionLabel: 'figmaCodeConnect',
      })
    );
  }

  if (storybookProjection.data && figmaProjection.data) {
    drift.push(
      ...compareProjectionFields(storybookProjection.data, figmaProjection.data, {
        componentId: component.componentId,
        leftLabel: 'storybookConnect',
        rightLabel: 'figmaCodeConnect',
      })
    );
  }

  const linkState = deriveLinkState(storybookProjection.data ?? component.storybookConnect);
  if (linkState === 'stale') {
    issues.push(
      `[CT-11B_MAPPING_STALE_LINK_PROVENANCE] componentId "${component.componentId}" references stale CT-10B Storybook link evidence`
    );
  }
  if (linkState === 'invalid-provenance') {
    issues.push(
      `[CT-11B_MAPPING_INVALID_LINK_PROVENANCE] componentId "${component.componentId}" does not have valid CT-10B Storybook link provenance`
    );
  }

  if (issues.length === 0 && drift.length === 0 && component.blockingFields.length > 0) {
    for (const field of component.blockingFields) {
      issues.push(
        `[CT-11B_MAPPING_INCOMPLETE_FIELD] componentId "${component.componentId}" requires ${field} before the mapping is complete`
      );
    }
  }

  return {
    componentId: component.componentId,
    state:
      issues.some((issue) => !issue.includes('[CT-11B_MAPPING_INCOMPLETE_FIELD]')) ||
      drift.length > 0
        ? 'invalid'
        : component.blockingFields.length > 0
          ? 'incomplete'
          : 'complete',
    linkState,
    issues,
    drift,
    outputPaths,
    sourcePaths,
  };
}

function readProjection(absPath, context) {
  try {
    return {
      data: JSON.parse(fs.readFileSync(absPath, 'utf8')),
    };
  } catch (error) {
    context.issues.push(
      `[CT-11B_MAPPING_PROJECTION_READ_FAILED] componentId "${context.componentId}" could not read ${context.projectionLabel} at ${absPath}: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      data: null,
    };
  }
}

function validateRequiredFields(projection, context) {
  const issues = [];
  for (const field of reusableComponentMappingRequiredProjectionFields) {
    if (!(field in projection)) {
      issues.push(
        `[CT-11B_MAPPING_MISSING_REQUIRED_KEY] componentId "${context.componentId}" ${context.projectionLabel}.${field} is required`
      );
    }
  }
  return issues;
}

function compareProjection(expected, actual, context) {
  return compareProjectionFields(expected, actual, {
    componentId: context.componentId,
    leftLabel: 'expected',
    projectionLabel: context.projectionLabel,
    rightLabel: context.projectionLabel,
  });
}

function compareProjectionFields(left, right, context) {
  const drift = [];
  for (const field of reusableComponentMappingComparableFields) {
    if (!(field in left) || !(field in right)) {
      continue;
    }
    if (!sameValue(left[field], right[field])) {
      drift.push(
        `[CT-11B_MAPPING_DRIFT] componentId "${context.componentId}" ${context.leftLabel ?? 'expected'}.${field} does not match ${context.rightLabel}`
      );
    }
  }
  return drift;
}

function deriveLinkState(projection) {
  switch (projection.storyLinkStatus) {
    case 'resolved':
      return projection.publishedStorybookUrl ? 'resolved-current' : 'invalid-provenance';
    case 'stale-status-artifact':
      return 'stale';
    case 'invalid-status-artifact':
      return 'invalid-provenance';
    default:
      return 'unresolved';
  }
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function formatSummary(summary, absStatusPath) {
  return [
    `✓ Reusable component mapping status written: ${absStatusPath}`,
    `Mapping status: ${summary.componentCount} components, ${summary.completeCount} complete, ${summary.incompleteCount} incomplete, ${summary.invalidCount} invalid`,
  ].join('\n');
}

async function writeJson(absPath, value) {
  const formatted = await formatJsonArtifact(value, absPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, formatted);
  return absPath;
}

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}
