import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  componentMappingRootDirEnvVar,
  createComponentMappingArtifacts,
  writeComponentMappingArtifacts,
} from '../scripts/lib/component-mapping.mjs';
import {
  reusableComponentMappingProjectionKinds,
  reusableComponentMappingRequiredProjectionFields,
} from '../scripts/lib/reusable-component-mapping-contract.mjs';

const chromaticFixtureDir = path.join(repoRoot, 'scripts/fixtures/chromatic-status');
const componentMappingCliPath = path.join(repoRoot, 'scripts/generate-component-mapping.mjs');
const workspaceFixtureDir = path.join(repoRoot, 'scripts/fixtures/component-mapping-workspace');
const fixedNow = new Date('2026-03-21T12:30:00.000Z');

type ChromaticStatusFixture = {
  generatedAt?: string;
  proofInventory: {
    selectedComponentIds: string[];
    selectedStoryIds: string[];
  };
  review: {
    scope: {
      componentIds: string[];
      storyIds: string[];
      componentTiers: Record<string, string>;
    };
  };
};

describe('createComponentMappingArtifacts', () => {
  it('resolves the published Storybook URL from a valid CT-10B artifact', () => {
    const workspace = createWorkspace({
      chromaticFixtureName: 'valid-passed.chromatic-status.json',
    });

    const artifacts = createComponentMappingArtifacts({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(artifacts.components).toHaveLength(1);
    expect(artifacts.components[0]?.status).toBe('complete');
    expect(artifacts.components[0]?.storybookConnect.publishedStorybookUrl).toBe(
      'https://example.invalid/chromatic/builds/1111111111111111111111111111111111111111'
    );
    expect(artifacts.components[0]?.storybookConnect.publishedStorybookRevisionGitSha).toBe(
      '1111111111111111111111111111111111111111'
    );
    expect(artifacts.components[0]?.storybookConnect.publishedStorybookComponentIds).toEqual([
      'thinking-indicator',
    ]);
    expect(artifacts.components[0]?.storybookConnect.storyLinkStatus).toBe('resolved');
    expect(artifacts.components[0]?.storybookConnect.blockingFields).toEqual([]);
  });

  it('marks the pilot incomplete when the published CT-10B artifact is absent', () => {
    const workspace = createWorkspace();

    const artifacts = createComponentMappingArtifacts({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(artifacts.components[0]?.status).toBe('incomplete');
    expect(artifacts.components[0]?.storybookConnect.publishedStorybookUrl).toBeNull();
    expect(artifacts.components[0]?.storybookConnect.storyLinkStatus).toBe(
      'missing-status-artifact'
    );
    expect(artifacts.components[0]?.storybookConnect.blockingFields).toEqual([
      'publishedStorybookUrl',
    ]);
  });

  it('keeps the link unresolved when the published proof scope omits the pilot component', () => {
    const workspace = createWorkspace({
      chromaticFixtureName: 'valid-passed.chromatic-status.json',
      mutateChromaticStatus(status) {
        status.proofInventory.selectedComponentIds = ['card'];
        status.proofInventory.selectedStoryIds = ['card--default'];
        status.review.scope.componentIds = ['card'];
        status.review.scope.storyIds = ['card--default'];
        status.review.scope.componentTiers = { card: 'primitive' };
      },
    });

    const artifacts = createComponentMappingArtifacts({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(artifacts.components[0]?.status).toBe('incomplete');
    expect(artifacts.components[0]?.storybookConnect.storyLinkStatus).toBe(
      'component-not-in-published-scope'
    );
    expect(artifacts.components[0]?.storybookConnect.blockingFields).toEqual([
      'publishedStorybookUrl',
    ]);
  });

  it('projects the same shared identity fields into Storybook and Figma outputs', () => {
    const workspace = createWorkspace({
      chromaticFixtureName: 'valid-passed.chromatic-status.json',
    });

    const artifacts = createComponentMappingArtifacts({
      now: fixedNow,
      rootDir: workspace,
    });
    const component = artifacts.components[0];

    expect(component?.storybookConnect.componentId).toBe(component?.figmaCodeConnect.componentId);
    expect(component?.storybookConnect.codeEntrypoint).toBe(
      component?.figmaCodeConnect.codeEntrypoint
    );
    expect(component?.storybookConnect.figmaComponentRef).toBe(
      component?.figmaCodeConnect.figmaComponentRef
    );
    expect(component?.storybookConnect.supportedVariants).toEqual(
      component?.figmaCodeConnect.supportedVariants
    );
    expect(component?.storybookConnect.slotNames).toEqual(component?.figmaCodeConnect.slotNames);
    expect(component?.storybookConnect.exampleStoryIds).toEqual(
      component?.figmaCodeConnect.exampleStoryIds
    );
    expect(component?.storybookConnect.publishedStorybookUrl).toBe(
      component?.figmaCodeConnect.publishedStorybookUrl
    );
  });
});

describe('writeComponentMappingArtifacts', () => {
  it('writes the pilot CT-11B outputs with the expected shape', async () => {
    const workspace = createWorkspace({
      chromaticFixtureName: 'valid-passed.chromatic-status.json',
    });
    const artifacts = createComponentMappingArtifacts({
      now: fixedNow,
      rootDir: workspace,
    });

    await writeComponentMappingArtifacts(artifacts, { rootDir: workspace });

    const storybookConnect = readJson(workspace, 'storybook/connect/thinking-indicator.json');
    const figmaCodeConnect = readJson(workspace, 'figma/code-connect/thinking-indicator.json');
    const completeness = readJson(
      workspace,
      'artifacts/harness/reusable-component-mapping-status.json'
    );

    expect(storybookConnect).toMatchObject({
      projectionKind: reusableComponentMappingProjectionKinds.storybookConnect,
      componentId: 'thinking-indicator',
      componentSpecPath: 'storybook/component-specs/thinking-indicator.json',
      storyInventoryPath: 'storybook/story-inventory.json',
      proofCoveragePath: 'artifacts/storybook/proof-coverage.json',
      chromaticStatusPath: 'artifacts/chromatic/status.json',
      supportedVariantsSource: 'design-tokens/dist/tokens.ts',
      slotNamesSource: 'design-tokens/dist/tokens.ts',
      storyLinkStatus: 'resolved',
      publishedStorybookRevisionGitSha: '1111111111111111111111111111111111111111',
    });
    expect(figmaCodeConnect).toMatchObject({
      projectionKind: reusableComponentMappingProjectionKinds.figmaCodeConnect,
      componentId: 'thinking-indicator',
      componentSpecPath: 'storybook/component-specs/thinking-indicator.json',
      figma: {
        componentRef: 'figma://file/SVcsU6gVvpezsJYrvBsS3V#component=thinking-indicator',
      },
    });
    expect(completeness).toMatchObject({
      mappingStatusVersion: '1',
      summary: {
        componentCount: 1,
        completeCount: 1,
        incompleteCount: 0,
        invalidCount: 0,
      },
      components: [
        {
          componentId: 'thinking-indicator',
          state: 'complete',
          linkState: 'resolved-current',
        },
      ],
    });
    expect(topLevelSharedKeys(storybookConnect, 'storybook')).toEqual(
      [...reusableComponentMappingRequiredProjectionFields].sort()
    );
    expect(topLevelSharedKeys(figmaCodeConnect, 'figma')).toEqual(
      [...reusableComponentMappingRequiredProjectionFields].sort()
    );
  });
});

describe('component mapping CLI contract', () => {
  it('exposes the seam-owned package script and writes artifacts through the CLI', () => {
    const workspace = createWorkspace({
      chromaticFixtureName: 'valid-passed.chromatic-status.json',
    });
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['generate:component-mapping']).toBe(
      'node scripts/generate-component-mapping.mjs'
    );

    const result = spawnSync('node', [componentMappingCliPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        [componentMappingRootDirEnvVar]: workspace,
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('✓ Component mapping artifacts written:');
    expect(fs.existsSync(path.join(workspace, 'storybook/connect/thinking-indicator.json'))).toBe(
      true
    );
    expect(fs.existsSync(path.join(workspace, 'figma/code-connect/thinking-indicator.json'))).toBe(
      true
    );
  });
});

function createWorkspace(
  options: {
    chromaticFixtureName?: string;
    mutateChromaticStatus?: (status: ChromaticStatusFixture) => void;
  } = {}
) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'component-mapping-'));

  copyFixtureIntoWorkspace(workspace, 'storybook/component-specs/thinking-indicator.json');
  copyFixtureIntoWorkspace(workspace, 'storybook/story-inventory.json');
  copyFixtureIntoWorkspace(workspace, 'artifacts/storybook/proof-coverage.json');
  copyFixtureIntoWorkspace(workspace, 'design-tokens/src/recipes/index.json');
  copyFixtureIntoWorkspace(workspace, 'design-tokens/src/recipes/thinking-indicator.recipe.json');

  if (options.chromaticFixtureName) {
    const status = JSON.parse(
      fs.readFileSync(path.join(chromaticFixtureDir, options.chromaticFixtureName), 'utf8')
    ) as ChromaticStatusFixture;
    status.generatedAt = fixedNow.toISOString();
    options.mutateChromaticStatus?.(status);

    const absPath = path.join(workspace, 'artifacts/chromatic/status.json');
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, JSON.stringify(status, null, 2));
  }

  return workspace;
}

function copyFixtureIntoWorkspace(workspace: string, repoRelativePath: string) {
  const source = path.join(workspaceFixtureDir, repoRelativePath);
  const destination = path.join(workspace, repoRelativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function readJson(workspace: string, repoRelativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(workspace, repoRelativePath), 'utf8'));
}

function topLevelSharedKeys(record: Record<string, unknown>, adapterKey: 'figma' | 'storybook') {
  return Object.keys(record)
    .filter((key) => key !== adapterKey)
    .sort((left, right) => left.localeCompare(right));
}
