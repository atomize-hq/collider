import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  chromaticReviewDiagnosticsPath,
  chromaticProjectTokenEnvVar,
  chromaticReviewArtifactPrefix,
  chromaticReviewBuildDir,
  chromaticReviewDeferEnvVar,
  chromaticReviewJobName,
  chromaticReviewLogPath,
  chromaticReviewScriptName,
  createChromaticRunnerOptions,
} from '../../../scripts/lib/chromatic-review-command.mjs';
import { normalizeChromaticStatus } from '../../../scripts/lib/chromatic-status.mjs';

describe('chromatic review package contract', () => {
  it('exposes exactly one repo-owned Chromatic publish script', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    const chromaticScripts = Object.keys(packageJson.scripts ?? {}).filter((name) =>
      name.startsWith('chromatic')
    );

    expect(chromaticScripts).toEqual([chromaticReviewScriptName]);
    expect(packageJson.scripts?.[chromaticReviewScriptName]).toBe(
      'node scripts/chromatic-review.mjs'
    );
  });
});

describe('chromatic review workflow contract', () => {
  it('keeps one shared owner job with a single build artifact handoff', () => {
    const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toContain('chromatic-review:');
    expect(workflow).toContain(`name: ${chromaticReviewJobName}`);
    expect(workflow).toContain('needs: build-storybook');
    expect(workflow).toContain('uses: actions/upload-artifact@v4');
    expect(workflow).toContain(`name: ${chromaticReviewArtifactPrefix}-\${{ github.sha }}`);
    expect(workflow).toContain('uses: actions/download-artifact@v4');
    expect(workflow).toContain(
      `CHROMATIC_PROJECT_TOKEN: \${{ secrets.${chromaticProjectTokenEnvVar} }}`
    );
  });
});

describe('createChromaticRunnerOptions', () => {
  it('refuses shared publication locally when no token is present', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    const buildDirPath = path.join(tempRoot, chromaticReviewBuildDir);
    fs.mkdirSync(buildDirPath);

    const result = createChromaticRunnerOptions({
      cwd: tempRoot,
      env: {},
    });

    expect(result.mode).toBe('local-refusal');
    expect(result.buildDir).toBe(chromaticReviewBuildDir);
    expect(result.buildDirPath).toBe(buildDirPath);
    expect(result.message).toContain(chromaticReviewJobName);
    expect(result.message).toContain(chromaticProjectTokenEnvVar);
  });

  it('returns publish options when the CI token is available', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    fs.mkdirSync(path.join(tempRoot, chromaticReviewBuildDir));

    const result = createChromaticRunnerOptions({
      cwd: tempRoot,
      env: {
        [chromaticProjectTokenEnvVar]: 'test-token',
      },
    });

    expect(result.mode).toBe('publish');
    expect(result.options).toMatchObject({
      diagnosticsFile: path.resolve(tempRoot, chromaticReviewDiagnosticsPath),
      exitZeroOnChanges: true,
      logFile: path.resolve(tempRoot, chromaticReviewLogPath),
      projectToken: 'test-token',
      skip: false,
      storybookBuildDir: path.resolve(tempRoot, chromaticReviewBuildDir),
    });
  });

  it('fails in CI when the owner token is missing', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    fs.mkdirSync(path.join(tempRoot, chromaticReviewBuildDir));

    expect(() =>
      createChromaticRunnerOptions({
        cwd: tempRoot,
        env: {
          GITHUB_ACTIONS: 'true',
        },
      })
    ).toThrow(`[CHROMATIC_REVIEW_TOKEN_MISSING] ${chromaticProjectTokenEnvVar} must be set`);
  });

  it('switches into deferred mode when the defer flag is present', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    fs.mkdirSync(path.join(tempRoot, chromaticReviewBuildDir));

    const result = createChromaticRunnerOptions({
      cwd: tempRoot,
      env: {
        [chromaticProjectTokenEnvVar]: 'test-token',
        [chromaticReviewDeferEnvVar]: 'true',
      },
    });

    expect(result.mode).toBe('deferred');
    expect(result.options?.skip).toBe(true);
  });
});

describe('normalizeChromaticStatus', () => {
  it('returns a repo-owned payload without mutating input context', () => {
    const input = {
      branchName: 'feature/example',
      gitSha: '0123456789abcdef0123456789abcdef01234567',
      proofInventory: {
        inventoryVersion: '1',
        path: 'storybook/story-inventory.json',
        selectedComponentIds: ['thinking-indicator'],
        selectedStoryIds: [
          'contracts-pilot-recipe--thinking-indicator-recipe',
          'contracts-generated-tokens--token-registry',
        ],
      },
      buildUrl: 'https://example.com/build',
      checkConclusion: 'success',
      diffOutcome: 'passed',
      requiredForClaim: false,
      reviewMode: 'informational',
      reviewScope: {
        componentIds: ['thinking-indicator'],
        componentTiers: {
          'thinking-indicator': 'primitive',
        },
        storyIds: [
          'contracts-pilot-recipe--thinking-indicator-recipe',
          'contracts-generated-tokens--token-registry',
        ],
      },
      generatedAt: '2026-03-21T12:00:00.000Z',
    };

    const result = normalizeChromaticStatus(input);

    expect(result).toEqual({
      statusVersion: '1',
      branch: {
        name: 'feature/example',
      },
      revision: {
        gitSha: '0123456789abcdef0123456789abcdef01234567',
      },
      proofInventory: {
        inventoryVersion: '1',
        path: 'storybook/story-inventory.json',
        selectedComponentIds: ['thinking-indicator'],
        selectedStoryIds: [
          'contracts-pilot-recipe--thinking-indicator-recipe',
          'contracts-generated-tokens--token-registry',
        ],
      },
      build: {
        url: 'https://example.com/build',
      },
      review: {
        diffOutcome: 'passed',
        mode: 'informational',
        requiredForClaim: false,
        scope: {
          componentIds: ['thinking-indicator'],
          componentTiers: {
            'thinking-indicator': 'primitive',
          },
          storyIds: [
            'contracts-pilot-recipe--thinking-indicator-recipe',
            'contracts-generated-tokens--token-registry',
          ],
        },
      },
      check: {
        conclusion: 'success',
        name: chromaticReviewJobName,
      },
      generatedAt: '2026-03-21T12:00:00.000Z',
    });

    expect(input.proofInventory.selectedComponentIds).toEqual(['thinking-indicator']);
    expect(input.reviewScope.storyIds).toEqual([
      'contracts-pilot-recipe--thinking-indicator-recipe',
      'contracts-generated-tokens--token-registry',
    ]);
  });
});
