import fs from 'node:fs/promises';
import path from 'node:path';

import { chromaticReviewJobName } from './chromatic-review-command.mjs';

export const chromaticStatusArtifactPath = 'artifacts/chromatic/status.json';
export const chromaticStatusVersion = '1';

export function normalizeChromaticStatus(input) {
  return {
    statusVersion: chromaticStatusVersion,
    branch: {
      name: input.branchName,
    },
    revision: {
      gitSha: input.gitSha,
    },
    proofInventory: {
      inventoryVersion: input.proofInventory.inventoryVersion,
      path: input.proofInventory.path,
      selectedComponentIds: [...input.proofInventory.selectedComponentIds],
      selectedStoryIds: [...input.proofInventory.selectedStoryIds],
    },
    build: {
      url: input.buildUrl,
    },
    review: {
      diffOutcome: input.diffOutcome,
      mode: input.reviewMode,
      requiredForClaim: input.requiredForClaim,
      scope: {
        componentIds: [...input.reviewScope.componentIds],
        componentTiers: { ...input.reviewScope.componentTiers },
        storyIds: [...input.reviewScope.storyIds],
      },
    },
    check: {
      conclusion: input.checkConclusion,
      name: chromaticReviewJobName,
    },
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}

export async function writeChromaticStatus(status, artifactPath = chromaticStatusArtifactPath) {
  const absArtifactPath = path.resolve(artifactPath);
  await fs.mkdir(path.dirname(absArtifactPath), { recursive: true });
  await fs.writeFile(absArtifactPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  return absArtifactPath;
}

export async function readChromaticDiagnosticsFile(diagnosticsPath) {
  if (!diagnosticsPath) {
    return null;
  }

  try {
    return JSON.parse(await fs.readFile(path.resolve(diagnosticsPath), 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export function resolveChromaticBuildUrl({ diagnostics, providerResult }) {
  const candidates = [
    diagnostics?.build?.webUrl,
    diagnostics?.build?.url,
    diagnostics?.rebuildForBuild?.webUrl,
    diagnostics?.rebuildForBuild?.url,
    diagnostics?.buildUrl,
    diagnostics?.url,
    providerResult?.buildUrl,
    providerResult?.url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }

  return null;
}
