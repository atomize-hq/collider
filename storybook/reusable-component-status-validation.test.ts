import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import validDocsOnlyStatus from '../scripts/fixtures/reusable-component-status/valid-docs-only-status.json';
import invalidMappingStatus from '../scripts/fixtures/reusable-component-status/invalid-mapping-reusable-component-status.json';
import missingProofStatus from '../scripts/fixtures/reusable-component-status/missing-proof-reusable-component-status.json';
import validOtherStatus from '../scripts/fixtures/reusable-component-status/valid-other-status.json';
import validProofOnlyStatus from '../scripts/fixtures/reusable-component-status/valid-proof-only-status.json';
import staleReviewStatus from '../scripts/fixtures/reusable-component-status/stale-review-reusable-component-status.json';
import validReusableStatus from '../scripts/fixtures/reusable-component-status/valid-reusable-component-status.json';
import validTokenOnlyStatus from '../scripts/fixtures/reusable-component-status/valid-token-only-status.json';
import {
  createReusableComponentStatus,
  defaultReusableComponentStatusPath,
  reusableComponentStatusChangeClassEnvVar,
  reusableComponentStatusRootDirEnvVar,
  writeReusableComponentStatus,
} from '../scripts/lib/reusable-component-status.mjs';
import { runReusableComponentStatusValidation } from '../scripts/lib/reusable-component-status-validator.mjs';

const fixedTimes = {
  docsOnly: '2026-03-21T20:15:00.000Z',
  invalidMapping: '2026-03-21T20:30:00.000Z',
  missingProof: '2026-03-21T20:35:00.000Z',
  other: '2026-03-21T20:20:00.000Z',
  proofOnly: '2026-03-21T20:10:00.000Z',
  reusable: '2026-03-21T20:00:00.000Z',
  staleReview: '2026-03-21T20:25:00.000Z',
  tokenOnly: '2026-03-21T20:05:00.000Z',
} as const;

describe('createReusableComponentStatus', () => {
  it('matches the committed current-state fixtures for each change-class profile', () => {
    expect(
      createReusableComponentStatus({
        changeClass: 'reusable-component-advancement',
        now: fixedTimes.reusable,
      })
    ).toEqual(validReusableStatus);
    expect(
      createReusableComponentStatus({
        changeClass: 'token-only',
        now: fixedTimes.tokenOnly,
      })
    ).toEqual(validTokenOnlyStatus);
    expect(
      createReusableComponentStatus({
        changeClass: 'proof-only',
        now: fixedTimes.proofOnly,
      })
    ).toEqual(validProofOnlyStatus);
    expect(
      createReusableComponentStatus({
        changeClass: 'docs-only',
        now: fixedTimes.docsOnly,
      })
    ).toEqual(validDocsOnlyStatus);
    expect(
      createReusableComponentStatus({
        changeClass: 'other',
        now: fixedTimes.other,
      })
    ).toEqual(validOtherStatus);
  });

  it('keeps stale review inspectable without overclaiming', () => {
    const workspace = copyBaseWorkspace();
    replaceWorkspaceFile(
      workspace,
      'artifacts/chromatic/status.json',
      'scripts/fixtures/chromatic-status/invalid-stale-generated-at.chromatic-status.json'
    );

    expect(
      createReusableComponentStatus({
        changeClass: 'reusable-component-advancement',
        now: fixedTimes.staleReview,
        rootDir: workspace,
      })
    ).toEqual(staleReviewStatus);
  });

  it('surfaces invalid mapping and missing proof through additive reason codes', () => {
    const invalidMappingWorkspace = copyBaseWorkspace();
    replaceWorkspaceFile(
      invalidMappingWorkspace,
      'artifacts/harness/reusable-component-mapping-status.json',
      'scripts/fixtures/reusable-component-mapping/invalid-provenance/artifacts/harness/reusable-component-mapping-status.json'
    );
    expect(
      createReusableComponentStatus({
        changeClass: 'reusable-component-advancement',
        now: fixedTimes.invalidMapping,
        rootDir: invalidMappingWorkspace,
      })
    ).toEqual(invalidMappingStatus);

    const missingProofWorkspace = copyBaseWorkspace();
    writeJson(path.join(missingProofWorkspace, 'artifacts/storybook/proof-coverage.json'), {
      proofCoverageVersion: '1',
      summary: {
        componentCount: 1,
        readyCount: 0,
        failingCount: 1,
      },
      components: [
        {
          componentId: 'thinking-indicator',
          tier: 'primitive',
          status: 'missing-required-kinds',
          requiredKinds: ['default', 'docs'],
          implementedKinds: ['default'],
          missingKinds: ['docs'],
          generatedArtifactRefs: {
            tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
            recipeDocs: 'storybook/stories/pilot-recipe-contract.stories.tsx',
            runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
          },
        },
      ],
    });
    expect(
      createReusableComponentStatus({
        changeClass: 'reusable-component-advancement',
        now: fixedTimes.missingProof,
        rootDir: missingProofWorkspace,
      })
    ).toEqual(missingProofStatus);
  });
});

