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

### 5.1 There was no required check. There is now.

**As measured**, before this task acted:

- `GET /repos/atomize-hq/collider/branches/main/protection` → **404, "Branch not protected"**
- `GET /repos/atomize-hq/collider/rulesets` → **`[]`**

Every job was advisory. A red job blocked nothing. Earlier drafts of this plan said "the required
job" as though one existed; it did not, which is why T16a could not name one.

**Created 2026-09-06 with user approval** — a repository ruleset, not classic branch protection:

|                   |                                                                             |
| ----------------- | --------------------------------------------------------------------------- |
| ruleset           | `main`, id **22410608**, repository-scoped, `enforcement: active`           |
| targets           | `~DEFAULT_BRANCH`                                                           |
| rules             | `deletion`, `non_fast_forward`, `required_status_checks`                    |
| required contexts | **`Governance`** and **`Test All`**, both pinned to `integration_id: 15368` |
| bypass            | `bypass_actors: []`; `current_user_can_bypass: "never"`                     |
| strict policy     | `false` — a branch need not be up to date with `main` to merge              |

Verified against `GET /repos/atomize-hq/collider/rules/branches/main`, which reports all three
rules applying to the branch and both contexts under the required-checks rule.

Three deliberate choices:

- **A ruleset, not classic protection.** Classic `enforce_admins` defaults to `false`, so the
  repository admin would have been silently exempt — a gate that does not apply to the person most
  likely to trip it is decoration. A ruleset denies everyone not in `bypass_actors`, and that list
  is empty.
- **`integration_id` pinned to GitHub Actions.** Every context on this repo is reported by the
  `github-actions` app (id `15368`), confirmed from the check-runs API. Pinning it means no other
  app can post a passing `Governance`.
- **Direct pushes to `main` now fail.** Required status checks cannot be satisfied by a commit
  that has not been tested, so the ruleset rejects the push. Everything goes through a pull
  request. That is the intended cost, not a side effect.

### 5.2 Why `Reusable Component Promotion` is deliberately **not** required

Because requiring it would make things worse, and the reason is documented GitHub behaviour rather
than a guess:

> Successful check statuses are success, **skipped**, and neutral.

A job skipped by a failed `needs:` reports **Success** to a required check. So requiring job 8
would produce a check that passes while never running its commands — the exact failure this whole
migration is about, installed at the enforcement layer. Blocking would have been the safer wrong
answer; this is the unsafe one.

(The inverse trap, same source: a skipped **workflow** — path- or branch-filtered — stays
**Pending** and _does_ block. Jobs and workflows behave oppositely, which is why "skipped" alone is
never a sufficient description of what happened.)

Job 8 stays advisory until BL-2 is resolved and it can actually run. The rail protection lives in
jobs 1 and 4, which is where §5.4 already put it.

### 5.3 Job 8 is not running, and has not been

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

### 5.4 Decisions that follow

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

## 6. Settled, and what remains

**~~Branch protection or a repository ruleset does not exist and this work assumes one.~~**
**Closed 2026-09-06** — ruleset `main` (22410608) created with approval; see §5.1. S8 now has a
real binding to turn red.

Two things that stay open:

- **BL-2 gates job 8's promotion to required.** Until `chromatic-review` passes, job 8 cannot run,
  and a required-but-skipped check reports Success (§5.2). Resolve BL-2 first, then require it.
- **`allow_forking: false` is load-bearing.** It is what makes job 7's fork guard unreachable. If
  forking is ever enabled, job 7 skips on fork PRs, job 8 skips with it, and — by the same
  documented behaviour — a required job-8 check would pass by being skipped. Worth knowing before
  it becomes real rather than after.

---

## 7. Provisioning — how each environment gets the release (T16b)

T16a chose the contract; this is what implements it. One resolver, one installer,
one composite action, all reading the same reviewed record at
[`ds-skills.release.json`](../ds-skills.release.json).

### 7.1 The two halves, and why they are separate

| Half        | Owner                               | Reaches the network        |
| ----------- | ----------------------------------- | -------------------------- |
| **Resolve** | `scripts/lib/ds-skills.mjs`         | never                      |
| **Acquire** | `scripts/lib/ds-skills-acquire.mjs` | only when explicitly asked |

Resolution answers "is the reviewed release here, and is it really it?" — from the
version-specific path and the identity files the payload carries. Acquisition is a
separate, explicit act. Keeping them apart is what lets the pre-push path check
without installing, and what keeps a gate from quietly fetching mid-run.

