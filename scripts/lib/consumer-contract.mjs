// The API surface `src/components/ai-elements` depends on from `src/components/ui`,
// derived from source on every run rather than stored — a stored inventory always
// matches the code that generated it, so it can never fail.
//
// Two contracts, both of which a registry overwrite or a vintage migration can break
// silently, because neither shows up as a type error or a failing story:
//
//   exports  ai-elements imports a name the primitive no longer exports. `tsc` already
//            catches this — tsconfig includes every .ts/.tsx — so this check is a
//            named, remediation-carrying diagnostic rather than the only guard.
//   slots    a file styles `[data-slot=x]` that the OWNING component does not emit.
//            Nothing catches this: the selector simply never matches, and the layout
//            is quietly wrong.
//
// The slot rule is what `button-group.tsx` violated: it shipped with two rules aimed
// at `[data-slot=select-trigger]`, which only the v4 Select emits. Our pre-v4 Select
// declares no slots at all, so a Select inside a ButtonGroup never got its corners
// rounded and nothing anywhere reported it.

import fs from 'node:fs';
import path from 'node:path';

import { repoRoot } from '../../design-tokens/build/paths.mjs';

export const primitivesDir = 'src/components/ui';
export const consumersDir = 'src/components/ai-elements';
export const consumerContractUsage = 'Usage: pnpm validate:consumer-contract';

const SOURCE_FILE = /\.tsx?$/;
const NON_SOURCE = /\.(stories|test)\.tsx?$/;

export function listSourceFiles(absDir) {
  if (!fs.existsSync(absDir)) {
    return [];
  }
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => SOURCE_FILE.test(entry.name) && !NON_SOURCE.test(entry.name))
    .map((entry) => path.join(absDir, entry.name))
    .sort();
}

// Named exports, in the two shapes shadcn primitives actually use: a trailing
// `export { A, B }` list, and inline `export const|function|type|interface X`.
export function extractExports(source) {
  const names = new Set();

  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop();
      if (name) {
        names.add(name.trim());
      }
    }
  }
  for (const match of source.matchAll(
    /export\s+(?:declare\s+)?(?:const|function|class|type|interface)\s+([A-Za-z_$][\w$]*)/g
  )) {
    names.add(match[1]);
  }

  return names;
}

// Named imports from `@/components/ui/<primitive>`, keyed by primitive.
export function extractPrimitiveImports(source) {
  const byPrimitive = new Map();

  const pattern =
    /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@\/components\/ui\/([a-z0-9-]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const primitive = match[2];
    if (!byPrimitive.has(primitive)) {
      byPrimitive.set(primitive, new Set());
    }
    for (const part of match[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0];
      if (name) {
        byPrimitive.get(primitive).add(name.trim());
      }
    }
  }

  return byPrimitive;
}

// A slot is DECLARED by `data-slot="x"` and SELECTED by a Tailwind arbitrary variant
// (`[data-slot=x]`, `has-data-[slot=x]`, `data-[slot=x]`). Only the second needs the
// first to exist — and it must exist in the component that OWNS the name, not just
// somewhere in the tree. A global "is it declared anywhere" check goes green as soon
// as any file emits the string, which would let the migration's acceptance criterion
// be satisfied by the wrong component.
export function extractDeclaredSlots(source) {
  return new Set([...source.matchAll(/data-slot="([a-z0-9-]+)"/g)].map((match) => match[1]));
}

export function extractSelectedSlots(source) {
  const names = new Set();
  for (const match of source.matchAll(/\[data-slot=([a-z0-9-]+)\]/g)) {
    names.add(match[1]);
  }
  for (const match of source.matchAll(/(?:has-)?data-\[slot=([a-z0-9-]+)\]/g)) {
    names.add(match[1]);
  }
  return names;
}

export function buildConsumerContract(options = {}) {
  const rootDir = options.rootDir ?? repoRoot;

  const primitives = new Map();
  for (const absFile of listSourceFiles(path.resolve(rootDir, primitivesDir))) {
    const name = path.basename(absFile).replace(SOURCE_FILE, '');
    primitives.set(name, {
      relFile: path.relative(rootDir, absFile),
      exports: extractExports(fs.readFileSync(absFile, 'utf8')),
    });
  }

  const consumers = new Map();
  for (const absFile of listSourceFiles(path.resolve(rootDir, consumersDir))) {
    consumers.set(
      path.relative(rootDir, absFile),
      extractPrimitiveImports(fs.readFileSync(absFile, 'utf8'))
    );
  }

  const declaredSlots = new Map();
  const selectedSlots = new Map();
  for (const dir of [primitivesDir, consumersDir]) {
    for (const absFile of listSourceFiles(path.resolve(rootDir, dir))) {
      const relFile = path.relative(rootDir, absFile);
      const source = fs.readFileSync(absFile, 'utf8');
      for (const slot of extractDeclaredSlots(source)) {
        if (!declaredSlots.has(slot)) {
          declaredSlots.set(slot, []);
        }
        declaredSlots.get(slot).push(relFile);
      }
      for (const slot of extractSelectedSlots(source)) {
        if (!selectedSlots.has(slot)) {
          selectedSlots.set(slot, []);
        }
        selectedSlots.get(slot).push(relFile);
      }
    }
  }

  // Slot names are namespaced by component: `select-trigger` belongs to select.tsx,
  // `input-group-addon` to input-group.tsx. Resolve the owner by longest match so
  // `button-group-separator` lands on button-group, not button.
  const componentFiles = new Map();
  for (const dir of [primitivesDir, consumersDir]) {
    for (const absFile of listSourceFiles(path.resolve(rootDir, dir))) {
      componentFiles.set(
        path.basename(absFile).replace(SOURCE_FILE, ''),
        path.relative(rootDir, absFile)
      );
    }
  }

  return { primitives, consumers, declaredSlots, selectedSlots, componentFiles };
}

