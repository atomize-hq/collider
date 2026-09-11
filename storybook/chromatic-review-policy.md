# Collider review publication policy

The one `chromatic-review` CI job consumes the Storybook build from the same exact
checkout revision. For pull requests, all jobs use the actual head commit rather than
mixing a synthetic merge SHA with the producing workflow's head SHA. Artifact names,
publication, validation and restoration use that same revision.

Publication is explicit: `pnpm chromatic:review --branch <review-branch>` needs the
configured project credential and a build produced from that committed checkout.
Ordinary gates never publish or auto-accept changes. Keep privileged credentials out
of untrusted fork jobs; the workflow retains its same-repository fork guard.

CI accepts an upload only when the current product invocation confirms written or
unchanged validated status. A missing/unevaluable result cannot cause a prior file to
be uploaded. Publication failure still fails the job. The following component-review
job regenerates static coverage and applies its explicit blocking policy; it does not
infer an advisory exemption from changed file paths or missing review claims.

Product provider, archive and record contracts belong to ds-skills. Collider's target,
credential-variable choice, freshness limits and policy live in `ds-skills.project.json`.