describe('runReusableComponentStatusValidation', () => {
  it('passes for informational statuses, including invalid mapping carried as status data', async () => {
    const workspace = copyBaseWorkspace();
    replaceWorkspaceFile(
      workspace,
      'artifacts/harness/reusable-component-mapping-status.json',
      'scripts/fixtures/reusable-component-mapping/invalid-provenance/artifacts/harness/reusable-component-mapping-status.json'
    );

    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: fixedTimes.invalidMapping,
      rootDir: workspace,
    });
    await writeReusableComponentStatus(status, { rootDir: workspace });

    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const exitCode = await runReusableComponentStatusValidation({
      now: fixedTimes.invalidMapping,
      rootDir: workspace,
      stderr,
      stdout,
    });

    expect(exitCode).toBe(0);
    expect(stderr.read()).toBe('');
    expect(stdout.read()).toContain(
      'Highest earned claim: reusable-component-advancement/reusable-component-reviewed'
    );
  });

  it('fails when the committed artifact drifts from the computed evaluator output', async () => {
    const workspace = copyBaseWorkspace();
    const status = createReusableComponentStatus({
      changeClass: 'reusable-component-advancement',
      now: fixedTimes.reusable,
      rootDir: workspace,
    });
    await writeReusableComponentStatus(status, { rootDir: workspace });

    const drifted = readJson(path.join(workspace, defaultReusableComponentStatusPath));
    drifted.reasonCodes = ['drifted-manually'];
    writeJson(path.join(workspace, defaultReusableComponentStatusPath), drifted);

    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const exitCode = await runReusableComponentStatusValidation({
      now: fixedTimes.reusable,
      rootDir: workspace,
      stderr,
      stdout,
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe('');
    expect(stderr.read()).toContain('[CT-12B_STATUS_DRIFT]');
  });
});

describe('reusable component status CLI contract', () => {
  it('registers the generator/validator scripts and writes the artifact through the generator CLI', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['generate:reusable-component-status']).toBe(
      'node scripts/generate-reusable-component-status.mjs'
    );
    expect(packageJson.scripts?.['validate:reusable-component-status']).toBe(
      'node scripts/validate-reusable-component-status.mjs'
    );

    const workspace = copyBaseWorkspace();
    const generator = spawnSync('node', ['scripts/generate-reusable-component-status.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        [reusableComponentStatusRootDirEnvVar]: workspace,
        [reusableComponentStatusChangeClassEnvVar]: 'token-only',
      },
    });

    expect(generator.status).toBe(0);
    expect(generator.stdout).toContain('Reusable component status written:');
    expect(readJson(path.join(workspace, defaultReusableComponentStatusPath))).toMatchObject({
      changeClass: 'token-only',
      highestEarnedClaim: {
        profileId: 'token-only',
        claimId: 'token-only-parity-current',
      },
    });
  });
});

function copyBaseWorkspace() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'reusable-component-status-'));
  const filesToCopy: Array<{ source: string; dest: string }> = [
    { source: 'src/figma/sync-ledger.json', dest: 'src/figma/sync-ledger.json' },
    {
      source: 'scripts/fixtures/component-mapping-workspace/storybook/story-inventory.json',
      dest: 'storybook/story-inventory.json',
    },
    {
      source:
        'scripts/fixtures/reusable-component-mapping/complete/storybook/component-specs/thinking-indicator.json',
      dest: 'storybook/component-specs/thinking-indicator.json',
    },
    {
      source:
        'scripts/fixtures/component-mapping-workspace/artifacts/storybook/proof-coverage.json',
      dest: 'artifacts/storybook/proof-coverage.json',
    },
    { source: 'artifacts/chromatic/status.json', dest: 'artifacts/chromatic/status.json' },
    {
      source: 'artifacts/harness/reusable-component-mapping-status.json',
      dest: 'artifacts/harness/reusable-component-mapping-status.json',
    },
  ];
  for (const { source, dest } of filesToCopy) {
    const sourcePath = path.join(repoRoot, source);
    const targetPath = path.join(workspace, dest);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.cpSync(sourcePath, targetPath);
  }
  return workspace;
}

function replaceWorkspaceFile(
  workspace: string,
  targetRepoRelativePath: string,
  fixtureRepoRelativePath: string
) {
  const sourcePath = path.join(repoRoot, fixtureRepoRelativePath);
  const targetPath = path.join(workspace, targetRepoRelativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(sourcePath, targetPath);
}

function createWritableBuffer() {
  let value = '';
  return {
    write(chunk: string) {
      value += chunk;
    },
    read() {
      return value;
    },
  };
}

function readJson(targetPath: string) {
  return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
}

function writeJson(targetPath: string, value: unknown) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}
