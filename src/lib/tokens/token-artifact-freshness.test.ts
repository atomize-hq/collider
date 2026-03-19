import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  createFreshnessDiagnostics,
  rebuildHint,
  runTokenArtifactFreshnessCheck,
} from '../../../scripts/lib/token-artifact-freshness.mjs';

const repoRoot = process.cwd();
const watchedArtifacts = [
  ['runtime-css', 'src/lib/tokens/tokens.css'],
  ['typed-tokens', 'design-tokens/dist/tokens.ts'],
  ['figma-tokens', 'design-tokens/dist/figma/tokens.json'],
];

beforeAll(() => {
  execFileSync('pnpm', ['build:tokens'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
});

describe('createFreshnessDiagnostics', () => {
  it('groups missing artifacts before stale artifacts and sorts paths within each group', () => {
    const diagnostics = createFreshnessDiagnostics({
      missingArtifacts: [
        { id: 'runtime-css', relPath: 'src/lib/tokens/tokens.css' },
        { id: 'figma-tokens', relPath: 'design-tokens/dist/figma/tokens.json' },
      ],
      staleArtifacts: [
        { id: 'typed-tokens', relPath: 'design-tokens/dist/tokens.ts' },
        { id: 'runtime-css', relPath: 'src/lib/tokens/tokens.css' },
      ],
    });

    expect(diagnostics.map((diagnostic) => `${diagnostic.code}:${diagnostic.path}`)).toEqual([
      'GENERATED_ARTIFACT_MISSING:design-tokens/dist/figma/tokens.json',
      'GENERATED_ARTIFACT_MISSING:src/lib/tokens/tokens.css',
      'GENERATED_ARTIFACT_STALE:design-tokens/dist/tokens.ts',
      'GENERATED_ARTIFACT_STALE:src/lib/tokens/tokens.css',
    ]);

    expect(diagnostics.map((diagnostic) => diagnostic.rule)).toEqual([
      'CT-5',
      'CT-6',
      'CT-5',
      'CT-6',
    ]);
  });
});

describe('runTokenArtifactFreshnessCheck', () => {
  it('passes against the committed generated artifacts', async () => {
    await expect(runTokenArtifactFreshnessCheck()).resolves.toEqual({
      ok: true,
      diagnostics: [],
    });
  });

  it('fails before rebuild when a watched committed artifact is missing', async () => {
    const fixture = createFreshnessFixture();
    let buildInvoked = false;

    fs.rmSync(fixture.artifacts[1].absPath);

    try {
      const result = await runTokenArtifactFreshnessCheck({
        artifacts: fixture.artifacts,
        buildTokenArtifacts: async () => {
          buildInvoked = true;
        },
      });

      expect(buildInvoked).toBe(false);
      expect(result).toEqual({
        ok: false,
        diagnostics: [
          expect.objectContaining({
            code: 'GENERATED_ARTIFACT_MISSING',
            path: 'design-tokens/dist/tokens.ts',
            rule: 'CT-5',
          }),
        ],
      });
    } finally {
      fixture.cleanup();
    }
  });

  it('reports stale artifacts after rebuilding into a temp output root', async () => {
    const fixture = createFreshnessFixture();

    try {
      const result = await runTokenArtifactFreshnessCheck({
        artifacts: fixture.artifacts,
        buildTokenArtifacts: async (overrides) => {
          writeArtifacts(createStagedArtifacts(overrides), {
            'src/lib/tokens/tokens.css': 'runtime-css-stale\n',
            'design-tokens/dist/tokens.ts': 'typed-tokens-fresh\n',
            'design-tokens/dist/figma/tokens.json': 'figma-tokens-fresh\n',
          });
        },
      });

      expect(result).toEqual({
        ok: false,
        diagnostics: [
          expect.objectContaining({
            code: 'GENERATED_ARTIFACT_STALE',
            path: 'src/lib/tokens/tokens.css',
            rule: 'CT-6',
          }),
        ],
      });
    } finally {
      fixture.cleanup();
    }
  });
});

describe('validate-token-artifacts CLI', () => {
  it('prints a success summary when generated artifacts are fresh', () => {
    const result = spawnSync('node', ['scripts/validate-token-artifacts.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Generated token artifacts are fresh');
    expect(result.stderr).toBe('');
  });

  it('keeps failure guidance stable via the shared rebuild hint', () => {
    expect(rebuildHint).toBe('Rebuild generated token artifacts with `pnpm build:tokens`.');
  });
});

function createFreshnessFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'token-artifact-freshness-test-'));
  const artifacts = watchedArtifacts.map(([id, relPath]) => ({
    id,
    relPath,
    absPath: path.join(root, relPath),
  }));

  writeArtifacts(artifacts, {
    'src/lib/tokens/tokens.css': 'runtime-css-fresh\n',
    'design-tokens/dist/tokens.ts': 'typed-tokens-fresh\n',
    'design-tokens/dist/figma/tokens.json': 'figma-tokens-fresh\n',
  });

  return {
    artifacts,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function createStagedArtifacts(overrides: {
  runtimeCssPath: string;
  typedTokensPath: string;
  figmaTokensPath: string;
}) {
  return [
    {
      relPath: 'src/lib/tokens/tokens.css',
      absPath: overrides.runtimeCssPath,
    },
    {
      relPath: 'design-tokens/dist/tokens.ts',
      absPath: overrides.typedTokensPath,
    },
    {
      relPath: 'design-tokens/dist/figma/tokens.json',
      absPath: overrides.figmaTokensPath,
    },
  ];
}

function writeArtifacts(
  artifacts: Array<{ relPath: string; absPath: string }>,
  contentsByRelPath: Record<string, string>
) {
  for (const artifact of artifacts) {
    fs.mkdirSync(path.dirname(artifact.absPath), { recursive: true });
    fs.writeFileSync(artifact.absPath, contentsByRelPath[artifact.relPath] ?? '', 'utf8');
  }
}
