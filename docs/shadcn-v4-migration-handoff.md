# shadcn v4 Migration — Handoff

**Branch:** `feat/message-stage2-pilot` · **Head:** `8916c0e` · **Tree:** clean · **Preflight:** green

Groundwork for migrating `src/components/ui` from the pre-v4 shadcn style to a v4-shaped,
Collider-owned baseline. No component has been migrated yet. Everything below is
preparation, plus two bugs found and fixed along the way.

---

## Where this started

Two questions, in this order.

**1. Is `progress.tsx` on the wrong shadcn vintage?** Yes, and it turned out to be the only
one. Measuring that led to the real question.

**2. Should we stay on the pre-v4 `new-york` style or move to `new-york-v4`?** The repo runs
React 19.2 and Tailwind 4.2 against primitives authored for React 18 and Tailwind 3.

I measured all 23 primitives against both registry styles (fetched both, normalised all
three copies through the repo prettier config, diffed):

|                | vs pre-v4  | vs v4        |                |
| -------------- | ---------- | ------------ | -------------- |
| 22 primitives  | 0–40 lines | 18–342 lines | already pre-v4 |
| `progress.tsx` | 35 lines   | 5 lines      | **v4**         |

I initially recommended staying pre-v4. That recommendation was under-argued and is no
longer the plan — see the next section.

---

## Decisions made, and why

### D1 — LOC limit raised to 300, TSX/TS split dropped (`7da23b4`)

The split was TSX 200 / TS 300, on the theory that components decompose cheaply and logic
modules don't. Sound theory, wrong numbers for this repo: TSX is 84 of the 94 guarded files
and carried every near-limit case, while nothing among the 10 TS files came within 50 lines
of 300. It also produced splits that were guard artifacts rather than seams
(`prompt-input-helpers.ts` at 62, `prompt-input-select.tsx` at 57).

The rationale is now recorded in the justfile — the previous limits had none beyond a
parenthetical, which is why it had to be reconstructed from scratch.

**Side effect:** this removed one of the two pillars holding up "stay pre-v4." v4 `carousel`
(230) and `dropdown-menu` (214) both fit under 300 now.

### D2 — Migrate to v4, not stay pre-v4

Reversed after an outside review (`/codex`, consult mode). Its verdict: _"Staying pre-v4 is
operationally defensible, but it is the wrong default for a greenfield React 19/Tailwind 4
application whose largest component source assumes modern shadcn APIs."_

What the case actually rests on — the parts verifiable without leaving the repo:

- **112 lines of `forwardRef`/`displayName`** solving a problem React 19 doesn't have
  (55 + 57, counted independently by me and Codex)
- **Two structural defects** the mixed vintage already produced (D3)
- `aria-invalid` form-error styling: 1 occurrence pre-v4 vs 6 in v4

What it does **not** rest on: the `data-slot` count. Codex was right that `data-slot` here is
unrealised convention, not working infrastructure — 13 of 16 declared slots are styled by
nothing. The reason to take slots from v4 is that ai-elements is authored against those
exact slot names, which is how both defects got in.

### D3 — The two structural defects are symptoms, not prerequisites

Both are caused by the vintage mix, and the migration fixes both. Verified.

**Card/Plan.** `plan.tsx`'s `flex items-start justify-between` is verbatim upstream
ai-elements — we did not add it. Running the repo's real `cn()`:

```
under our pre-v4 card:  flex-col space-y-1.5 p-6 flex items-start justify-between
                        → flex-col survives, justify-between runs vertically   BROKEN
under the v4 card:      @container/card-header … flex items-start justify-between
                        → flex beats grid in the display group, no flex-col     CORRECT
```

The v4 CardHeader is a grid with no `flex-col`. Our pre-v4 `flex flex-col` base is the whole
cause. Swapping the card fixes it with no edit to `plan.tsx`.

**ButtonGroup/Select.** `button-group.tsx` styles `[data-slot=select-trigger]`. Both registry
styles ship those rules, but only the v4 Select emits the slot — so in a pure pre-v4 world
they are permanently dead. This one is an argument _for_ migrating: pre-v4 can never fix it.

