import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { repoRoot } from '../design-tokens/build/paths.mjs';
import {
  buildConsumerContract,
  consumersDir,
  evaluateConsumerContract,
  extractDeclaredSlots,
  extractExports,
  extractPrimitiveImports,
  extractSelectedSlots,
  listSourceFiles,
  primitivesDir,
  resolveSlotOwner,
  summarizeConsumerContract,
} from '../scripts/lib/consumer-contract.mjs';

const contract = buildConsumerContract();

describe('the live consumer contract', () => {
  it('resolves every export ai-elements imports from a primitive', () => {
    const { errors } = evaluateConsumerContract(contract);
    const exportErrors = errors.filter((error: string) =>
      error.includes('CONTRACT_EXPORT_MISSING')
    );

    // The durable invariant. ai-elements is vendored upstream code: when a primitive
    // stops exporting something it imports, the primitive is wrong, not the consumer.
    expect(exportErrors).toEqual([]);
  });

  it('has exactly one dead slot, which the shadcn v4 migration resolves', () => {
    const { errors } = evaluateConsumerContract(contract);
    const slotErrors = errors.filter((error: string) => error.includes('CONTRACT_SLOT_DEAD'));

    // `button-group.tsx` ships two rules aimed at `[data-slot=select-trigger]`. Only the
    // v4 Select emits that slot; our pre-v4 Select emits none, so the rules are inert.
    // When the migration lands, this expectation becomes `[]` and `check-contract` joins
    // `just check` — that edit is the acceptance criterion, not incidental churn.
    expect(slotErrors).toHaveLength(1);
    expect(slotErrors[0]).toContain('src/components/ui/select.tsx does not emit');
    expect(slotErrors[0]).toContain('data-slot="select-trigger"');
    expect(slotErrors[0]).toContain('Selected by: src/components/ui/button-group.tsx');
  });

  it('covers a real surface, so a broken extractor cannot pass vacuously', () => {
    const summary = summarizeConsumerContract(contract);

    expect(summary.primitiveCount).toBeGreaterThan(20);
    expect(summary.importedExports).toBeGreaterThan(50);
    expect(summary.declaredSlots).toBeGreaterThan(10);

    // Scanning a directory is not the same as consuming from it: about a third of the
    // ai-elements files import no primitive at all, and reporting the scan count as
    // "consumers" overstated the surface.
    expect(summary.consumerCount).toBeLessThan(summary.scannedFileCount);
    expect(summary.consumerCount).toBeGreaterThan(40);
  });
});

describe('extractors', () => {
  it('reads both export shapes shadcn primitives use', () => {
    const names = extractExports(`
      export const buttonVariants = cva('');
      export function Button() {}
      export interface ButtonProps {}
      export { Card, CardAction as Action, type CardProps };
    `);

    expect([...names].sort()).toEqual([
      'Action',
      'Button',
      'ButtonProps',
      'Card',
      'CardProps',
      'buttonVariants',
    ]);
  });

  it('keys primitive imports by primitive and strips type/alias syntax', () => {
    const imports = extractPrimitiveImports(`
      import { Card, type CardProps } from '@/components/ui/card';
      import type { ButtonProps } from '@/components/ui/button';
      import { Something } from '@/components/ai-elements/other';
    `);

    expect([...imports.keys()].sort()).toEqual(['button', 'card']);
    expect([...imports.get('card')!].sort()).toEqual(['Card', 'CardProps']);
  });

  it('resolves a slot to its owning component by longest match', () => {
    const files = new Map([
      ['button', 'src/components/ui/button.tsx'],
      ['button-group', 'src/components/ui/button-group.tsx'],
      ['select', 'src/components/ui/select.tsx'],
    ]);

    expect(resolveSlotOwner('select-trigger', files)).toBe('select');
    // Longest match, or `button-group-separator` would be attributed to button.
    expect(resolveSlotOwner('button-group-separator', files)).toBe('button-group');
    expect(resolveSlotOwner('button', files)).toBe('button');
    expect(resolveSlotOwner('nothing-here', files)).toBeNull();
  });

  it('tells a declared slot apart from a selected one', () => {
    const source = `<div data-slot="card-header" className="has-data-[slot=card-action]:grid-cols-2 [&>[data-slot=select-trigger]]:w-fit" />`;

    expect([...extractDeclaredSlots(source)]).toEqual(['card-header']);
    expect([...extractSelectedSlots(source)].sort()).toEqual(['card-action', 'select-trigger']);
  });
});

describe('the pinned upstream baseline', () => {
  const baseline = JSON.parse(
    fs.readFileSync(path.resolve(repoRoot, 'src/components/upstream-baseline.json'), 'utf8')
  );

  it('pins every primitive against a full payload digest, not a moving URL', () => {
    const names = listSourceFiles(path.resolve(repoRoot, primitivesDir)).map((file: string) =>
      path.basename(file).replace(/\.tsx?$/, '')
    );

    expect(baseline.baselineVersion).toBe('2');
    expect(baseline.primitives.style).toBe('new-york-v4');
    // The two upstreams play different roles during the migration and must not be read
    // as one authority: components.json still points at the pre-v4 style.
    expect(baseline.primitives.role).toBe('migration-target');
    expect(baseline.aiElements.role).toBe('current-source');
    expect(Object.keys(baseline.primitives.components).sort()).toEqual(names.sort());

    for (const entry of Object.values(baseline.primitives.components) as Array<{
      status: string;
      payloadSha256: string;
      files: Record<string, string>;
      registryDependencies: string[];
    }>) {
      expect(entry.status).toBe('tracked');
      // Full digest of the whole registry payload — a truncated hash of one file cannot
      // detect a change to a sibling file, a dependency, or the item's metadata.
      expect(entry.payloadSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(Object.keys(entry.files).length).toBeGreaterThan(0);
      expect(Array.isArray(entry.registryDependencies)).toBe(true);
    }
  });

  it('classifies every vendored ai-elements file, orphans included', () => {
    const names = listSourceFiles(path.resolve(repoRoot, consumersDir)).map((file: string) =>
      path.basename(file).replace(/\.tsx?$/, '')
    );
    const entries = baseline.aiElements.components;

    expect(Object.keys(entries).sort()).toEqual(names.sort());
    for (const [name, entry] of Object.entries(entries) as Array<[string, { status: string }]>) {
      expect(['tracked', 'split', 'orphaned'], `${name} has an unknown status`).toContain(
        entry.status
      );
    }
  });

  it('resolves every vendored file to a live upstream component', () => {
    const statuses = Object.values(baseline.aiElements.components).map(
      (entry) => (entry as { status: string }).status
    );

    // An orphan here means a component was pulled upstream — a real event worth stopping
    // for. It is also what a WRONG registry base looks like: `registry.ai-sdk.dev` also
    // answers and serves a subset, so probing it 404s ~26 of these and manufactures
    // orphans that do not exist. Check the base against docs/ai-elements-inventory.md
    // before believing this assertion failed for the interesting reason.
    expect(baseline.aiElements.registry).toBe('https://elements.ai-sdk.dev/api/registry');
    expect(statuses.filter((status) => status === 'orphaned')).toEqual([]);
    expect(statuses.filter((status) => status === 'tracked').length).toBeGreaterThan(30);

    // `error` means listed upstream but unfetchable — an incident, never a removal. The
    // fetcher refuses to write a baseline containing one, so seeing it here means the
    // file was hand-edited.
    expect(statuses.filter((status) => status === 'error')).toEqual([]);
    expect(baseline.aiElements.indexedComponents).toBeGreaterThan(100);
  });
});
