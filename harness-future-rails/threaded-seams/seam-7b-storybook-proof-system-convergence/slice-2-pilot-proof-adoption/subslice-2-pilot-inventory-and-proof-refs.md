---
subslice_id: S2b
parent_slice_id: S2
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: ../seam.md#seam-brief-restated
threads:
  - THR-01
  - THR-08
contracts_produced:
  - CT-9B
contracts_consumed:
  - CT-H1
  - CT-H2
open_remediations:
  - REM-001
---

### S2b — Pilot Inventory And Proof Refs

- **User/system value**: the pilot family becomes machine-inspectable because inventory coverage and proof-story references move from implied Storybook structure into explicit `CT-9B` records that downstream seams can later consume.
- **Scope (in/out)**:
  - In: registering the pilot family in `storybook/story-inventory.json`; updating any pilot-story metadata under `storybook/stories/**` needed to keep proof refs stable; referencing generated token docs, recipe docs, and runtime parity artifacts rather than copying their content; running the draft validator in informational mode for the pilot.
  - Out: broad design-system backfill, component-spec schema changes, required-gate ratcheting, Chromatic policy, or downstream mapping / visual-review publication.
- **Acceptance criteria**:
  - Each pilot component resolves to concrete story refs or generated-doc refs for every required proof kind.
  - Generated token docs, recipe docs, and runtime parity proofs remain upstream artifacts and are only referenced from the inventory.
  - Any missing required proof kind stays machine-visible in inventory data and informational validator output.
  - Story IDs and artifact refs are stable enough for later `SEAM-8B` selection logic to consume without prose interpretation.
- **Dependencies**:
  - `S1`, especially `S1.T1` and `S1.T3`
  - `S2a`
  - inherited `SEAM-4`
  - `CT-H1`
  - `CT-H2`
  - `THR-01`
  - `THR-08`
- **Verification**:
  - Run the draft validator in informational mode against the pilot family.
  - Confirm each pilot spec resolves to actual story IDs and generated artifact refs.
  - Confirm reviewers can identify missing proof kinds from the pilot data set without story-by-story prose inspection.
- **Rollout/safety**:
  - Avoid mass story renames in the same change; if story IDs are unstable, add the smallest stabilizing metadata needed for `CT-9B` rather than widening the pilot.
  - Preserve the seam-level gate posture from `seam.md`: review `pending-human-review`, contract `pending`, revalidation `pending`, landing `pending`, closeout `pending`.
- **Review surface refs**:
  - `../review.md#r1--proof-contract-authoring-and-review-flow`
  - `../review.md#r4--sequence-for-informational-to-required-gating`

#### S2.T2 — Backfill inventory entries and proof-story references for the pilot

- **Outcome**: the pilot family appears in `storybook/story-inventory.json` with explicit proof-story coverage and generated artifact refs.
- **Files**:
  - `storybook/story-inventory.json`
  - `storybook/stories/**`
- **Thread/contract refs**: consumes `CT-H1`, `CT-H2`, `CT-9B`; revalidates `THR-01`; advances `THR-08`.

Checklist:

- Implement:
  - Register pilot coverage in `storybook/story-inventory.json`.
  - Update only the pilot story metadata needed to keep proof refs stable and validator-visible.
  - Leave genuinely missing required kinds explicit in contract data rather than hiding them in prose.
- Test:
  - Run informational validation against the pilot entries.
  - Record every missing-kind failure and any broken generated artifact ref exposed by the pilot.
- Validate:
  - Confirm all generated artifact refs remain references, not copied truth.
  - Confirm each pilot component resolves to concrete story IDs or generated-doc refs for every required kind.
  - Confirm the resulting inventory surface is stable enough for later `SEAM-8B` consumption.
