import { describe, expect, it } from 'vitest';
import { createFreshnessDiagnostics } from '../../../scripts/lib/token-artifact-freshness.mjs';

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
