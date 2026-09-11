# Installed ds-skills

This **index** is Collider-owned documentation for the generated directory. The skill
files beneath it are receipt-checked outputs of the release pinned in
`ds-skills.release.json`, not Collider-authored instructions.

Run `just ds-skills-install` for the explicit core plus custom-curation installation
or reviewed upgrade, then run `just ds-skills-check` to verify both managed discovery
surfaces. Do not edit installed files; edited/unowned output is refused and must be
recovered through the pinned product workflow.

Product authoring belongs to the public ds-skills release. Collider owns its project
configuration in `ds-skills.project.json`, application source, and design data; its
Figma validation profile is `src/figma/validation-profile.json`.
