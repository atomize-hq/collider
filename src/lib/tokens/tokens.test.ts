import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, it } from 'vitest';
import {
  distRoot,
  generatedFileBanner,
  repoRoot,
  runtimeCssPath,
  runtimeInventoryPath,
  toRepoRelative,
} from '../../../design-tokens/build/paths.mjs';

type RuntimeInventory = {
  entries: Array<{ legacyVar: string }>;
};

beforeAll(() => {
  const readinessErrors = getReadinessErrors();
  if (readinessErrors.length > 0) {
    throw new Error(`S3c readiness gate failed:\n${readinessErrors.join('\n')}`);
  }

  runBuildTokens();
});

describe('runtime token proof', () => {
  it('keeps every required legacy runtime variable present in generated css', () => {
    const inventory = readInventory();
    const runtimeCss = readRuntimeCss();
    const declaredVariables = extractCustomPropertyNames(runtimeCss);
    const missingVariables = inventory.entries
      .map((entry) => entry.legacyVar)
      .filter((legacyVar) => !declaredVariables.has(legacyVar));

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing required legacy runtime variables:\n${missingVariables
          .map((legacyVar) => `- ${legacyVar}`)
          .join('\n')}`
      );
    }
  });

  it('keeps generated artifacts byte-stable on a second build', () => {
    const firstSnapshot = snapshotArtifacts();

    runBuildTokens();

    const secondSnapshot = snapshotArtifacts();
    const diff = diffSnapshots(firstSnapshot, secondSnapshot);
    if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
      return;
    }

    throw new Error(
      [
        'Generated artifact set changed after a second build.',
        formatDiffSection('Added', diff.added),
        formatDiffSection('Removed', diff.removed),
        formatDiffSection('Changed', diff.changed),
      ]
        .filter(Boolean)
        .join('\n')
    );
  });
});

function readInventory() {
  return JSON.parse(fs.readFileSync(runtimeInventoryPath, 'utf8')) as RuntimeInventory;
}

function readRuntimeCss() {
  return fs.readFileSync(runtimeCssPath, 'utf8');
}

function extractCustomPropertyNames(runtimeCss: string) {
  return new Set([...runtimeCss.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((match) => match[1]));
}

function listGeneratedArtifacts() {
  return [...new Set([...collectRegularFiles(distRoot), toRepoRelative(runtimeCssPath)])].sort(
    (left, right) => left.localeCompare(right)
  );
}

function snapshotArtifacts() {
  const artifactPaths = listGeneratedArtifacts();
  const missingArtifacts: string[] = [];
  const snapshot = new Map<string, Buffer>();

  for (const relPath of artifactPaths) {
    const absPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(absPath)) {
      missingArtifacts.push(relPath);
      continue;
    }

    const stat = fs.statSync(absPath);
    if (!stat.isFile()) {
      missingArtifacts.push(relPath);
      continue;
    }

    snapshot.set(relPath, fs.readFileSync(absPath));
  }

  if (missingArtifacts.length > 0) {
    throw new Error(
      `Required generated artifacts missing:\n${missingArtifacts
        .map((relPath) => `- ${relPath}`)
        .join('\n')}`
    );
  }

  return snapshot;
}

function runBuildTokens() {
  execFileSync('pnpm', ['build:tokens'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
}

function getReadinessErrors() {
  const errors: string[] = [];
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>;
  };

  if (!packageJson.scripts?.['build:tokens']) {
    errors.push('- package.json is missing the pnpm build:tokens entrypoint');
  }

  if (!fs.existsSync(runtimeCssPath)) {
    errors.push(`- required runtime css artifact is missing: ${toRepoRelative(runtimeCssPath)}`);
  } else if (!readRuntimeCss().startsWith(generatedFileBanner)) {
    errors.push(
      `- runtime css is not build-owned: ${toRepoRelative(runtimeCssPath)} does not start with the generated banner`
    );
  }

  if (!fs.existsSync(distRoot)) {
    errors.push(`- committed dist root is missing: ${toRepoRelative(distRoot)}`);
  } else if (collectRegularFiles(distRoot).length === 0) {
    errors.push(`- committed dist root is empty: ${toRepoRelative(distRoot)}`);
  }

  return errors;
}

function collectRegularFiles(root: string): string[] {
  const stack = [root];
  const files: string[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(toRepoRelative(entryPath));
      }
    }
  }

  return files;
}

function diffSnapshots(firstSnapshot: Map<string, Buffer>, secondSnapshot: Map<string, Buffer>) {
  const firstPaths = [...firstSnapshot.keys()].sort((left, right) => left.localeCompare(right));
  const secondPaths = [...secondSnapshot.keys()].sort((left, right) => left.localeCompare(right));

  const added = secondPaths.filter((relPath) => !firstSnapshot.has(relPath));
  const removed = firstPaths.filter((relPath) => !secondSnapshot.has(relPath));
  const changed = firstPaths.filter((relPath) => {
    const secondBuffer = secondSnapshot.get(relPath);
    return secondBuffer ? Buffer.compare(firstSnapshot.get(relPath)!, secondBuffer) !== 0 : false;
  });

  return { added, removed, changed };
}

function formatDiffSection(label: string, relPaths: string[]) {
  if (relPaths.length === 0) {
    return '';
  }

  return `${label}:\n${relPaths.map((relPath) => `- ${relPath}`).join('\n')}`;
}
