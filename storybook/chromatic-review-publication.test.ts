import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  chromaticReviewClaimRequiredEnvVar,
  chromaticReviewDeferEnvVar,
  chromaticReviewScriptName,
} from '../scripts/lib/chromatic-review-command.mjs';
import { runChromaticReview } from '../scripts/lib/chromatic-review.mjs';

const thinkingIndicatorStoryIds = [
  'ai-elements-thinking-indicator--default',
  'ai-elements-thinking-indicator--variant-matrix',
  'ai-elements-thinking-indicator--state-matrix',
  'ai-elements-thinking-indicator--motion',
  'ai-elements-thinking-indicator--docs',
];

describe('runChromaticReview', () => {
  it('writes a passed CT-10B artifact for the pilot proof scope', async () => {
    const workspace = createWorkspace();
    const result = await runChromaticReview({
      artifactPath: path.join(workspace, 'artifacts/chromatic/status.json'),
      buildDir: 'storybook-static',
      cwd: workspace,
      env: createEnv(),
      loadProofStructure: createProofStructureLoader(),
      providerExecutor: async () => ({
        buildUrl: 'https://example.invalid/chromatic/builds/passed',
        changeCount: 0,
        code: 0,
      }),
      rootDir: workspace,
    });

    expect(result.exitCode).toBe(0);
    expect(result.diffOutcome).toBe('passed');
    expect(result.status?.check.conclusion).toBe('success');
    expect(result.status?.review.mode).toBe('informational');
    expect(result.status?.proofInventory.selectedStoryIds).toEqual(thinkingIndicatorStoryIds);
    expect(readStatusArtifact(result.absArtifactPath)).toMatchObject({
      build: {
        url: 'https://example.invalid/chromatic/builds/passed',
      },
      review: {
        diffOutcome: 'passed',
      },
    });
  });

  it('records changed builds as claim-required without failing the job', async () => {
    const workspace = createWorkspace();
    const result = await runChromaticReview({
      artifactPath: path.join(workspace, 'artifacts/chromatic/status.json'),
      buildDir: 'storybook-static',
      cwd: workspace,
      env: createEnv({
        [chromaticReviewClaimRequiredEnvVar]: 'true',
      }),
      loadProofStructure: createProofStructureLoader(),
      providerExecutor: async () => ({
        buildUrl: 'https://example.invalid/chromatic/builds/changed',
        changeCount: 3,
        code: 0,
      }),
      rootDir: workspace,
    });

    expect(result.exitCode).toBe(0);
    expect(result.diffOutcome).toBe('changed');
    expect(result.status?.check.conclusion).toBe('neutral');
    expect(result.status?.review.mode).toBe('claim-required');
    expect(result.status?.review.requiredForClaim).toBe(true);
  });

  it('writes a failed artifact and preserves the non-zero provider exit code', async () => {
    const workspace = createWorkspace();
    const result = await runChromaticReview({
      artifactPath: path.join(workspace, 'artifacts/chromatic/status.json'),
      buildDir: 'storybook-static',
      cwd: workspace,
      env: createEnv(),
      loadProofStructure: createProofStructureLoader(),
      providerExecutor: async () => ({
        buildUrl: 'https://example.invalid/chromatic/builds/failed',
        code: 2,
      }),
      rootDir: workspace,
    });

    expect(result.exitCode).toBe(2);
    expect(result.diffOutcome).toBe('failed');
    expect(result.status?.check.conclusion).toBe('failure');
    expect(readStatusArtifact(result.absArtifactPath)).toMatchObject({
      review: {
        diffOutcome: 'failed',
      },
    });
  });

  it('fails closed when the resolved proof scope is empty', async () => {
    const workspace = createWorkspace();
    const result = await runChromaticReview({
      artifactPath: path.join(workspace, 'artifacts/chromatic/status.json'),
      buildDir: 'storybook-static',
      cwd: workspace,
      env: createEnv(),
      loadProofStructure: createProofStructureLoader({ inventoryComponents: [] }),
      providerExecutor: async () => ({
        buildUrl: 'https://example.invalid/chromatic/builds/should-not-run',
        code: 0,
      }),
      rootDir: workspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.error?.message).toContain('[CHROMATIC_REVIEW_EMPTY_SCOPE]');
    expect(result.absArtifactPath).toBeUndefined();
  });

  it('fails closed when an inventory component is missing a matching spec', async () => {
    const workspace = createWorkspace();
    const result = await runChromaticReview({
      artifactPath: path.join(workspace, 'artifacts/chromatic/status.json'),
      buildDir: 'storybook-static',
      cwd: workspace,
      env: createEnv(),
      loadProofStructure: createProofStructureLoader({
        componentSpecs: [],
      }),
      providerExecutor: async () => ({
        buildUrl: 'https://example.invalid/chromatic/builds/should-not-run',
        code: 0,
      }),
      rootDir: workspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.error?.message).toContain('[CHROMATIC_REVIEW_SCOPE_SPEC_MISMATCH]');
    expect(result.absArtifactPath).toBeUndefined();
  });

  it('writes a deferred artifact and passes skip through to the provider options', async () => {
    const workspace = createWorkspace();
    let sawSkip = false;
    const result = await runChromaticReview({
      artifactPath: path.join(workspace, 'artifacts/chromatic/status.json'),
      buildDir: 'storybook-static',
      cwd: workspace,
      env: createEnv({
        [chromaticReviewDeferEnvVar]: 'true',
      }),
      loadProofStructure: createProofStructureLoader(),
      providerExecutor: async ({ invocation }: { invocation: { options: { skip?: boolean } } }) => {
        sawSkip = invocation.options.skip === true;
        return {
          buildUrl: 'https://example.invalid/chromatic/builds/deferred',
          code: 0,
        };
      },
      rootDir: workspace,
    });

    expect(sawSkip).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.diffOutcome).toBe('deferred');
    expect(result.status?.check.conclusion).toBe('skipped');
  });
});

describe('chromatic review package contract', () => {
  it('keeps the seam-owned chromatic review entrypoint stable', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.[chromaticReviewScriptName]).toBe(
      'node scripts/chromatic-review.mjs'
    );
  });
});