export function resolveSlotOwner(slot, componentFiles) {
  let owner = null;
  for (const name of componentFiles.keys()) {
    if (slot !== name && !slot.startsWith(`${name}-`)) {
      continue;
    }
    if (!owner || name.length > owner.length) {
      owner = name;
    }
  }
  return owner;
}

export function evaluateConsumerContract(contract) {
  const errors = [];

  if (contract.primitives.size === 0) {
    errors.push(diag('SCOPE_EMPTY', `no primitives found in ${primitivesDir}`));
  }
  if (contract.consumers.size === 0) {
    errors.push(diag('SCOPE_EMPTY', `no consumers found in ${consumersDir}`));
  }

  for (const [relFile, imports] of contract.consumers) {
    for (const [primitive, names] of imports) {
      const target = contract.primitives.get(primitive);
      if (!target) {
        errors.push(
          diag('PRIMITIVE_MISSING', `${relFile} imports from "${primitive}", which does not exist`)
        );
        continue;
      }
      for (const name of [...names].sort()) {
        if (!target.exports.has(name)) {
          errors.push(
            [
              `[CONTRACT_EXPORT_MISSING] ${target.relFile} no longer exports "${name}"`,
              `  Imported by: ${relFile}`,
              '  ai-elements is vendored against a shadcn API. Restore the export rather than',
              '  editing the consumer — the consumer is upstream code we re-adopt on every update.',
            ].join('\n')
          );
        }
      }
    }
  }

  for (const [slot, selectedBy] of [...contract.selectedSlots].sort()) {
    const owner = resolveSlotOwner(slot, contract.componentFiles);
    const selectors = [...new Set(selectedBy)].join(', ');

    if (!owner) {
      errors.push(
        [
          `[CONTRACT_SLOT_UNOWNED] data-slot="${slot}" matches no component`,
          `  Selected by: ${selectors}`,
          '  Slot names are namespaced by the component that emits them, so this one names a',
          '  component that does not exist here. Rename the slot or add the component.',
        ].join('\n')
      );
      continue;
    }

    const ownerFile = contract.componentFiles.get(owner);
    if (contract.declaredSlots.get(slot)?.includes(ownerFile)) {
      continue;
    }

    // Declared somewhere, but not by the component that owns the name — the selector
    // may happen to match, and will stop matching for reasons nobody can trace.
    const elsewhere = contract.declaredSlots.get(slot) ?? [];
    errors.push(
      [
        `[CONTRACT_SLOT_DEAD] ${ownerFile} does not emit data-slot="${slot}"`,
        `  Selected by: ${selectors}`,
        elsewhere.length > 0
          ? `  Declared instead by: ${[...new Set(elsewhere)].join(', ')} — which does not own the name.`
          : '  Declared by nothing, so the selector can never match.',
        '  Either the owning component is on the wrong upstream vintage, or the rule is obsolete.',
      ].join('\n')
    );
  }

  return { errors };
}

export function summarizeConsumerContract(contract) {
  const consumed = new Set();
  let exportCount = 0;
  for (const imports of contract.consumers.values()) {
    for (const [primitive, names] of imports) {
      consumed.add(primitive);
      exportCount += names.size;
    }
  }
  return {
    primitiveCount: contract.primitives.size,
    // Every file in the directory is scanned; only some import a primitive. Reporting
    // the scan count as "consumers" overstates the surface by about a third.
    scannedFileCount: contract.consumers.size,
    consumerCount: [...contract.consumers.values()].filter((imports) => imports.size > 0).length,
    consumedPrimitives: consumed.size,
    importedExports: exportCount,
    declaredSlots: contract.declaredSlots.size,
    selectedSlots: contract.selectedSlots.size,
  };
}

function diag(code, message) {
  return `[CONTRACT_${code}] ${message}`;
}