### D4 — Batch the migration, don't swap 23 files at once

- **Batch 1** — `card`, `select`, `button-group`. Both defects live here.
- **Batch 2** — `button`, `badge`, `hover-card`, `command`. The recorded deviations.
- **Batch 3** — the remaining 16. Covered by the two directory-scoped invariants.
- **Close out** — `components.json` → `new-york-v4`, re-pin the baseline, wire
  `check-contract` into `just check`.

### D5 — Story coverage before batch 1, not after

7 of 23 primitives now have stories. Deliberately not all 23: add coverage batch-by-batch,
immediately before the files are touched.

---

## What landed

Six commits, all with preflight green.

| commit    | what                                                            |
| --------- | --------------------------------------------------------------- |
| `7da23b4` | LOC limit 200 → 300, TSX/TS split dropped, rationale recorded   |
| `b798f51` | gitignore `.context/` (codex session id)                        |
| `b3f4bc4` | upstream baseline + consumer contract check                     |
| `50c9973` | **correction** — wrong ai-elements registry endpoint            |
| `5a3bcb6` | six primitive stories                                           |
| `8916c0e` | correction pass on everything above, from a second codex review |

### The tooling

**`src/components/upstream-baseline.json`** (`pnpm baseline:upstream`) — pins upstream by
full sha256 of the whole registry payload, plus per-file digests, `dependencies` and
`registryDependencies`. Both upstreams carry an explicit `role`: primitives are
`migration-target` (`new-york-v4`), ai-elements is `current-source`. `just check` reads the
file, never the network.

**`just check-contract`** (`scripts/lib/consumer-contract.mjs`) — derives from source what
ai-elements needs from `src/components/ui`. Two checks:

- **exports** — every name ai-elements imports still exists (`tsc` also catches this; this
  is the named, remediation-carrying diagnostic)
- **slots** — every `[data-slot=x]` styled anywhere is emitted by the component that **owns**
  that name, resolved by longest match

Nothing is stored, so the contract cannot drift from the code that produces it.

**`storybook/consumer-contract.test.ts`** — 10 tests over the extractors, both live
contracts, and the baseline shape.

### Two bugs found and fixed

**Button `link` variant contrast.** `text-primary` resolves to the accent (`#155dfc`) at
**3.42:1** on our dark ground. Zero consumers, never storied, so the a11y gate had never seen
it — the same way badge's contrast bug hid earlier. Repointed to `text-info` (6.80:1 dark,
6.83:1 light) and recorded as a deviation. This is the accent-knob rule again: the accent is
becoming a user setting, so no text colour may derive from it.

**The baseline fetcher broke the build when used correctly.** It wrote raw
`JSON.stringify`, which `prettier --check` rejects, so every refresh left `just check`
failing until someone formatted by hand. It now formats with the repo config.

### One mistake worth carrying forward

`b3f4bc4` reported **26 of 63 ai-elements files as removed upstream**. Wrong. I probed
`https://registry.ai-sdk.dev/<name>.json`; that host is a **partial mirror** — it answers,
serves about 20 of our components, and 404s the rest, so the 404s read as deletions. The
canonical endpoint is `https://elements.ai-sdk.dev/api/registry/<name>.json`, which
[`docs/ai-elements-inventory.md`](ai-elements-inventory.md) had recorded all along. I trusted
a URL I had written myself over the repo's own record.

Real counts: **33 tracked, 30 our own LOC splits, 0 orphaned.**

Two rules now exist because of it, both in `scripts/fetch-upstream-baseline.mjs`:

1. Membership comes from the canonical index (136 components), never from a per-component 404. Listed-but-unfetchable is `error`, an incident — and the fetcher **refuses to write a
   baseline containing one**.
2. Splits are an explicit map of all 30, not prefix inference.

---

## What did NOT land

- **No component has been migrated.** Not one of the 23.
- **`progress.tsx` is still the lone v4 file.** Subsumed by batch 3.
- **`check-contract` is not in `just check`.** Deliberate — it currently reports the one real
  defect. Wiring it in is the migration's acceptance criterion.
