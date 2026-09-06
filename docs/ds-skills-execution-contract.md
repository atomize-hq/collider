# Execution contract — where `ds-skills` runs, and what enforces it

**T16a of the `ds-skills` migration.** Split out of T16 and moved ahead of implementation by the
round-4 review, for one reason: platforms, runtime prerequisites and install location decide what
the release must **contain**, and GitHub's immutable releases forbid adding, replacing or deleting
an asset after publication. A missing platform asset discovered at T17 is not a fix — it is a new
release and a new reviewed record in Collider.

Everything below is measured on 2026-09-06, not assumed. Where a fact came from an API call, the
call is named.

## 1. The environments that actually invoke the rail

Four, not the "CI and local" the plan had been assuming.

| #   | Environment             | Measured                                            | What it invokes                                                                                          |
| --- | ----------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| E1  | Developer workstation   | `Darwin arm64`, Node **v25.9.0**, pnpm `10.11.1`    | `just check`, `pnpm figma:plugin:build`, `pnpm figma:tokens:serve`, `pnpm baseline:rail`                 |
| E2  | Pre-push hook           | E1's shell, non-interactive                         | `.husky/pre-push` → `just preflight` → `pnpm govern:tokens` → the ledger and parity validators           |
| E3  | CI runners              | `ubuntu-latest` x86_64, Node **22**, pnpm `10.11.1` | jobs 1, 4 and 8 (see §5)                                                                                 |
| E4  | Agent / skill execution | E1's machine, spawned by an agent                   | `node .agents/skills/scripts/validate-artifact.mjs <schema> <instance>`, from skill and doc instructions |

E2 and E4 are the two the earlier drafts folded into "local", and they have different
requirements. **E2 must acquire nothing** — a pre-push hook that reaches the network is a
developer-hostile gate, and §10.7 already says so. **E4 is invoked by an agent reading
instructions**, so its command string lives in Markdown that T11 has to rewrite; a stale
instruction there fails in a place no gate looks.

### The runtime skew is real and currently undeclared

E1 runs Node 25.9.0; E3 pins Node 22. **Neither `collider/package.json` nor the pack's
`package.json` declares an `engines` field**, so nothing states a supported range and nothing
fails early when it is violated.

**Decision: declare `node >= 22` as a hard minimum**, checked at install with an actionable
message (§10.5 already requires the check; this fixes the number). 22 is the lowest version any
environment currently provides, and the CLI is a small Node program with no version-sensitive
surface. This is deliberately _not_ "whatever Collider pins" — resolving the prerequisite from the
consumer is the ambient-dependency defect §10.5 exists to prevent.

## 2. Platforms and architectures

§10.5 lists five assets. The question T16a has to answer is not which to list — it is which are
**required today**, and which can be **proven** rather than merely shipped.

| Asset            | Required by         | Provable in the pack's CI |
| ---------------- | ------------------- | ------------------------- |
| `macos_arm64`    | **E1/E2/E4**        | `macos-latest`            |
| `linux_x86_64`   | **E3**              | `ubuntu-latest`           |
| `macos_x86_64`   | no current consumer | `macos-13`                |
| `linux_aarch64`  | no current consumer | `ubuntu-24.04-arm`        |
| `windows_x86_64` | no current consumer | `windows-latest`          |

**Decision: ship all five, and test all five.** The two-asset alternative is tempting and wrong:
adding an asset later requires a new release, whereas building one now costs a matrix entry. And
`ds-skills` is a **public** repository, which makes `ubuntu-24.04-arm` available at no cost, so
every row above is genuinely reachable. An asset that ships untested would be worse than one that
does not ship — it would look supported.

An unlisted OS/arch pair fails with the list rather than downloading something that will not run.
That behaviour is T14's to test, on all five.

## 3. Install location and non-interactive resolution

§10.6 settles the locations. What T16a adds is the resolution rule, because that is what E2 and E3
actually depend on:

- **Collider resolves the binary from the reviewed record's version, at the version-specific
  path.** Never from `PATH`.
- An ambient `ds-skills` on a developer's machine must **not be executed at all** — not even to
  read its version. Running an unknown binary to decide whether to trust it is not a check.
- E2 acquires nothing. A missing or mismatched install fails with the exact install command.
- E3 installs into a job-local prefix under the runner temp dir, every job, every run.

## 4. What the pack does not have yet

Recorded so T8 and T14 do not rediscover it:

- **No `bin` field, and no executable.** `bin/ds-skills` does not exist; T8 creates it.
- **No `engines`.** §1's decision lands here.
- **`esbuild` is an optional peer dependency** — the §7.3 defect, T14's to remove.
- **One CI job, `ubuntu-latest`, Node 22.** The five-platform matrix is new work.
- **`files` is `["dist", "src", "plugin", "README.md"]`** — no `skills/`, `schemas/`, `profiles/`
  or `templates/`; T11 adds them.

