import fs from 'node:fs';
import path from 'node:path';
import {
  buildWriteTargets,
  repoRoot as defaultRepoRoot,
} from '../../design-tokens/build/paths.mjs';

export function preflightBuildArtifacts(options = {}) {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const artifacts = options.artifacts ?? buildWriteTargets;
  const diagnostics = [];
  const seenIds = new Set();
  const seenPaths = new Set();

  for (const artifact of artifacts) {
    if (!artifact?.id || !artifact?.relPath || !artifact?.absPath || !artifact?.kind) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact?.relPath,
          'ARTIFACT_MANIFEST_INVALID',
          'artifact manifest entries require id, kind, relPath, and absPath'
        )
      );
      continue;
    }

    if (seenIds.has(artifact.id) || seenPaths.has(artifact.relPath)) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact.relPath,
          'ARTIFACT_MANIFEST_INVALID',
          `duplicate artifact manifest entry "${artifact.id}"`
        )
      );
      continue;
    }
    seenIds.add(artifact.id);
    seenPaths.add(artifact.relPath);

    const fileStat = statIfExists(artifact.absPath);
    if (fileStat?.isDirectory()) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact.relPath,
          'ARTIFACT_PATH_UNWRITABLE',
          'artifact destination points to a directory'
        )
      );
      continue;
    }
    if (fileStat && !isWritable(artifact.absPath)) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact.relPath,
          'ARTIFACT_PATH_UNWRITABLE',
          'artifact destination is not writable'
        )
      );
      continue;
    }

    const parentResult = nearestExistingAncestor(path.dirname(artifact.absPath));
    if (!parentResult.path) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact.relPath,
          'ARTIFACT_PATH_UNWRITABLE',
          'artifact destination has no writable ancestor'
        )
      );
      continue;
    }
    if (!parentResult.stat.isDirectory()) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact.relPath,
          'ARTIFACT_PATH_UNWRITABLE',
          'artifact parent resolves through a file path'
        )
      );
      continue;
    }
    if (!isWritable(parentResult.path)) {
      diagnostics.push(
        createDiagnostic(
          repoRoot,
          artifact.relPath,
          'ARTIFACT_PATH_UNWRITABLE',
          'artifact parent directory is not writable'
        )
      );
    }
  }

  return diagnostics;
}

function nearestExistingAncestor(startPath) {
  let current = startPath;
  while (current && !fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return { path: current, stat: current ? fs.statSync(current) : null };
}

function statIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath) : null;
}

function isWritable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function createDiagnostic(repoRoot, filePath, code, message) {
  return {
    severity: 'error',
    code,
    message,
    path: path.relative(repoRoot, filePath).replaceAll(path.sep, '/'),
    rule: 'CT-5',
  };
}
