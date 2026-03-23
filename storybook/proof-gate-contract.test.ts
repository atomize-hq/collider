import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  evaluateStorybookProofGateReport,
  runStorybookProofGate,
  runStorybookProofGateCli,
  storybookProofGateSteps,
  storybookProofGateUsage,
} from '../scripts/lib/storybook-proof-gate.mjs';
import {
  createStorybookProofCoverageReport,
  readStorybookProofCoverageReport,
  writeStorybookProofCoverageReport,
} from '../scripts/lib/storybook-proof-coverage.mjs';
import { loadAndValidateStorybookProofStructure } from '../scripts/lib/storybook-proof-structure.mjs';

type ProofStructureResult = ReturnType<typeof loadAndValidateStorybookProofStructure>;
type ProofCoverageReport = ReturnType<typeof createStorybookProofCoverageReport>;
type ProofCoverageReadResult = ReturnType<typeof readStorybookProofCoverageReport>;

describe('runStorybookProofGate', () => {
  it('runs structure validation before coverage generation and passes on ready pilot data', async () => {
    const calls: string[] = [];
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const proofStructureResult = loadCommittedProofStructure();

    const exitCode = await runStorybookProofGate({
      stderr,
      stdout,
      loadProofStructure() {
        calls.push('validate:storybook-proof-structure');
        return proofStructureResult;
      },
      createCoverageReport(result: ProofStructureResult) {
        calls.push('generate:storybook-proof-coverage');
        return {
          proofCoverageVersion: '1',
          summary: {
            componentCount: result.data.componentFacts?.length ?? 0,
            readyCount: 1,
            failingCount: 0,
          },
          components: [
            {
              componentId: 'thinking-indicator',
              tier: 'primitive',
              status: 'ready',
              requiredKinds: ['default', 'docs'],
              implementedKinds: ['default', 'docs'],
              missingKinds: [],
              generatedArtifactRefs: {
                tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
                recipeDocs: 'storybook/stories/pilot-recipe-contract.stories.tsx',
                runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
              },
            },
          ],
        };
      },
      writeCoverageReport(report: ProofCoverageReport) {
        calls.push('enforce:storybook-proof-gate');
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-proof-gate-pass-'));
        return writeStorybookProofCoverageReport(report, path.join(tempDir, 'proof-coverage.json'));
      },
      readCoverageReport(target: string): ProofCoverageReadResult {
        return readStorybookProofCoverageReport(target);
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr.read()).toBe('');
    expect(stdout.read()).toContain('✓ Storybook proof gate passed:');
    expect(stdout.read()).toContain('Published proof threads: THR-02, THR-04, THR-08');
    expect(calls).toEqual([
      'validate:storybook-proof-structure',
      'generate:storybook-proof-coverage',
      'enforce:storybook-proof-gate',
    ]);
  });

  it('stops immediately when proof structure is invalid', async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const exitCode = await runStorybookProofGate({
      stderr,
      stdout,
      loadProofStructure() {
        return {
          rootDir: repoRoot,
          errors: [
            '[CT-9B_PROOF_STRUCTURE_UNKNOWN_TIER] componentId "thinking-indicator" references unknown tier "pilot" in componentSpec.tier',
          ],
          data: {
            componentFacts: null,
          },
        };
      },
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe('');
    expect(stderr.read()).toContain('[CT-9B_PROOF_STRUCTURE_UNKNOWN_TIER]');
  });

  it('fails with actionable output when required proof kinds are missing', async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-proof-gate-missing-'));
    const exitCode = await runStorybookProofGate({
      stderr,
      stdout,
      loadProofStructure: loadCommittedProofStructure,
      createCoverageReport() {
        return {
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
              requiredKinds: ['default', 'variant-matrix', 'state-matrix', 'motion', 'docs'],
              implementedKinds: ['default'],
              missingKinds: ['variant-matrix', 'state-matrix', 'motion', 'docs'],
              generatedArtifactRefs: {
                tokenDocs: 'storybook/stories/generated-token-docs.stories.tsx',
                recipeDocs: 'storybook/stories/pilot-recipe-contract.stories.tsx',
                runtimeParity: 'storybook/stories/runtime-css-parity.stories.tsx',
              },
            },
          ],
        };
      },
      writeCoverageReport(report: ProofCoverageReport) {
        return writeStorybookProofCoverageReport(report, path.join(tempDir, 'proof-coverage.json'));
      },
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toContain('Proof coverage: 1 components, 0 ready, 1 failing');
    expect(stderr.read()).toContain('[CT-9B_PROOF_GATE_MISSING_REQUIRED_KIND]');
    expect(stderr.read()).toContain('storybook/component-specs/thinking-indicator.json');
  });

  it('fails when the generated report cannot be read back from disk', async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-proof-gate-missing-report-'));
    const missingPath = path.join(tempDir, 'proof-coverage.json');

    const exitCode = await runStorybookProofGate({
      stderr,
      stdout,
      loadProofStructure: loadCommittedProofStructure,
      writeCoverageReport() {
        return missingPath;
      },
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe('');
    expect(stderr.read()).toContain('[CT-9B_PROOF_GATE_REPORT_READ_FAILED]');
    expect(stderr.read()).toContain(missingPath);
  });
});

describe('evaluateStorybookProofGateReport', () => {
  it('rejects malformed coverage report summaries', () => {
    const result = evaluateStorybookProofGateReport(
      {
        proofCoverageVersion: '1',
        summary: {
          componentCount: 1,
          readyCount: 1,
          failingCount: 0,
        },
        components: [
          {
            componentId: 'thinking-indicator',
            status: 'missing-required-kinds',
            missingKinds: ['docs'],
          },
        ],
      },
      {
        reportPath: 'artifacts/storybook/proof-coverage.json',
      }
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      '[CT-9B_PROOF_GATE_INVALID_REPORT] artifacts/storybook/proof-coverage.json summary.readyCount must equal the number of ready components'
    );
  });
});

describe('storybook proof gate CLI', () => {
  it('passes against the valid pilot fixture and writes the report artifact', () => {
    const rootDir = prepareFixtureRoot('valid-pilot');
    const cliPath = path.join(repoRoot, 'scripts/govern-storybook-proof.mjs');
    const result = spawnSync('node', [cliPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        STORYBOOK_PROOF_ROOT_DIR: rootDir,
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('✓ Storybook proof gate passed:');
    expect(result.stdout).toContain('Published proof threads: THR-02, THR-04, THR-08');
    expect(
      JSON.parse(
        fs.readFileSync(path.join(rootDir, 'artifacts/storybook/proof-coverage.json'), 'utf8')
      )
    ).toMatchObject({
      proofCoverageVersion: '1',
      summary: {
        componentCount: 1,
        readyCount: 1,
        failingCount: 0,
      },
    });
  });

  it('fails against the missing-required-kind fixture with a blocking component diagnosis', () => {
    const rootDir = prepareFixtureRoot('missing-required-kind');
    const cliPath = path.join(repoRoot, 'scripts/govern-storybook-proof.mjs');
    const result = spawnSync('node', [cliPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        STORYBOOK_PROOF_ROOT_DIR: rootDir,
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Proof coverage: 1 components, 0 ready, 1 failing');
    expect(result.stderr).toContain('[CT-9B_PROOF_GATE_MISSING_REQUIRED_KIND]');
    expect(result.stderr).toContain('componentId "thinking-indicator"');
  });
});

describe('storybook proof gate package contract', () => {
  it('fails fast on unsupported CLI args', async () => {
    const stderr = createWritableBuffer();
    const exitCode = await runStorybookProofGateCli({
      args: ['--json'],
      stderr,
      runGate() {
        throw new Error('should not run');
      },
    });

    expect(exitCode).toBe(1);
    expect(stderr.read()).toBe(`${storybookProofGateUsage}\n`);
  });

  it('maps unexpected orchestration failures to exit code 3', async () => {
    const stderr = createWritableBuffer();
    const exitCode = await runStorybookProofGateCli({
      args: [],
      stderr,
      runGate() {
        throw new Error('boom');
      },
    });

    expect(exitCode).toBe(3);
    expect(stderr.read()).toBe('[UNEXPECTED_RUNTIME_FAILURE] boom\n');
  });

  it('exposes the seam-owned govern:storybook-proof entrypoint and ordered steps', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['govern:storybook-proof']).toBe(
      'node scripts/govern-storybook-proof.mjs'
    );
    expect(storybookProofGateSteps).toEqual([
      'validate:storybook-proof-structure',
      'generate:storybook-proof-coverage',
      'enforce:storybook-proof-gate',
    ]);
  });

  it('adds the storybook proof gate to just preflight after token governance', () => {
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');
    const preflightRecipe = extractRecipe(justfile, 'preflight');

    expect(preflightRecipe).toContain('▶ step 2/5 — storybook proof gate');
    expectCommandOrder(preflightRecipe, [
      'pnpm govern:tokens',
      'just storybook-proof',
      'just check',
      'just loc',
      'just test-all',
    ]);
  });

  it('registers a dedicated storybook-proof CI job before quality', () => {
    const ci = fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

    expect(ci).toContain('storybook-proof:');
    expect(ci).toContain('name: Storybook Proof');
    expect(ci).toContain('run: pnpm govern:storybook-proof');
    expect(ci).toMatch(/storybook-proof:[\s\S]*needs:\s+governance/);
    expect(ci).toMatch(/quality:[\s\S]*needs:\s+\[governance, storybook-proof\]/);
  });
});

function createWritableBuffer() {
  let buffer = '';

  return {
    write(chunk: string | Uint8Array) {
      buffer += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    },
    read() {
      return buffer;
    },
  };
}

function loadCommittedProofStructure() {
  return loadAndValidateStorybookProofStructure();
}

function extractRecipe(justfile: string, recipeName: string) {
  const recipeMatch = justfile.match(new RegExp(`^${recipeName}:\\n((?:    .*\\n)+)`, 'm'));

  expect(recipeMatch?.[1]).toBeDefined();
  return recipeMatch![1];
}

function expectCommandOrder(block: string, commands: string[]) {
  const indexes = commands.map((command) => block.indexOf(command));

  expect(indexes.every((index) => index >= 0)).toBe(true);
  expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
}

function prepareFixtureRoot(name: string) {
  const fixtureRoot = path.join(repoRoot, 'scripts/fixtures/storybook-proof-structure', name);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `storybook-proof-gate-${name}-`));
  fs.cpSync(fixtureRoot, tempRoot, { recursive: true });
  fs.mkdirSync(path.join(tempRoot, 'src/components/ai-elements'), { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, 'src/components/ai-elements/ThinkingIndicator.stories.tsx'),
    path.join(tempRoot, 'src/components/ai-elements/ThinkingIndicator.stories.tsx')
  );
  fs.copyFileSync(
    path.join(
      repoRoot,
      'scripts/fixtures/storybook-proof-structure/_shared/component-tier-policy.json'
    ),
    path.join(tempRoot, 'storybook/component-tier-policy.json')
  );
  return tempRoot;
}
