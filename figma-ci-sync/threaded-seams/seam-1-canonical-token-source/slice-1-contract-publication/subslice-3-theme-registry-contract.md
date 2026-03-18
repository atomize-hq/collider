### S1c — Theme Registry Contract

- **User/system value**: `CT-2` becomes a concrete, file-backed contract with stable theme IDs and fallback behavior before runtime, Storybook, or Figma consumers depend on them.
- **Scope (in/out)**:
  - In: define `design-tokens/src/tokens/themes/registry.json`; align it with `themes/dark.tokens.json`; publish required/default/fallback semantics for v1 themes.
  - Out: additive theme value sets beyond `dark`, generated CSS behavior, validator wiring, or cross-seam cutover policy.
- **Acceptance criteria**:
  - `design-tokens/src/tokens/themes/registry.json` declares supported theme IDs and fallback behavior.
  - `dark` is marked as the only required v1 theme.
  - The registry and `themes/dark.tokens.json` use the same theme ID string.
  - The registry declares `dark` as both `defaultThemeId` and terminal fallback.
  - Omitted theme selection resolves to `dark`, while an explicitly unknown theme ID is invalid rather than silently remapped.
  - There is exactly one place in this seam where supported theme IDs are declared.
- **Dependencies**:
  - `S1a` so `themes/dark.tokens.json` already exists as the canonical theme file
  - `figma-ci-sync/threading.md`
  - `figma-ci-sync/scope_brief.md`
- **Verification**:
  - Compare `design-tokens/src/tokens/themes/registry.json` with `design-tokens/src/tokens/themes/dark.tokens.json` and confirm theme IDs align.
  - Review the seam docs and confirm there is no competing theme registry source of truth.
- **Rollout/safety**:
  - Do not add speculative `light` or branded themes unless they already have approved values.
  - Treat additive themes as later, non-blocking expansion after the v1 `dark` contract is stable.
  - If additive themes are added later, they must declare their fallback chain explicitly and still terminate at `dark`.

#### S1.T3 — Define the theme registry contract

- **Outcome**: `CT-2` becomes a concrete file-backed contract with stable theme IDs and fallback semantics.
- **Files**:
  - `design-tokens/src/tokens/themes/registry.json`
  - `design-tokens/src/tokens/themes/dark.tokens.json`

Checklist:

- Implement:
  - Add `design-tokens/src/tokens/themes/registry.json` with required fields for theme ID, required/default status, and fallback behavior.
  - Align the published registry ID with the existing `themes/dark.tokens.json` filename and theme identifier.
  - Fix the v1 fallback semantics in the registry contract itself: omitted theme selection resolves to `dark`, unknown explicit theme IDs fail validation, and additive themes may only fall back through their declared `extends` chain before terminating at `dark`.
  - State that additive themes extend the registry rather than replacing the required v1 baseline.
- Test:
  - Verify `dark` is the only required v1 theme.
  - Verify the registry names one fallback/default path and does not introduce duplicate theme declarations.
  - Verify the docs treat omitted theme selection and unknown theme IDs differently so downstream consumers do not invent their own fallback behavior.
- Validate:
  - Confirm `CT-2` is concrete enough for downstream seams to consume without inventing theme IDs.
  - Confirm the sub-slice does not drift into cutover or CI concerns owned by later seams.