## 5. The enforcement checks — named, and the finding that outranks the naming

The eight jobs, their ids, and the check context each emits. **The context is the `name:` value,
not the job id** — confirmed against `/commits/main/check-runs`, not inferred:

| #   | job id                         | check context                | `needs`                         | gate command                               |
| --- | ------------------------------ | ---------------------------- | ------------------------------- | ------------------------------------------ |
| 1   | `governance`                   | Governance                   | —                               | `pnpm govern:tokens`                       |
| 2   | `storybook-proof`              | Storybook Proof              | `governance`                    | `pnpm govern:storybook-proof`              |
| 3   | `quality`                      | Quality                      | `governance`, `storybook-proof` | `just check` + `just loc`                  |
| 4   | `test-all`                     | Test All                     | `quality`                       | `just test-all`                            |
| 5   | `build-next`                   | Build Next.js                | `quality`                       | `pnpm build`                               |
| 6   | `build-storybook`              | Build Storybook              | `quality`                       | `pnpm storybook:build`                     |
| 7   | `chromatic-review`             | chromatic-review             | `build-storybook`               | Chromatic publish — conditional            |
| 8   | `reusable-component-promotion` | Reusable Component Promotion | `chromatic-review`              | `pnpm govern:reusable-component-promotion` |

Workflow file: `.github/workflows/ci.yml`. Triggers: `pull_request` (no branch filter) and `push`
to `main`. Three jobs enforce the rail surface: **1**, **4** and **8**.

### 5.1 There is no required check

- `GET /repos/atomize-hq/collider/branches/main/protection` → **404, "Branch not protected"**
- `GET /repos/atomize-hq/collider/rulesets` → **`[]`**

Every job above is advisory. A red job blocks nothing. Earlier drafts of this plan said "the
required job" as though one existed; **it does not**, and T16a cannot name one until it is created.

### 5.2 Job 8 is not running, and has not been

Job 7 carries `if: github.event_name != 'pull_request' || …head.repo.fork == false`. That guard is
**unreachable as configured** — the repository is private with `allow_forking: false`, so the fork
condition is never true. It is a latent hazard that activates the day forking is enabled, not a
live one.

The live mechanism is simpler and worse. Job 8 `needs: chromatic-review`, so it is skipped whenever
job 7 does not succeed — and **job 7 fails**, on the unaccepted visual baselines tracked as BL-2.
The most recent `main` run, `31917271403`:

```
success  Governance          success  Build Next.js
success  Storybook Proof     success  Build Storybook
success  Quality             failure  chromatic-review
success  Test All            skipped  Reusable Component Promotion
```

**So the CT-8B status rail is not enforced in CI at all.** `summarizeCt8b()` — the consumer T9
discovered, and the entire reason T8 must define a `--json` interface — runs inside a job that does
not run. A `skipped` conclusion is not a `failure`, so nothing has ever surfaced it.

This is the round-4 warning made concrete, by a mechanism nobody predicted: not "a required check
that did not run", but a check that is neither required nor running, in a repository where being
red would not have blocked anything anyway.

### 5.3 Decisions that follow

- **The replacement rail verification goes upstream of Chromatic.** Job **1 `governance`** for the
  ledger, parity and proof validators — they already live in `governanceSteps`. Job **4 `test-all`**
  for `ds-skills figma verify`, which is where `figma-token-rail.test.ts` runs today, so the S2
  protection does not move between jobs during the cutover. Neither is downstream of a gate that is
  already inert.
- **Preserve the eight-job structure.** This migration is not a CI redesign. Job 8's dependency on
  Chromatic is a real defect, but it is BL-2's defect, and fixing it here would put a Chromatic
  change in a tooling diff.
- **T18's S8 needs a required-check binding to exist**, or "a deliberate regression turns the
  required job red" degrades to "turns a job red, which blocks nothing".

## 6. Open, and needing the user

**Branch protection or a repository ruleset does not exist and this work assumes one.** Creating it
is a repository-settings change, so it is ask-first and T16a raises it rather than performing it.
The minimum that makes S8 meaningful: `main` protected, with `Governance` and `Test All` as
required status checks.

Two things to decide alongside it, because they change the answer:

- Requiring `Reusable Component Promotion` while job 7 fails would **block every merge**, since a
  skipped required check does not satisfy a requirement. Either BL-2 gets resolved first, or job 8
  stays advisory and the rail protection lives in jobs 1 and 4 — which §5.3 already prefers.
- `allow_forking: false` is what makes job 7's guard unreachable. If forking is ever enabled, job 7
  skips on fork PRs, job 8 skips with it, and a required job-8 check would then pass by being
  skipped. That is the hazard worth writing down before it becomes real.
