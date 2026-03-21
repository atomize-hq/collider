import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  chromaticProjectTokenEnvVar,
  chromaticReviewArtifactName,
  chromaticReviewBuildDir,
  chromaticReviewJobName,
  chromaticReviewScriptName,
  resolveChromaticReviewInvocation,
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
    expect(workflow).toContain(`name: ${chromaticReviewArtifactName}`);
    expect(workflow).toContain('uses: actions/download-artifact@v4');
    expect(workflow).toContain(
      `CHROMATIC_PROJECT_TOKEN: \${{ secrets.${chromaticProjectTokenEnvVar} }}`
    );
  });
});

describe('resolveChromaticReviewInvocation', () => {
  it('refuses shared publication locally when no token is present', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    const buildDirPath = path.join(tempRoot, chromaticReviewBuildDir);
    fs.mkdirSync(buildDirPath);

    const result = resolveChromaticReviewInvocation({
      cwd: tempRoot,
      env: {},
    });

    expect(result.mode).toBe('local-refusal');
    expect(result.buildDir).toBe(chromaticReviewBuildDir);
    expect(result.message).toContain(chromaticReviewJobName);
    expect(result.message).toContain(chromaticProjectTokenEnvVar);
  });

  it('returns a publish command when the CI token is available', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    fs.mkdirSync(path.join(tempRoot, chromaticReviewBuildDir));

    const result = resolveChromaticReviewInvocation({
      cwd: tempRoot,
      env: {
        [chromaticProjectTokenEnvVar]: 'test-token',
      },
    });

    expect(result.mode).toBe('publish');
    expect(result.args).toEqual([
      'exec',
      'chromatic',
      '--storybook-build-dir',
      chromaticReviewBuildDir,
      '--exit-zero-on-changes',
    ]);
  });

  it('fails in CI when the owner token is missing', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-review-'));
    fs.mkdirSync(path.join(tempRoot, chromaticReviewBuildDir));

    expect(() =>
      resolveChromaticReviewInvocation({
        cwd: tempRoot,
        env: {
          GITHUB_ACTIONS: 'true',
        },
      })
    ).toThrow(`[CHROMATIC_REVIEW_TOKEN_MISSING] ${chromaticProjectTokenEnvVar} must be set`);
  });
});

describe('normalizeChromaticStatus', () => {
  it('returns a repo-owned payload without mutating input context', () => {
    const input = {
      branch: 'feature/example',
      revision: '0123456789abcdef0123456789abcdef01234567',
      proofInventory: {
        path: 'storybook/story-inventory.json',
        version: '1',
        selectedComponentIds: ['button'],
        selectedStoryIds: ['button--default'],
      },
      build: {
        storybookDirectory: chromaticReviewBuildDir,
      },
      review: {
        mode: 'informational',
        scope: {
          componentIds: ['button'],
          storyIds: ['button--default'],
        },
      },
      providerResult: {
        status: 'accepted',
        buildUrl: 'https://example.com/build',
        changeCount: 2,
      },
      generatedAt: '2026-03-21T12:00:00.000Z',
    };

    const result = normalizeChromaticStatus(input);

    expect(result).toEqual({
      statusVersion: '0',
      branch: 'feature/example',
      revision: '0123456789abcdef0123456789abcdef01234567',
      proofInventory: {
        path: 'storybook/story-inventory.json',
        version: '1',
        selectedComponentIds: ['button'],
        selectedStoryIds: ['button--default'],
      },
      build: {
        storybookDirectory: chromaticReviewBuildDir,
        provider: {
          status: 'accepted',
          buildUrl: 'https://example.com/build',
          changeCount: 2,
        },
      },
      review: {
        mode: 'informational',
        scope: {
          componentIds: ['button'],
          storyIds: ['button--default'],
        },
      },
      check: {
        name: chromaticReviewJobName,
      },
      generatedAt: '2026-03-21T12:00:00.000Z',
    });

    expect(input.proofInventory.selectedComponentIds).toEqual(['button']);
    expect(input.review.scope.storyIds).toEqual(['button--default']);
  });
});