**Identity is read, never executed.** The payload unpacks as `bin/` + `lib/`, and
carries `lib/release.json` (the CLI) and `lib/skills/RELEASE.json` (the skills)
stamped at staging time. The resolver compares both against the record. Running an
unknown binary to find out whether to trust it is not a check — so nothing is
spawned to establish identity, and an ambient `ds-skills` on `PATH` is not read,
not run, and not consulted.

That the payload's identity lives at `lib/release.json` rather than the install
root was found by installing the real release, not by reading the staging script.
A fixture built from the layout this repo _expected_ would have passed against a
resolver that could never work.

### 7.2 Local (E1, E2, E4)

```bash
just ds-skills-install    # idempotent; a no-op when the pinned release is present
just ds-skills-check      # verify only — acquires nothing, ever
```

`ds-skills-install` fetches the bootstrap from the release's own URL, verifies it
against `bootstrap.sha256` in the record **before** executing it, and lets the
bootstrap enforce the payload digests baked into itself. No authentication is
sent: the release is public, and a token here would mean the path under test is
not the path a fresh clone takes.

**`just preflight` acquires nothing** (§10.7). A missing install fails with the
exact command to run. This is enforced by a test that walks the whole preflight
recipe graph, not just the recipe named `preflight` — an acquisition added three
recipes deep would otherwise pass a one-line check.

### 7.3 CI (E3)

[`.github/actions/setup-ds-skills`](../.github/actions/setup-ds-skills/action.yml),
used by the three jobs that invoke the rail — **1 `governance`, 4 `test-all`,
8 `reusable-component-promotion`** (§5.4). One shared step, not eight copies.

The other five jobs do not provision, because they do not invoke the rail: 2 and 3
run the Storybook and static gates, 5 and 6 build, 7 publishes to Chromatic. A job
that provisions a tool it never runs proves availability of nothing and hides which
jobs actually depend on it. If a rail command moves into one of them, that job adds
the step — and until then, the resolver's fail-closed behaviour is what would
catch the omission, rather than a silent fallback.

Installation goes to a job-local prefix under `RUNNER_TEMP`; nothing persists
between jobs. The cache key carries the platform, the **measured** Node version,
the release, and the record's own digest — measured rather than declared, because
a job that quietly changed Node would otherwise reuse an install made under a
different runtime.

**A cache hit is not evidence.** The provisioning step re-verifies the restored
tree against the record and reinstalls if it does not identify itself correctly,
so a poisoned or half-written entry cannot be inherited. Both the executable path
and the release read back off disk are reported per job.

**Nothing inside the action depends on a `$GITHUB_ENV` write landing.** The prefix
is emitted as a step **output** and passed to every subsequent step explicitly;
the env var is still written, but only for the calling job's later steps. Whether
an `env:` written by one step of a composite action reaches a later step's `with:`
is a detail that would have been taken on faith, and the failure it hides is
quiet: a prefix falling back to the user-level default installs outside the
job-local location, caches an empty directory, and looks like success.

This was settled by **modelling the pessimistic case**, not by reasoning about it.
The action's steps were executed locally with GitHub's `GITHUB_OUTPUT` /
`GITHUB_ENV` semantics and then again with env propagation switched off entirely;
with it off the install still lands in `RUNNER_TEMP`. Before the fix it would have
landed in `~/.local/share/ds-skills`.

### 7.4 What the negative cases are

Each of these is a way the pin could stop pinning while everything still looked
green. All are covered by
[`src/lib/tokens/ds-skills-provisioning.test.ts`](../src/lib/tokens/ds-skills-provisioning.test.ts).

| Case                                     | Result                                     |
| ---------------------------------------- | ------------------------------------------ |
| nothing installed                        | `not-installed`, names the install command |
| an unrelated `ds-skills` on `PATH`       | still `not-installed` — `PATH` is not read |
| a different release installed            | `identity-mismatch`                        |
| the right tag, a different commit        | `identity-mismatch`                        |
| CLI and skills disagree                  | `skill-skew`                               |
| a tree with no stamped identity          | `identity-missing` — a half-restored cache |
| identified tree, no executable           | `executable-missing`                       |
| an unsupported OS/arch                   | fails with the supported list, no download |
| a record missing a required field        | throws; never defaults                     |
| bootstrap bytes fail the reviewed digest | nothing is written, nothing is executed    |

### 7.5 Skills are staged, not activated

The release carries its skills at `lib/skills/`, with their own `RELEASE.json`.
Collider does **not** read them yet: `.agents/skills` remains the frozen in-repo
snapshot until T17 switches discovery. A half-flipped state, where some skills come
from the install and some from the checkout, is the split authority this migration
exists to end — so the staging is proven present and the activation is deliberately
absent, both under test.
