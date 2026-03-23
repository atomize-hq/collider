import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  createStorybookProofCoverageReport,
  formatStorybookProofCoverageSummary,
} from '../scripts/lib/storybook-proof-coverage.mjs';
import { loadAndValidateStorybookProofStructure } from '../scripts/lib/storybook-proof-structure.mjs';

const fixtureDir = path.join(repoRoot, 'scripts/fixtures/storybook-proof-structure');
const sharedTierPolicyPath = path.join(fixtureDir, '_shared/component-tier-policy.json');

describe('createStorybookProofCoverageReport', () => {
  it('exposes normalized component facts from the proof-structure validator', () => {
    const result = loadFixture('valid-pilot');

    expect(result.errors).toEqual([]);
    expect(result.data.componentFacts).toEqual([
      {
        componentId: 'thinking-indicator',
        generatedArtifactRefs: {
          tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
          recipeDocs: 'storybook/stories/pilot-recipe-contract.stories.tsx',
          runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
        },
        implementedKinds: ['default', 'variant-matrix', 'state-matrix', 'motion', 'docs'],
        requiredKinds: ['default', 'variant-matrix', 'state-matrix', 'motion', 'docs'],
        tier: 'primitive',
      },
    ]);
  });

  it('creates a passing pilot report snapshot', () => {
    const report = createStorybookProofCoverageReport(loadFixture('valid-pilot'));

    expect(report).toMatchInlineSnapshot(`
      {
        "components": [
          {
            "componentId": "thinking-indicator",
            "generatedArtifactRefs": {
              "recipeDocs": "storybook/stories/pilot-recipe-contract.stories.tsx",
              "runtimeParity": "storybook/stories/runtime-css-parity.stories.tsx",
              "tokenDocs": "storybook/stories/generated-token-docs.stories.tsx",
            },
            "implementedKinds": [
              "default",
              "variant-matrix",
              "state-matrix",
              "motion",
              "docs",
            ],
            "missingKinds": [],
            "requiredKinds": [
              "default",
              "variant-matrix",
              "state-matrix",
              "motion",
              "docs",
            ],
            "status": "ready",
            "tier": "primitive",
          },
        ],
        "proofCoverageVersion": "1",
        "summary": {
          "componentCount": 1,
          "failingCount": 0,
          "readyCount": 1,
        },
      }
    `);
    expect(formatStorybookProofCoverageSummary(report)).toBe(
      'Proof coverage: 1 components, 1 ready, 0 failing'
    );
  });

  it('creates a failing pilot report snapshot when a required kind is missing', () => {
    const report = createStorybookProofCoverageReport(loadFixture('missing-required-kind'));

    expect(report).toMatchInlineSnapshot(`
      {
        "components": [
          {
            "componentId": "thinking-indicator",
            "generatedArtifactRefs": {
              "recipeDocs": "storybook/stories/pilot-recipe-contract.stories.tsx",
              "runtimeParity": "storybook/stories/runtime-css-parity.stories.tsx",
              "tokenDocs": "storybook/stories/generated-token-docs.stories.tsx",
            },
            "implementedKinds": [
              "default",
            ],
            "missingKinds": [
              "variant-matrix",
              "state-matrix",
              "motion",
              "docs",
            ],
            "requiredKinds": [
              "default",
              "variant-matrix",
              "state-matrix",
              "motion",
              "docs",
            ],
            "status": "missing-required-kinds",
            "tier": "primitive",
          },
        ],
        "proofCoverageVersion": "1",
        "summary": {
          "componentCount": 1,
          "failingCount": 1,
          "readyCount": 0,
        },
      }
    `);
  });
});

describe('storybook proof coverage CLI', () => {
  it('writes proof coverage output for a structurally valid fixture and prints summary counts', () => {
    const rootDir = prepareCliFixture('valid-pilot');
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-proof-coverage-'));
    const outputPath = path.join(tempDir, 'proof-coverage.json');
    const cliPath = path.join(repoRoot, 'scripts/generate-storybook-proof-coverage.mjs');

    const result = spawnSync('node', [cliPath, outputPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        STORYBOOK_PROOF_ROOT_DIR: rootDir,
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain(`✓ Storybook proof coverage report written: ${outputPath}`);
    expect(result.stdout).toContain('Proof coverage: 1 components, 1 ready, 0 failing');
    expect(JSON.parse(fs.readFileSync(outputPath, 'utf8'))).toMatchObject({
      proofCoverageVersion: '1',
      summary: {
        componentCount: 1,
        readyCount: 1,
        failingCount: 0,
      },
    });
  });

  it('stops before writing a report when proof structure is invalid', () => {
    const rootDir = prepareCliFixture('unknown-tier');
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-proof-coverage-'));
    const outputPath = path.join(tempDir, 'proof-coverage.json');
    const cliPath = path.join(repoRoot, 'scripts/generate-storybook-proof-coverage.mjs');

    const result = spawnSync('node', [cliPath, outputPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        STORYBOOK_PROOF_ROOT_DIR: rootDir,
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain(
      '[CT-9B_PROOF_STRUCTURE_UNKNOWN_TIER] componentId "thinking-indicator" references unknown tier "pilot" in componentSpec.tier'
    );
    expect(fs.existsSync(outputPath)).toBe(false);
  });
});

describe('storybook proof coverage package contract', () => {
  it('exposes the seam-owned generate:storybook-proof-coverage entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['generate:storybook-proof-coverage']).toBe(
      'node scripts/generate-storybook-proof-coverage.mjs'
    );
  });
});

function fixturePath(name: string) {
  return path.join(fixtureDir, name);
}

function loadFixture(name: string) {
  return loadAndValidateStorybookProofStructure({
    componentTierPolicyPath: sharedTierPolicyPath,
    rootDir: fixturePath(name),
    storyRoots: [path.join(repoRoot, 'src'), path.join(fixturePath(name), 'storybook/stories')],
  });
}

function prepareCliFixture(name: string) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `storybook-proof-cli-${name}-`));
  fs.cpSync(fixturePath(name), tempRoot, { recursive: true });
  fs.mkdirSync(path.join(tempRoot, 'src/components/ai-elements'), { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, 'src/components/ai-elements/ThinkingIndicator.stories.tsx'),
    path.join(tempRoot, 'src/components/ai-elements/ThinkingIndicator.stories.tsx')
  );
  fs.copyFileSync(
    sharedTierPolicyPath,
    path.join(tempRoot, 'storybook/component-tier-policy.json')
  );
  return tempRoot;
}
