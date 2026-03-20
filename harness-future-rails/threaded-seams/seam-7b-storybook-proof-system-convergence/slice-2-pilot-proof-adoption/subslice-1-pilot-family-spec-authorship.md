---
subslice_id: S2a
parent_slice_id: S2
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: ../seam.md#seam-brief-restated
threads:
  - THR-04
contracts_produced:
  - CT-9B
contracts_consumed:
  - CT-H1
  - CT-H2
open_remediations:
  - REM-001
---

### S2a — Pilot Family Spec Authorship

- **User/system value**: the pilot proof contract becomes concrete enough to review because one bounded reusable-component family gets explicit component identity, tiering, and required proof-kind ownership in repo-owned spec files.
- **Scope (in/out)**:
  - In: selecting one representative but narrow pilot reusable-component family; authoring `storybook/component-specs/<component-id>.json` records for that family; confirming each spec points at generated artifact refs instead of local copied truth.
  - Out: inventory registration, pilot story metadata rewiring, validator ratcheting, downstream mapping hooks, or visual-review publication.
- **Acceptance criteria**:
  - Every pilot component has a committed spec file with stable `componentId`, tier, required kinds, owned story refs, and generated artifact refs.
  - The pilot family is small enough for one PR and does not rely on folder-name inference or reviewer memory to define identity.
  - The chosen family exercises at least one generated-doc proof surface and one behavior-oriented proof surface without requiring `SEAM-9B` or `SEAM-8B` implementation.
  - Any schema gaps discovered during spec authoring are recorded as seam-local follow-up notes before inventory backfill begins.
- **Dependencies**:
  - `S1`, especially `S1.T2`
  - inherited `SEAM-4`
  - `CT-H1`
  - `CT-H2`
  - `THR-04`
- **Verification**:
  - Validate each pilot spec against the schema frozen in `S1.T2`.
  - Review the pilot family choice against the current reusable-component Storybook surface and confirm it stays within `SEAM-7B` touch surfaces.
  - Ask one maintainer-level reviewer to confirm they can identify the required proof set from the spec files alone.
- **Rollout/safety**:
  - Keep the pilot family narrow and representative; if the first pass starts dragging in unrelated story cleanup, shrink the family before landing.
  - Preserve the seam-level gate posture from `seam.md`: review `pending-human-review`, contract `pending`, revalidation `pending`, landing `pending`, closeout `pending`.
- **Review surface refs**:
  - `../review.md#r1--proof-contract-authoring-and-review-flow`
  - `../review.md#r4--sequence-for-informational-to-required-gating`

#### S2.T1 — Select the pilot family and author component-spec records

- **Outcome**: one bounded reusable-component family becomes the proving ground for `CT-9B`.
- **Files**:
  - `storybook/component-specs/<component-id>.json`
  - any seam-local notes needed to record schema gaps discovered during authoring
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-04`; reuses `CT-H1` / `CT-H2` boundaries so specs reference upstream artifacts rather than redefining them.

Checklist:

- Implement:
  - Pick a representative but small reusable-component family that already exposes both generated-doc and behavior proof surfaces.
  - Author component-spec records with stable component identity, tier classification, required proof kinds, and generated artifact refs.
  - Preserve at least one reserved downstream hook in the spec shape without requiring downstream rail implementation.
- Test:
  - Validate each pilot spec against the schema from `S1.T2`.
  - Review one spec set with a maintainer who did not author it and confirm the required proof set is clear without opening story source.
- Validate:
  - Confirm the pilot family remains within `SEAM-7B` touch surfaces.
  - Confirm generated artifact refs still point at upstream-owned docs or parity surfaces rather than copied values.
  - Confirm no folder-name inference or ad hoc reviewer knowledge is required to identify the pilot family.
