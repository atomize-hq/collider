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

      // Pre-load all variables and default modes for alias resolution.
      const allVariablesById = new Map<string, Variable>();
      const defaultModeByCollectionId = new Map<string, string>();
      for (const collection of collections) {
        defaultModeByCollectionId.set(collection.id, collection.defaultModeId);
        for (const id of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(id);
          if (variable) allVariablesById.set(id, variable);
        }
      }

      // _strings is a primitive lookup source only — don't write it as a token file.
      const skipCollectionNames = new Set(['_strings']);

      const pulledCollections: PulledCollection[] = [];
      for (const collection of collections) {
        if (skipCollectionNames.has(collection.name)) continue;
        const variables: PulledVariable[] = [];
        for (const id of collection.variableIds) {
          const variable = allVariablesById.get(id);
          if (!variable) continue;
          const rawValue = variable.valuesByMode[collection.defaultModeId];
          if (rawValue === undefined) continue;
          const resolvedValue = resolveVariableAlias(
            rawValue,
            allVariablesById,
            defaultModeByCollectionId
          );
          if (resolvedValue === undefined) continue;
          variables.push({
            name: variable.name,
            resolvedType: variable.resolvedType as PulledVariable['resolvedType'],
            value: resolvedValue as PulledVariableValue,
          });
        }
        pulledCollections.push({ name: collection.name, variables });
      }

      const dtcg = buildDtcgFromFigmaVariables(pulledCollections);
      const summaryParts = pulledCollections.map(
        (col) => `${toCollectionKey(col.name)}: ${col.variables.length}`
      );

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

      // Upsert semantics: preserve the collection and existing VariableIDs so that
      // paint bindings on components in this file survive re-syncs. Repo remains
      // canonical for token *values*; Figma's variable *identity* is durable.
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      let collection = collections.find((entry) => entry.name === collectionName);
      if (!collection) {
        collection = figma.variables.createVariableCollection(collectionName);
      }

      const defaultMode = collection.modes.find(
        (entry) => entry.modeId === collection!.defaultModeId
      );
      if (defaultMode && defaultMode.name !== modeName) {
        collection.renameMode(defaultMode.modeId, modeName);
      }
      const baseModeId = collection.defaultModeId;

      const existingByName = new Map<string, Variable>();
      for (const id of collection.variableIds) {
        const variable = await figma.variables.getVariableByIdAsync(id);
        if (variable) {
          existingByName.set(variable.name, variable);
        }
      }

      const toRemove: Variable[] = [];
      for (const [name, variable] of existingByName) {
        if (!desiredByName.has(name)) {
          toRemove.push(variable);
        }
      }
      // Figma variables cannot change resolvedType in place — queue mismatches
      // for removal so the upsert pass below recreates them cleanly.
      for (const entry of desired) {
        const existing = existingByName.get(entry.name);
        if (existing && existing.resolvedType !== entry.resolvedType) {
          toRemove.push(existing);
          existingByName.delete(entry.name);
        }
      }
      for (const variable of toRemove) {
        variable.remove();
      }

      for (const entry of desired) {
        let variable = existingByName.get(entry.name);
        if (!variable) {
          variable = figma.variables.createVariable(entry.name, collection, entry.resolvedType);
        }
        variable.setValueForMode(baseModeId, entry.value as PluginVariableValue);
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

function resolveVariableAlias(
  value: unknown,
  allVariablesById: Map<string, Variable>,
  defaultModeByCollectionId: Map<string, string>,
  depth = 0
): unknown {
  if (depth > 10) return undefined;
  if (
    value !== null &&
    typeof value === 'object' &&
    (value as Record<string, unknown>)['type'] === 'VARIABLE_ALIAS'
  ) {
    const alias = value as { type: 'VARIABLE_ALIAS'; id: string };
    const referenced = allVariablesById.get(alias.id);
    if (!referenced) return undefined;
    const modeId = defaultModeByCollectionId.get(referenced.variableCollectionId);
    if (!modeId) return undefined;
    return resolveVariableAlias(
      referenced.valuesByMode[modeId],
      allVariablesById,
      defaultModeByCollectionId,
      depth + 1
    );
  }
  return value;
}