function createEnv(overrides: Record<string, string> = {}) {
  return {
    ...process.env,
    CHROMATIC_PROJECT_TOKEN: 'test-token',
    GITHUB_ACTIONS: 'true',
    GITHUB_HEAD_REF: 'feature/seam-8b-pilot',
    GITHUB_REF_NAME: 'feature/seam-8b-pilot',
    GITHUB_SHA: '1234567890abcdef1234567890abcdef12345678',
    ...overrides,
  };
}

function createProofStructureLoader(
  options: {
    componentSpecs?: Array<{ data: { componentId: string; tier: string } }>;
    inventoryComponents?: Array<{
      componentId: string;
      implementedStoryRefs: Array<{ storyId: string }>;
    }>;
  } = {}
) {
  const inventoryComponents = options.inventoryComponents ?? [
    {
      componentId: 'thinking-indicator',
      implementedStoryRefs: thinkingIndicatorStoryIds.map((storyId) => ({ storyId })),
    },
  ];
  const componentSpecs = options.componentSpecs ?? [
    {
      data: {
        componentId: 'thinking-indicator',
        tier: 'primitive',
      },
    },
  ];

  return () => ({
    data: {
      componentSpecs,
      inventory: {
        components: inventoryComponents,
        inventoryVersion: '1',
      },
    },
    errors: [],
    rootDir: repoRoot,
  });
}

function createWorkspace() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
  fs.mkdirSync(path.join(workspace, 'storybook-static'), { recursive: true });
  return workspace;
}

function readStatusArtifact(artifactPath: string | undefined) {
  if (!artifactPath) {
    throw new Error('expected artifact path to be defined');
  }

  return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
}