- **The six new stories are not registered** on the Chromatic rail. See "open question".
- **`aria-invalid` gap** — 4 files, vintage-independent, untouched.
- **CT-11B decoupling** and the `pilot*` → component/recipe rename — analysed in an earlier
  session, never executed.
- **Skill-pack findings** — `.agents/` is gitignored so the whole pack is unversioned, and
  `skills-lock.json` is tracked but read by nothing.

---

## Where we are right now

Green everywhere except one intended failure:

```
[CONTRACT_SLOT_DEAD] src/components/ui/select.tsx does not emit data-slot="select-trigger"
  Selected by: src/components/ui/button-group.tsx
```

|                  |                                                                  |
| ---------------- | ---------------------------------------------------------------- |
| primitives       | 23, of which **7 have stories** (badge + the six from `5a3bcb6`) |
| ai-elements      | 63 files, 46 of which import a primitive                         |
| upstream policy  | 2 invariants, 7 deviations, 17 contracts                         |
| baseline         | 33 tracked, 30 splits, 0 orphaned                                |
| registered specs | 33 — none of them the six new primitives                         |

Two stories carry **KNOWN BROKEN** play functions that assert today's defect on purpose:
`card.stories.tsx` (action renders below the title) and `button-group.stories.tsx`
(ButtonGroup's own selector matches nothing). They are characterization, not acceptance —
**replace them with desired-state assertions in the same commit that migrates the
component.** A green test encoding the defect is a sentinel, never proof.

---

## The open question, and the next step

`storybook/component-tier-policy.json` already mandates what these stories need:

```
primitive    required: default, docs
interactive  required: default, docs, state-matrix, focus, keyboard
workflow     required: default, docs, state-matrix, focus, keyboard, workflow
```

All 21 components registered at `interactive` tier carry `focus` and `keyboard`. The rail is
real and complied with. **The six new stories sit outside it** — registration assigns the
tier, and the tier mandates the kinds, so deferring registration silently exempted them from
the story-kind contract.

| component                                                   | tier        | has                           | needs                             |
| ----------------------------------------------------------- | ----------- | ----------------------------- | --------------------------------- |
| `button`, `button-group`, `select`, `command`, `hover-card` | interactive | default, variant-matrix, docs | **state-matrix, focus, keyboard** |
| `card`                                                      | primitive   | default, variant-matrix, docs | —                                 |

This matters beyond bookkeeping: `upstream-policy.json`'s `focus-ring-policy` invariant greps
for forbidden class names. It cannot tell you whether focus actually lands anywhere. A
`focus` story can — and the focus ring is one of our two invariants.

**Awaiting a decision between:**

- **A.** Register and complete all six now (5 × 3 = 15 story exports, plus registration
  across `component-specs`, `story-inventory.json`, `artifacts/chromatic/status.json` and
  three contract tests). Roughly half a day.
- **B.** Register `select` and `button-group` only — the two batch-1 interactive primitives
  where the defects live — and defer `button`, `command`, `hover-card` to batch 2 where those
  files are touched anyway.

I recommended **B**. Nothing here is invention: the tier policy dictates every kind, and the
21 existing interactive components are the worked example.

Then batch 1.

---

## Commands

```bash
just preflight                              # the gate; must pass before pushing
just check-contract                          # the consumer contract (1 expected failure)
pnpm validate:consumer-contract --report     # the full primitive API surface
pnpm baseline:upstream --dry-run             # show upstream drift, write nothing
pnpm baseline:upstream                       # re-pin (network; formats its own output)
```

## Traps

- **ai-elements registry** is `elements.ai-sdk.dev/api/registry`. `registry.ai-sdk.dev` also
  answers and serves a subset — it will manufacture phantom deletions.
- **`.agents/skills` is canonical**, `.claude/skills` are symlinks. Both are gitignored, so
  skill edits are unversioned.
- **`stack-orchestrator` routes story work to `stage-2-component-roundtrip-loop`**, not to
  `storybook-rigorous-spec-system` — that one owns the baseline (taxonomy, version pinning,
  addon policy), which already exists.
- **`shadcn add --overwrite` is never the upgrade path.** It reverts deviations without
  touching a test. `upstream-policy.json` is the guard.
