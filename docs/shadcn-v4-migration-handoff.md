# Collider primitive migration context

The original spike and decisions are preserved at commit
`8916c0e` and in the full pre-cleanup handoff at
`3f5c8c024237dff8ffb73782c06337a75c001383`. This document retains the intended
application migration, not obsolete local-tooling instructions.

## Intended work, separate from ds-skills extraction

Move the owned primitives toward the `new-york-v4` source style, in bounded batches,
without overwriting Collider variants/deviations. The original comparison found
22 mostly older-style primitives and a newer Progress component. Those were
observations, not a promise that today's upstream source is unchanged.

Proposed batches were Card/Select/ButtonGroup, then Button/Badge/HoverCard/Command,
then the remainder. Recheck current imports, props and applicable LOC instructions
before implementing a batch. Do not use the old limit discussion to override AGENTS.md.

Reasons for the migration included actual layout/slot compatibility, unnecessary
older ref-wrapper scaffolding and form-error styling—not the mere number of slot
attributes. Preserve owned Button/Badge semantics and recorded deviations. Upstream
source is comparison evidence, not authority to replace consumer behavior blindly.

## What the separation changed

- Source policy, static import/slot contracts and upstream capture/diff/check run
  through the installed product. See [actual source configuration](../src/components/upstream-sources.md).
- The accepted upstream snapshot covers 23 primitive and 33 conversation registry
  selections with exact payload identities, license documents and explicit splits.
  It is a migration target, not proof of completed component migration.
- Select now emits `data-slot="select-trigger"`; ButtonGroup's dark/light tests
  assert the intended styling contract. `just check-contract` is enforced inside
  `just check`. The previously documented missing-slot failure is no longer expected.
- Library guidance is curated from selected actual owned source through ds-skills;
  [consumer selections](../design-system/README.md) are not a replacement upstream
  package or a blanket guide to every component.

## What still needs application work

The full primitive migration has not been performed. In particular, recheck the
Card/Plan header conflict: the older CardHeader's flex-column base survives Plan's
class merge, so `justify-between` operates vertically. A characterization test of
that defect is not a desired-state acceptance test. Replace it with meaningful
layout assertions in the same bounded change that fixes the component.

Recheck `aria-invalid` styling gaps, story/spec coverage and actual import contracts
per batch. Newly added primitives need applicable story and visual evidence, not
special registration to make recipes valid. The badge recipe is ordinary source
under `design-tokens/src/recipes`; publication records do not authorize recipe use.

Use the installed component/library workflows and [readiness policy](stage1/sync-policy.md).
Run both themes, actual integration cases, preflight and sweep. A local green result
is not accepted Chromatic review, Figma publication, or a finished migration.
