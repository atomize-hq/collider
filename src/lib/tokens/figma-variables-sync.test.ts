import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../../../design-tokens/build/paths.mjs';
import {
  defaultFigmaVariablesSyncConfigPath,
  flattenTokenDocument,
  hardenedCollectionName,
  hardenedCredentialModel,
  hardenedPublishMode,
  runFigmaVariablesSync,
} from '../../../scripts/lib/figma-variables-sync.mjs';

const artifactPath = path.join(repoRoot, 'design-tokens/dist/figma/tokens.json');
const configPath = path.join(repoRoot, defaultFigmaVariablesSyncConfigPath);

type LocalVariable = {
  id: string;
  name: string;
  resolvedType: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING';
  valuesByMode: Record<string, unknown>;
};

type LocalCollection = {
  defaultModeId: string;
  id: string;
  modes: Array<{ modeId: string; name: string }>;
  name: string;
  variableIds: string[];
  variables: Record<string, LocalVariable>;
};

describe('flattenTokenDocument', () => {
  it('produces a deterministic sorted leaf list from the token artifact', () => {
    const tokens = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const leaves = flattenTokenDocument(tokens);

    expect(leaves).toHaveLength(40);
    expect(leaves[0]?.name).toBe('core/color/amber/300');
    expect(leaves[0]?.resolvedType).toBe('COLOR');
    expect(leaves.at(-1)?.name).toBe('semantic/color/text/warning');
  });
});

