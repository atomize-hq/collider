import { chromaticReviewJobName } from './chromatic-review-command.mjs';

export const chromaticStatusArtifactPath = 'artifacts/chromatic/status.json';

export function normalizeChromaticStatus(input) {
  const {
    branch,
    revision,
    proofInventory,
    build,
    review,
    providerResult,
    generatedAt = new Date().toISOString(),
  } = input;

  return {
    statusVersion: '0',
    branch,
    revision,
    proofInventory: cloneProofInventory(proofInventory),
    build: {
      ...build,
      provider: normalizeProviderResult(providerResult),
    },
    review: cloneReview(review),
    check: {
      name: chromaticReviewJobName,
    },
    generatedAt,
  };
}

function normalizeProviderResult(providerResult = {}) {
  return {
    status: providerResult.status ?? 'unknown',
    buildUrl: providerResult.buildUrl ?? null,
    changeCount: providerResult.changeCount ?? null,
  };
}

function cloneProofInventory(proofInventory) {
  return {
    ...proofInventory,
    selectedComponentIds: [...(proofInventory?.selectedComponentIds ?? [])],
    selectedStoryIds: [...(proofInventory?.selectedStoryIds ?? [])],
  };
}

function cloneReview(review) {
  return {
    ...review,
    scope: {
      ...(review?.scope ?? {}),
      componentIds: [...(review?.scope?.componentIds ?? [])],
      storyIds: [...(review?.scope?.storyIds ?? [])],
    },
  };
}
