import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  componentMappingRootDirEnvVar,
  defaultReusableComponentMappingStatusPath,
} from '../scripts/lib/component-mapping.mjs';
import {
  evaluateReusableComponentMapping,
  runReusableComponentMappingValidation,
} from '../scripts/lib/reusable-component-mapping-validator.mjs';

const fixtureRoot = path.join(repoRoot, 'scripts/fixtures/reusable-component-mapping');
const cliPath = path.join(repoRoot, 'scripts/validate-reusable-component-mapping.mjs');
const fixedNow = new Date('2026-03-21T12:30:00.000Z');

describe('evaluateReusableComponentMapping', () => {
  it('accepts the aligned pilot fixture as complete', () => {
    const workspace = copyFixtureWorkspace('complete');

    const result = evaluateReusableComponentMapping({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(result.ok).toBe(true);
    expect(result.report.summary).toEqual({
      componentCount: 1,
      completeCount: 1,
      incompleteCount: 0,
      invalidCount: 0,
    });
    expect(result.report.components[0]).toMatchObject({
      componentId: 'thinking-indicator',
      state: 'complete',
      linkState: 'resolved-current',
      issues: [],
      drift: [],
    });
  });

  it('marks the pilot projections incomplete when the Storybook link is unresolved', () => {
    const workspace = copyFixtureWorkspace('incomplete-link');

    const result = evaluateReusableComponentMapping({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(result.ok).toBe(true);
    expect(result.report.components[0]).toMatchObject({
      componentId: 'thinking-indicator',
      state: 'incomplete',
      linkState: 'unresolved',
    });
    expect(
      result.report.components[0]?.issues.some((issue: string) =>
        issue.includes('[CT-11B_MAPPING_INCOMPLETE_FIELD]')
      )
    ).toBe(true);
  });

  it('flags invalid CT-10B provenance separately from unresolved links', () => {
    const workspace = copyFixtureWorkspace('invalid-provenance');

    const result = evaluateReusableComponentMapping({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(result.ok).toBe(false);
    expect(result.report.summary.invalidCount).toBe(1);
    expect(result.report.components[0]).toMatchObject({
      componentId: 'thinking-indicator',
      state: 'invalid',
      linkState: 'invalid-provenance',
    });
    expect(
      result.errors.some((error: string) =>
        error.includes('[CT-11B_MAPPING_INVALID_LINK_PROVENANCE]')
      )
    ).toBe(true);
  });

  it('reports projection drift from the shared CT-11B shape', () => {
    const workspace = copyFixtureWorkspace('projection-drift');

    const result = evaluateReusableComponentMapping({
      now: fixedNow,
      rootDir: workspace,
    });

    expect(result.ok).toBe(false);
    expect(result.report.components[0]).toMatchObject({
      componentId: 'thinking-indicator',
      state: 'invalid',
    });
    expect(
      result.report.components[0]?.drift.some((entry: string) =>
        entry.includes('[CT-11B_MAPPING_DRIFT]')
      )
    ).toBe(true);
  });
});

describe('runReusableComponentMappingValidation', () => {
  it('writes the machine-readable status artifact and passes on complete or incomplete surfaces', async () => {
    const workspace = copyFixtureWorkspace('incomplete-link');
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();

    const exitCode = await runReusableComponentMappingValidation({
      now: fixedNow,
      rootDir: workspace,
      stderr,
      stdout,
    });

    expect(exitCode).toBe(0);
    expect(stderr.read()).toBe('');
    expect(stdout.read()).toContain(
      'Mapping status: 1 components, 0 complete, 1 incomplete, 0 invalid'
    );

    const statusReport = readJson(workspace, defaultReusableComponentMappingStatusPath);
    expect(statusReport.summary).toEqual({
      componentCount: 1,
      completeCount: 0,
      incompleteCount: 1,
      invalidCount: 0,
    });
    expect(statusReport.components[0]).toMatchObject({
      componentId: 'thinking-indicator',
      state: 'incomplete',
      linkState: 'unresolved',
    });
  });
});

describe('reusable component mapping validator CLI contract', () => {
  it('exposes the seam-owned validator script and exits non-zero on invalid mappings', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };
    const workspace = copyFixtureWorkspace('invalid-provenance');

    expect(packageJson.scripts?.['validate:reusable-component-mapping']).toBe(
      'node scripts/validate-reusable-component-mapping.mjs'
    );

    const result = spawnSync('node', [cliPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        [componentMappingRootDirEnvVar]: workspace,
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Reusable component mapping status written:');
    expect(result.stderr).toContain('[CT-11B_MAPPING_INVALID_LINK_PROVENANCE]');
  });
});

function copyFixtureWorkspace(name: string) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), `reusable-component-mapping-${name}-`));
  fs.cpSync(path.join(fixtureRoot, name), workspace, { recursive: true });
  return workspace;
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

function readJson(workspace: string, repoRelativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(workspace, repoRelativePath), 'utf8'));
}
