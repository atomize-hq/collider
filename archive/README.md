# Historical records

Obsolete design-system implementation plans and retired-system runbooks have been
removed from the maintained tree. They are preserved in Git, not supported workflows.
To inspect the complete pre-cleanup tree, use commit
`3f5c8c024237dff8ffb73782c06337a75c001383`, for example:

```sh
git ls-tree -r --name-only 3f5c8c024237dff8ffb73782c06337a75c001383 -- archive
git show 3f5c8c024237dff8ffb73782c06337a75c001383:archive/README.md
```

The external separation backup also preserves every removed file and its digest.
Current entry point: [consumer documentation](../docs/current.md). Historical
claims and old commands are not evidence that the current branch is released,
reviewed, or published to Figma. Do not restore local tooling from those plans.
