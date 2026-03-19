import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createBuildArtifactPathOverrides as createBuildArtifactPathOverridesDefault,
  getArtifactContractRule,
  getBuildArtifacts as getBuildArtifactsDefault,
  getBuildWriteTargets as getBuildWriteTargetsDefault,
} from '../../design-tokens/build/paths.mjs';
import { preflightBuildArtifacts as preflightBuildArtifactsDefault } from './token-build-preflight.mjs';
import { buildTokenArtifacts as buildTokenArtifactsDefault } from './token-artifacts.mjs';

export const rebuildHint = 'Rebuild generated token artifacts with `pnpm build:tokens`.';

export async function runTokenArtifactFreshnessCheck(options = {}) {
  const committedArtifacts = sortArtifactsByRelPath(
    options.artifacts ?? getBuildArtifactsDefault()
  );
  const missingArtifacts = committedArtifacts.filter(
    (artifact) => !fs.existsSync(artifact.absPath)
  );
  if (missingArtifacts.length > 0) {
    return { ok: false, diagnostics: createFreshnessDiagnostics({ missingArtifacts }) };
  }

  const createTempDir = options.createTempDir ?? defaultCreateTempDir;
  const removeTempDir = options.removeTempDir ?? defaultRemoveTempDir;
  const createBuildArtifactPathOverrides =
    options.createBuildArtifactPathOverrides ?? createBuildArtifactPathOverridesDefault;
  const preflightBuildArtifacts = options.preflightBuildArtifacts ?? preflightBuildArtifactsDefault;
  const buildTokenArtifacts = options.buildTokenArtifacts ?? buildTokenArtifactsDefault;
  const getBuildArtifacts = options.getBuildArtifacts ?? getBuildArtifactsDefault;
  const getBuildWriteTargets = options.getBuildWriteTargets ?? getBuildWriteTargetsDefault;

  const tempDir = createTempDir();
  try {
    const buildOverrides = createBuildArtifactPathOverrides(tempDir);
    const pathDiagnostics = preflightBuildArtifacts({
      artifacts: getBuildWriteTargets(buildOverrides),
    });
    if (pathDiagnostics.length > 0) {
      return { ok: false, diagnostics: pathDiagnostics };
    }

    await buildTokenArtifacts(buildOverrides);

    const stagedArtifacts = new Map(
      getBuildArtifacts(buildOverrides).map((artifact) => [artifact.id, artifact])
    );
    const staleArtifacts = committedArtifacts.filter((artifact) =>
      isArtifactStale(artifact, stagedArtifacts.get(artifact.id))
    );

    if (staleArtifacts.length > 0) {
      return { ok: false, diagnostics: createFreshnessDiagnostics({ staleArtifacts }) };
    }

    return { ok: true, diagnostics: [] };
  } finally {
    removeTempDir(tempDir);
  }
}

export function createFreshnessDiagnostics(options = {}) {
  return [
    ...sortArtifactsByRelPath(options.missingArtifacts ?? []).map((artifact) =>
      createFreshnessDiagnostic(
        artifact,
        'GENERATED_ARTIFACT_MISSING',
        'required artifact is missing'
      )
    ),
    ...sortArtifactsByRelPath(options.staleArtifacts ?? []).map((artifact) =>
      createFreshnessDiagnostic(
        artifact,
        'GENERATED_ARTIFACT_STALE',
        'artifact differs from regenerated output'
      )
    ),
  ];
}

export function sortArtifactsByRelPath(artifacts) {
  return [...artifacts].sort((left, right) => left.relPath.localeCompare(right.relPath));
}

function isArtifactStale(committedArtifact, stagedArtifact) {
  if (!stagedArtifact || !fs.existsSync(stagedArtifact.absPath)) {
    throw new Error(`staged artifact missing after build: ${committedArtifact.relPath}`);
  }

  const committedContents = fs.readFileSync(committedArtifact.absPath);
  const stagedContents = fs.readFileSync(stagedArtifact.absPath);
  return Buffer.compare(committedContents, stagedContents) !== 0;
}

function createFreshnessDiagnostic(artifact, code, message) {
  return {
    severity: 'error',
    code,
    message,
    path: artifact.relPath,
    rule: getArtifactContractRule(artifact.id),
  };
}

function defaultCreateTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'collider-token-artifacts-'));
}

function defaultRemoveTempDir(tempDir) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
