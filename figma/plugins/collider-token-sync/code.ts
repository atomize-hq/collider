/// <reference types="@figma/plugin-typings" />

import { flattenTokenDocument } from '../../../src/lib/tokens/figma-token-mapping';
import {
  buildDtcgFromFigmaVariables,
  toCollectionKey,
  type PulledCollection,
  type PulledVariable,
  type PulledVariableValue,
} from '../../../src/lib/tokens/dtcg-from-figma';

declare const __html__: string;

type UiToPluginMessage =
  | { type: 'UI_READY' }
  | { type: 'FETCH_URL'; url: string }
  | { type: 'SYNC'; jsonText: string }
  | { type: 'PULL' };

const defaultArtifactUrl = 'http://localhost:4173/design-tokens/dist/figma/tokens.json';
const collectionName = 'Collider Tokens';
const modeName = 'Base';

figma.showUI(__html__, { width: 420, height: 520 });

figma.ui.onmessage = async (msg: UiToPluginMessage) => {
  if (!msg || typeof msg.type !== 'string') return;

  if (msg.type === 'UI_READY') {
    figma.ui.postMessage({ type: 'DEFAULT_URL', url: defaultArtifactUrl });
    return;
  }

  if (msg.type === 'FETCH_URL') {
    const url = typeof msg.url === 'string' && msg.url.length > 0 ? msg.url : defaultArtifactUrl;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching ${url}`);
      }
      const jsonText = await response.text();
      figma.ui.postMessage({ type: 'FETCH_OK', jsonText, byteCount: jsonText.length });
    } catch (error) {
      figma.ui.postMessage({
        type: 'FETCH_ERROR',
        message: `Failed to fetch artifact: ${messageForError(error)}`,
      });
    }
    return;
  }

  if (msg.type === 'PULL') {
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();

      const pulledCollections: PulledCollection[] = [];
      for (const collection of collections) {
        const variables: PulledVariable[] = [];
        for (const id of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(id);
          if (!variable) continue;
          const value = variable.valuesByMode[collection.defaultModeId];
          if (value === undefined) continue;
          variables.push({
            name: variable.name,
            resolvedType: variable.resolvedType as PulledVariable['resolvedType'],
            value: value as PulledVariableValue,
          });
        }
        pulledCollections.push({ name: collection.name, variables });
      }

      const dtcg = buildDtcgFromFigmaVariables(pulledCollections);
      const summaryParts: string[] = [];
      for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        const pulled = pulledCollections[i];
        if (col && pulled) {
          summaryParts.push(`${toCollectionKey(col.name)}: ${pulled.variables.length}`);
        }
      }

      figma.ui.postMessage({
        type: 'PULL_RESULT',
        dtcgJson: JSON.stringify(dtcg),
        summary: summaryParts.join(', '),
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'PULL_ERROR',
        message: `Pull failed: ${messageForError(error)}`,
      });
    }
    return;
  }

  if (msg.type === 'SYNC') {
    const startedAt = new Date().toISOString();
    try {
      const payload = JSON.parse(msg.jsonText);
      const desired = flattenTokenDocument(payload);
      const desiredByName = new Map(desired.map((entry) => [entry.name, entry]));

      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const existing = collections.find((entry) => entry.name === collectionName);
      if (existing) {
        try {
          existing.remove();
        } catch (error) {
          throw new Error(
            `Cannot remove existing variable collection "${collectionName}". It may be remote/published. Use a copy/pilot file or rename the collection. (${messageForError(
              error
            )})`
          );
        }
      }

      const collection = figma.variables.createVariableCollection(collectionName);
      if (collection.modes.length > 0) {
        collection.renameMode(collection.modes[0].modeId, modeName);
      }
      const baseModeId = collection.defaultModeId;

      for (const variable of desired) {
        const created = figma.variables.createVariable(
          variable.name,
          collection,
          variable.resolvedType
        );
        created.setValueForMode(baseModeId, variable.value as PluginVariableValue);
      }

      const verifyCollections = await figma.variables.getLocalVariableCollectionsAsync();
      const verifyCollection = verifyCollections.find((entry) => entry.name === collectionName);
      if (!verifyCollection) {
        throw new Error(`Verification failed: collection "${collectionName}" not found after sync`);
      }
      if (verifyCollection.variableIds.length !== desired.length) {
        throw new Error(
          `Verification failed: expected ${desired.length} variables, found ${verifyCollection.variableIds.length}`
        );
      }

      const foundByName = new Map<string, Variable>();
      for (const id of verifyCollection.variableIds) {
        const resolved = await figma.variables.getVariableByIdAsync(id);
        if (resolved) {
          foundByName.set(resolved.name, resolved);
        }
      }

      const missing = desired
        .filter((entry) => !foundByName.has(entry.name))
        .map((entry) => entry.name);
      if (missing.length > 0) {
        throw new Error(
          `Verification failed: missing variables (${missing.length}): ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', …' : ''}`
        );
      }

      const unexpected = [...foundByName.keys()].filter((name) => !desiredByName.has(name));
      if (unexpected.length > 0) {
        throw new Error(
          `Verification failed: unexpected variables (${unexpected.length}): ${unexpected.slice(0, 5).join(', ')}${unexpected.length > 5 ? ', …' : ''}`
        );
      }

      for (const expected of desired) {
        const actual = foundByName.get(expected.name);
        if (!actual) continue;

        if (actual.resolvedType !== expected.resolvedType) {
          throw new Error(
            `Verification failed: variable ${expected.name} has resolvedType=${actual.resolvedType} (expected ${expected.resolvedType})`
          );
        }

        const actualValue = actual.valuesByMode[baseModeId] as unknown;
        if (!valuesEqual(expected.value, actualValue)) {
          throw new Error(`Verification failed: variable ${expected.name} value does not match`);
        }
      }

      figma.ui.postMessage({
        type: 'SYNC_REPORT',
        ok: true,
        report: [
          'Collider Token Sync: SUCCESS',
          `startedAt=${startedAt}`,
          `finishedAt=${new Date().toISOString()}`,
          `collection=${collectionName}`,
          `mode=${modeName}`,
          `variables=${desired.length}`,
        ].join('\n'),
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'SYNC_REPORT',
        ok: false,
        report: [
          'Collider Token Sync: FAILED',
          `startedAt=${startedAt}`,
          `finishedAt=${new Date().toISOString()}`,
          `error=${messageForError(error)}`,
        ].join('\n'),
      });
    }
    return;
  }
};

function messageForError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

type PluginVariableValue =
  | string
  | number
  | boolean
  | { r: number; g: number; b: number; a?: number };

function valuesEqual(expected: unknown, actual: unknown) {
  if (typeof expected === 'number' && typeof actual === 'number') {
    return Object.is(expected, actual);
  }

  if (typeof expected === 'string' && typeof actual === 'string') {
    return expected === actual;
  }

  if (typeof expected === 'boolean' && typeof actual === 'boolean') {
    return expected === actual;
  }

  if (isRgba(expected) && isRgba(actual)) {
    return (
      closeTo(expected.r, actual.r) &&
      closeTo(expected.g, actual.g) &&
      closeTo(expected.b, actual.b) &&
      closeTo(expected.a ?? 1, actual.a ?? 1)
    );
  }

  return false;
}

function isRgba(value: unknown): value is { r: number; g: number; b: number; a?: number } {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Record<string, unknown>;
  return (
    typeof maybe.r === 'number' &&
    typeof maybe.g === 'number' &&
    typeof maybe.b === 'number' &&
    (maybe.a === undefined || typeof maybe.a === 'number')
  );
}

function closeTo(left: number, right: number) {
  return Math.abs(left - right) < 1e-6;
}