describe('runFigmaVariablesSync', () => {
  it('writes the hardened rail, verifies it, and remains deterministic on a rerun', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-figma-sync-'));
    const ledgerPath = path.join(tempDir, 'sync-ledger.json');
    const revision = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    fs.writeFileSync(
      ledgerPath,
      JSON.stringify(
        createLedgerFixture({ revision, figmaFile: 'figma://file/test-file' }),
        null,
        2
      )
    );

    const api = createFigmaApiMock();
    const firstRun = await runFigmaVariablesSync({
      configPath,
      env: { FIGMA_OAUTH_ACCESS_TOKEN: 'oauth-token' },
      fetch: api.fetch,
      ledgerPath,
      now: () => new Date('2026-03-21T12:00:00Z'),
      readJson: (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8')),
      resolveArtifactRevision: () => revision,
      sleep: async () => {},
      writeJson: (filePath: string, value: unknown) => {
        fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
      },
    });

    const secondRun = await runFigmaVariablesSync({
      configPath,
      env: { FIGMA_OAUTH_ACCESS_TOKEN: 'oauth-token' },
      fetch: api.fetch,
      ledgerPath,
      now: () => new Date('2026-03-21T12:05:00Z'),
      readJson: (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8')),
      resolveArtifactRevision: () => revision,
      sleep: async () => {},
      writeJson: (filePath: string, value: unknown) => {
        fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
      },
    });

    expect(firstRun.ok).toBe(true);
    expect(secondRun.ok).toBe(true);
    if (!firstRun.ok || !secondRun.ok) {
      throw new Error('expected both hardened sync runs to succeed');
    }

    const firstRunPlan = firstRun.plan as {
      requestBody: {
        variableCollections: Array<{ action?: string }>;
      };
    };
    const secondRunPlan = secondRun.plan as {
      requestBody: {
        variableCollections: Array<{ action?: string }>;
      };
    };

    expect(firstRunPlan.requestBody.variableCollections[0]?.action).toBe('CREATE');
    expect(secondRunPlan.requestBody.variableCollections[0]?.action).toBe('DELETE');
    expect(firstRun.verification).toEqual({
      collectionCount: 1,
      determinismVerified: true,
      variableCount: 40,
    });
    expect(secondRun.verification).toEqual(firstRun.verification);

    const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) as {
      publish: {
        lastHardenedRunStatus: string;
        mode: string;
        oauthCredentialModel: string;
        successMarkers: {
          collectionCount: number;
          determinismVerified: boolean;
          variableCount: number;
        };
      };
      verification: { materializationStatus: string; lastVerifiedRevision: string };
    };

    expect(ledger.publish.mode).toBe(hardenedPublishMode);
    expect(ledger.publish.oauthCredentialModel).toBe(hardenedCredentialModel);
    expect(ledger.publish.lastHardenedRunStatus).toBe('passed');
    expect(ledger.publish.successMarkers).toEqual({
      collectionCount: 1,
      determinismVerified: true,
      variableCount: 40,
    });
    expect(ledger.verification.materializationStatus).toBe('passed');
    expect(ledger.verification.lastVerifiedRevision).toBe(revision);
    expect(api.postBodies).toHaveLength(2);
    const secondPostBody = api.postBodies[1] as {
      variableCollections?: Array<{ action?: string }>;
    };
    expect(secondPostBody.variableCollections?.[0]?.action).toBe('DELETE');
  });

  it('writes a blocking auth failure to the ledger when no OAuth token is configured', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collider-figma-sync-failure-'));
    const ledgerPath = path.join(tempDir, 'sync-ledger.json');
    const revision = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    fs.writeFileSync(
      ledgerPath,
      JSON.stringify(
        createLedgerFixture({ revision, figmaFile: 'figma://file/test-file' }),
        null,
        2
      )
    );

    const result = await runFigmaVariablesSync({
      configPath,
      env: {},
      ledgerPath,
      now: () => new Date('2026-03-21T12:10:00Z'),
      readJson: (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8')),
      resolveArtifactRevision: () => revision,
      sleep: async () => {},
      writeJson: (filePath: string, value: unknown) => {
        fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('expected auth failure');
    }

    const failureError = result.error as { phase: string };
    expect(failureError.phase).toBe('auth');
    expect(result.ledger.publish.mode).toBe(hardenedPublishMode);
    expect(result.ledger.publish.lastHardenedRunStatus).toBe('failed');
    expect(result.ledger.publish.oauthCredentialModel).toBe(hardenedCredentialModel);
    expect(result.ledger.publish.successMarkers).toBeUndefined();
    expect(result.ledger.verification.materializationStatus).toBe('failed');
    expect(result.ledger.exceptions[0]?.code).toBe('figma-hardened-variables-auth-failed');
  });
});

describe('hardened rail package contract', () => {
  it('exposes the figma:sync:variables entrypoint and just recipe', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    const justfile = fs.readFileSync(path.join(repoRoot, 'justfile'), 'utf8');

    expect(packageJson.scripts?.['figma:sync:variables']).toBe(
      'node scripts/figma-variables-sync.mjs'
    );
    expect(justfile).toContain('figma-sync-variables:');
    expect(justfile).toContain('pnpm figma:sync:variables');
  });
});

function createLedgerFixture({ revision, figmaFile }: { revision: string; figmaFile: string }) {
  return {
    ledgerVersion: '2',
    artifact: {
      path: 'design-tokens/dist/figma/tokens.json',
      revision,
    },
    publish: {
      figmaFile,
      mode: 'plugin-import-manual',
      tokensStudioCarrier: false,
    },
    verification: {
      lastVerifiedRevision: revision,
      materializationStatus: 'passed',
    },
    promotion: {
      highestEarnedLevel: 'D-publish-valid',
      parityDeferredReason:
        'Parity remains deferred because the release-governed promotion gate is not yet in place for Collider.',
      parityMode: 'deferred',
    },
    exceptions: [],
  };
}

function createFigmaApiMock() {
  const state = {
    collectionCounter: 0,
    currentCollection: null as LocalCollection | null,
    postBodies: [] as Array<Record<string, unknown>>,
  };

  return {
    fetch: async (url: string, options: { body?: string; method?: string }) => {
      const method = options.method ?? 'GET';
      if (method === 'GET' && url.endsWith('/variables/local')) {
        return jsonResponse(buildLocalVariablesPayload(state.currentCollection));
      }

      if (method === 'POST' && url.endsWith('/variables')) {
        const body = JSON.parse(options.body ?? '{}') as {
          variableCollections?: Array<{ action: string; id: string; name?: string }>;
          variableModeValues?: Array<{
            modeId: string;
            value: unknown;
            variableId: string;
          }>;
          variables?: Array<{
            id: string;
            name: string;
            resolvedType: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING';
          }>;
        };

        state.postBodies.push(body as Record<string, unknown>);

        if (body.variableCollections?.some((entry) => entry.action === 'DELETE')) {
          state.currentCollection = null;
        }

        const collectionId = `collection-${++state.collectionCounter}`;
        const modeId = `mode-${state.collectionCounter}`;
        const variables: Record<
          string,
          {
            id: string;
            name: string;
            resolvedType: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING';
            valuesByMode: Record<string, unknown>;
          }
        > = {};

        const tempIdToRealId: Record<string, string> = {};
        for (const collectionChange of body.variableCollections ?? []) {
          if (collectionChange.action === 'CREATE') {
            tempIdToRealId[collectionChange.id] = collectionId;
          }
        }
        tempIdToRealId.temp_hardened_mode = modeId;

        for (const variableChange of body.variables ?? []) {
          const realId = `variable-${Object.keys(variables).length + 1}-${state.collectionCounter}`;
          tempIdToRealId[variableChange.id] = realId;
          variables[realId] = {
            id: realId,
            name: variableChange.name,
            resolvedType: variableChange.resolvedType,
            valuesByMode: {},
          };
        }

        for (const modeValue of body.variableModeValues ?? []) {
          const variableId = tempIdToRealId[modeValue.variableId];
          if (variableId && variables[variableId]) {
            variables[variableId].valuesByMode[modeId] = modeValue.value;
          }
        }

        state.currentCollection = {
          defaultModeId: modeId,
          id: collectionId,
          modes: [{ modeId, name: 'Base' }],
          name: hardenedCollectionName,
          variableIds: Object.keys(variables),
          variables,
        };

        return jsonResponse({
          meta: {
            tempIdToRealId,
          },
        });
      }

      throw new Error(`Unexpected request in test mock: ${method} ${url}`);
    },
    postBodies: state.postBodies,
  };
}

function buildLocalVariablesPayload(collection: LocalCollection | null) {
  if (!collection) {
    return {
      meta: {
        variableCollections: {},
        variables: {},
      },
    };
  }

  return {
    meta: {
      variableCollections: {
        [collection.id]: {
          defaultModeId: collection.defaultModeId,
          id: collection.id,
          modes: collection.modes,
          name: collection.name,
          variableIds: collection.variableIds,
        },
      },
      variables: Object.fromEntries(
        Object.entries(collection.variables).map(([id, variable]) => [id, variable])
      ),
    },
  };
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(payload),
  };
}
