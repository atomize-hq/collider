### S2c — Runtime Cutover Compatibility

- **User/system value**: later seams can preserve app behavior during token cutover without reopening `SEAM-1` to debate import-path or rename policy.
- **Scope (in/out)**:
  - In: `design-tokens/src/tokens/migrations/runtime-css-aliases.json`; `figma-ci-sync/scope_brief.md`; cutover expectations that `SEAM-3`, `SEAM-4`, and `SEAM-6` must preserve.
  - Out: alias generation code; CI enforcement; governance details owned by `SEAM-6`; duplicate inventory or alias data.
- **Acceptance criteria**:
  - `design-tokens/src/tokens/migrations/runtime-cutover-notes.md` states the stable import-path rule, no-silent-removal rule, and rename-as-migration rule.
  - The notes are consistent with `CT-1`, `CT-2`, and the compatibility actions recorded in `runtime-css-aliases.json`.
  - The notes tell downstream seams what they must preserve without prescribing build implementation details.
- **Dependencies**:
  - `S1.T2`
  - `S1.T3`
  - `S2.T2`
- **Verification**:
  - Review the notes beside `runtime-css-aliases.json` and `threading.md` for contradictions.
  - Confirm the notes describe preservation rules for downstream seams without leaking CI or generator ownership.
- **Rollout/safety**:
  - Keep policy minimal and durable; anything that depends on later implementation belongs in downstream seams.
  - Treat token or theme renames as explicit migration events, not opportunistic cleanup.

#### S2.T3 — Record cutover assumptions for runtime compatibility

- **Outcome**: downstream seams inherit one clear policy surface for preserving runtime behavior through the initial generated-artifact cutover.
- **Files**:
  - `design-tokens/src/tokens/migrations/runtime-css-aliases.json`
  - `figma-ci-sync/scope_brief.md`
  - `design-tokens/src/tokens/migrations/runtime-cutover-notes.md`

Checklist:

- Implement:
  - Document stable import-path expectations in `runtime-cutover-notes.md`.
  - State that legacy variable removals cannot be silent and that renames are migration events.
  - Call out the preservation obligations for `SEAM-3`, `SEAM-4`, and `SEAM-6` without assigning their implementation details here.
- Test:
  - Compare the notes against `runtime-css-aliases.json` and `threading.md` to catch policy contradictions.
  - Check that the notes do not introduce CI or generator commands that belong to later seams.
- Validate:
  - Verify the notes remain policy-focused rather than duplicating inventory or alias data.
  - Verify the policy is compatible with the `dark` baseline and future additive themes from `CT-2`.
