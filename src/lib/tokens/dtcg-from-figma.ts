/**
 * Inverse of flattenTokenDocument in figma-token-mapping.ts.
 * Converts Figma variable collections back to nested DTCG JSON documents.
 */

export type PulledVariableResolvedType = 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';

export type PulledColorValue = { r: number; g: number; b: number; a?: number };

export type PulledVariableValue = PulledColorValue | number | string | boolean;

export type PulledVariable = {
  name: string; // Figma variable name, e.g. "color/background/base"
  resolvedType: PulledVariableResolvedType;
  value: PulledVariableValue; // Value from the default mode
};

export type PulledCollection = {
  name: string; // Figma collection name, e.g. "Collider Tokens"
  variables: PulledVariable[];
};

/**
 * Convert a list of Figma variable collections to a map of DTCG token documents,
 * keyed by a slug derived from the collection name.
 *
 * Example: collection "Collider Tokens" → key "collider-tokens"
 * Variable name "color/background/base" with COLOR value → nested DTCG leaf.
 */
export function buildDtcgFromFigmaVariables(
  collections: PulledCollection[]
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {};

  for (const collection of collections) {
    const key = toCollectionKey(collection.name);
    result[key] = buildCollectionTree(collection.variables);
  }

  return result;
}

export function toCollectionKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildCollectionTree(variables: PulledVariable[]): Record<string, unknown> {
  const tree: Record<string, unknown> = {};

  for (const variable of variables) {
    const segments = variable.name.split('/').filter(Boolean);
    if (segments.length === 0) continue;

    const leaf = convertVariableToLeaf(variable);
    setNestedPath(tree, segments, leaf);
  }

  return tree;
}

function convertVariableToLeaf(variable: PulledVariable): { $type: string; $value: unknown } {
  switch (variable.resolvedType) {
    case 'COLOR': {
      const color = variable.value as PulledColorValue;
      return { $type: 'color', $value: figmaColorToHex(color) };
    }
    case 'FLOAT': {
      const num = variable.value as number;
      const nameLower = variable.name.toLowerCase();
      if (nameLower.includes('duration')) {
        return { $type: 'duration', $value: `${num}ms` };
      }
      if (nameLower.includes('weight') || nameLower.includes('opacity')) {
        return { $type: 'number', $value: num };
      }
      return { $type: 'dimension', $value: `${num}px` };
    }
    case 'STRING':
      return { $type: 'string', $value: variable.value as string };
    case 'BOOLEAN':
      return { $type: 'boolean', $value: variable.value as boolean };
    default: {
      const exhaustive: never = variable.resolvedType;
      throw new Error(`Unsupported Figma variable resolvedType: ${String(exhaustive)}`);
    }
  }
}

function setNestedPath(
  obj: Record<string, unknown>,
  segments: string[],
  leaf: { $type: string; $value: unknown }
): void {
  let current = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]!;
    if (typeof current[seg] !== 'object' || current[seg] === null) {
      current[seg] = {};
    }
    current = current[seg] as Record<string, unknown>;
  }
  const lastSeg = segments[segments.length - 1]!;
  current[lastSeg] = leaf;
}

function figmaColorToHex(color: PulledColorValue): string {
  const r = toHexChannel(color.r);
  const g = toHexChannel(color.g);
  const b = toHexChannel(color.b);
  const a = color.a ?? 1;
  if (a >= 1 - 1 / 510) {
    return `#${r}${g}${b}`;
  }
  return `#${r}${g}${b}${toHexChannel(a)}`;
}

function toHexChannel(value: number): string {
  return Math.round(Math.max(0, Math.min(1, value)) * 255)
    .toString(16)
    .padStart(2, '0');
}
