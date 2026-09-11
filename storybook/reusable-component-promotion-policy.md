# Collider promotion policy

Select a profile and consumer explicitly:

```bash
pnpm govern:reusable-component-promotion --profile component-review --consumer ci
just reusable-component-promotion component-review local
```

`components.profiles` in `ds-skills.project.json` is the policy authority. Component
review requires static story coverage and visual review, not token publication.
Publication-record review concerns its own attestation. A separately selected release
profile can require all three without making publication a prerequisite to author or
use a valid recipe.

CI and handoff component review are blocking; local inspection is explicitly advisory
and must report unmet requirements honestly. Reference documentation has a static-only
profile. No changed-file heuristic, unknown change class or environment-variable override
may silently downgrade a blocking selection. Unknown/missing selections cannot evaluate.

Return 0 means the selected consumer's policy permits continuation, not universal
readiness: inspect `requirementsSatisfied` for advisory results. Blocking unmet evidence
returns 1; inability to select/evaluate returns 2. Keep the actual typecheck, UI/story,
a11y, build and publication proof obligations appropriate to the requested change.
