import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  loadAndValidatePublishProof,
  publishProofUsage,
} from '../../../scripts/lib/publish-proof.mjs';

const publishProofFixtureDir = path.join(repoRoot, 'scripts/fixtures/publish-proof');

describe('loadAndValidatePublishProof', () => {
  it('accepts the happy-path plugin-import-manual fixture', () => {
    const result = loadAndValidatePublishProof(
      fixturePath('valid-plugin-import-manual.publish-proof.json')
    );

    expect(result.errors).toEqual([]);
    expect(result.data.mode).toBe('plugin-import-manual');
  });

  it('accepts the committed hardened proof record', () => {
    const result = loadAndValidatePublishProof(path.join(repoRoot, 'src/figma/publish-proof.json'));

    expect(result.errors).toEqual([]);
    expect(result.data.mode).toBe('plugin-import-manual');
    expect(result.data.materialization.status).toBe('passed');
  });

  it('reports a missing artifact git sha', () => {
    const result = loadAndValidatePublishProof(
      fixturePath('invalid-missing-artifact-git-sha.publish-proof.json')
    );

    expect(result.errors).toContain(
      '[CT-7B_PUBLISH_PROOF_MISSING_REQUIRED_KEY] artifact.gitSha is required'
    );
  });

  it('reports a missing destination figma file', () => {
    const result = loadAndValidatePublishProof(
      fixturePath('invalid-missing-destination.publish-proof.json')
    );

    expect(result.errors).toContain(
      '[CT-7B_PUBLISH_PROOF_MISSING_REQUIRED_KEY] destination.figmaFile is required'
    );
  });

  it('reports invalid carrier metadata', () => {
    const result = loadAndValidatePublishProof(
      fixturePath('invalid-carrier-metadata.publish-proof.json')
    );

    expect(result.errors).toContain(
      '[CT-7B_PUBLISH_PROOF_FORBIDDEN_CARRIER_REASON] carrier.reason must be null when carrier.used is false'
    );
  });
});

describe('publish proof package contract', () => {
  it('exposes the seam-owned validate:publish-proof entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['validate:publish-proof']).toBe(
      'node scripts/validate-publish-proof.mjs'
    );
  });

  it('keeps the CLI usage stable', () => {
    expect(publishProofUsage).toBe(
      'Usage: node scripts/validate-publish-proof.mjs [path-to-publish-proof.json]'
    );
  });
});

function fixturePath(name: string) {
  return path.join(publishProofFixtureDir, name);
}
