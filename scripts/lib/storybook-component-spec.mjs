import path from 'node:path';

export const componentSpecVersion = '1';
export const allowedComponentSpecKinds = Object.freeze([
  'default',
  'variant-matrix',
  'state-matrix',
  'actions',
  'controlled',
  'keyboard',
  'focus',
  'workflow',
  'motion',
  'async',
  'docs',
  'responsive',
  'composition',
]);

const componentIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateComponentSpec(data, { filenameStem } = {}) {
  const errors = [];

  if (!assertPlainObject(errors, data, 'componentSpec')) {
    return errors;
  }

  validateKeySpec(
    errors,
    data,
    {
      required: [
        'specVersion',
        'componentId',
        'tier',
        'requiredStoryKinds',
        'ownedStoryRefs',
        'generatedArtifactRefs',
        'downstreamHooks',
      ],
      optional: [],
    },
    'componentSpec'
  );

  requireLiteral(errors, data.specVersion, componentSpecVersion, 'componentSpec.specVersion');
  validateComponentId(errors, data.componentId, filenameStem);
  validateTier(errors, data.tier);
  validateRequiredStoryKinds(errors, data.requiredStoryKinds);
  validateOwnedStoryRefs(errors, data.ownedStoryRefs);
  validateGeneratedArtifactRefs(errors, data.generatedArtifactRefs);
  validateDownstreamHooks(errors, data.downstreamHooks);

  return errors;
}

function validateComponentId(errors, componentId, filenameStem) {
  if (typeof componentId !== 'string' || componentId.length === 0) {
    errors.push(
      '[CT-9B_COMPONENT_SPEC_INVALID_COMPONENT_ID] componentSpec.componentId must be a non-empty string'
    );
    return;
  }

  if (!componentIdPattern.test(componentId)) {
    errors.push(
      '[CT-9B_COMPONENT_SPEC_INVALID_COMPONENT_ID] componentSpec.componentId must be kebab-case'
    );
  }

  if (filenameStem !== undefined && componentId !== filenameStem) {
    errors.push(
      `[CT-9B_COMPONENT_SPEC_FILENAME_MISMATCH] componentSpec.componentId must match filename stem "${filenameStem}"`
    );
  }
}

function validateTier(errors, tier) {
  if (typeof tier !== 'string' || tier.length === 0) {
    errors.push(
      '[CT-9B_COMPONENT_SPEC_INVALID_TIER] componentSpec.tier must be a non-empty string'
    );
  }
}

function validateRequiredStoryKinds(errors, requiredStoryKinds) {
  const label = 'componentSpec.requiredStoryKinds';
  if (!Array.isArray(requiredStoryKinds) || requiredStoryKinds.length === 0) {
    errors.push(
      '[CT-9B_COMPONENT_SPEC_INVALID_REQUIRED_STORY_KINDS] componentSpec.requiredStoryKinds must be a non-empty array'
    );
    return;
  }

  const seenKinds = new Set();
  for (const [index, kind] of requiredStoryKinds.entries()) {
    validateStoryKind(errors, kind, `${label}[${index}]`, seenKinds, label);
  }
}

function validateOwnedStoryRefs(errors, ownedStoryRefs) {
  const label = 'componentSpec.ownedStoryRefs';
  if (!Array.isArray(ownedStoryRefs) || ownedStoryRefs.length === 0) {
    errors.push(
      '[CT-9B_COMPONENT_SPEC_INVALID_OWNED_STORY_REFS] componentSpec.ownedStoryRefs must be a non-empty array'
    );
    return;
  }

  const seenStoryIds = new Set();
  for (const [index, storyRef] of ownedStoryRefs.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (!assertPlainObject(errors, storyRef, itemLabel)) {
      continue;
    }

    validateKeySpec(
      errors,
      storyRef,
      {
        required: ['storyId', 'kinds'],
        optional: [],
      },
      itemLabel
    );

    const { storyId, kinds } = storyRef;
    if (typeof storyId !== 'string' || storyId.length === 0) {
      errors.push(
        `[CT-9B_COMPONENT_SPEC_INVALID_STORY_ID] ${itemLabel}.storyId must be a non-empty string`
      );
    } else if (seenStoryIds.has(storyId)) {
      errors.push(
        `[CT-9B_COMPONENT_SPEC_DUPLICATE_STORY_ID] ${itemLabel}.storyId duplicates "${storyId}"`
      );
    } else {
      seenStoryIds.add(storyId);
    }

    if (!Array.isArray(kinds) || kinds.length === 0) {
      errors.push(
        `[CT-9B_COMPONENT_SPEC_INVALID_STORY_KINDS] ${itemLabel}.kinds must be a non-empty array`
      );
      continue;
    }

    const seenKinds = new Set();
    for (const [kindIndex, kind] of kinds.entries()) {
      validateStoryKind(
        errors,
        kind,
        `${itemLabel}.kinds[${kindIndex}]`,
        seenKinds,
        `${itemLabel}.kinds`
      );
    }
  }
}

function validateGeneratedArtifactRefs(errors, generatedArtifactRefs) {
  const label = 'componentSpec.generatedArtifactRefs';
  if (!assertPlainObject(errors, generatedArtifactRefs, label)) {
    return;
  }

  validateKeySpec(
    errors,
    generatedArtifactRefs,
    {
      required: ['tokenDocs', 'recipeDocs', 'runtimeParity'],
      optional: [],
    },
    label
  );

  validateNullableRepoPath(errors, generatedArtifactRefs.tokenDocs, `${label}.tokenDocs`);
  validateNullableRepoPath(errors, generatedArtifactRefs.recipeDocs, `${label}.recipeDocs`);
  validateNullableRepoPath(errors, generatedArtifactRefs.runtimeParity, `${label}.runtimeParity`);
}

function validateDownstreamHooks(errors, downstreamHooks) {
  const label = 'componentSpec.downstreamHooks';
  if (!assertPlainObject(errors, downstreamHooks, label)) {
    return;
  }

  validateKeySpec(
    errors,
    downstreamHooks,
    {
      required: [
        'codeEntrypoint',
        'figmaComponentRef',
        'supportedVariantsSource',
        'slotNamesSource',
        'exampleStoryIds',
      ],
      optional: [],
    },
    label
  );

  validateNullableString(errors, downstreamHooks.codeEntrypoint, `${label}.codeEntrypoint`);
  validateNullableString(errors, downstreamHooks.figmaComponentRef, `${label}.figmaComponentRef`);
  validateNullableString(
    errors,
    downstreamHooks.supportedVariantsSource,
    `${label}.supportedVariantsSource`
  );
  validateNullableString(errors, downstreamHooks.slotNamesSource, `${label}.slotNamesSource`);

  if (!Array.isArray(downstreamHooks.exampleStoryIds)) {
    errors.push(
      '[CT-9B_COMPONENT_SPEC_INVALID_EXAMPLE_STORY_IDS] componentSpec.downstreamHooks.exampleStoryIds must be an array'
    );
    return;
  }

  for (const [index, storyId] of downstreamHooks.exampleStoryIds.entries()) {
    if (typeof storyId !== 'string' || storyId.length === 0) {
      errors.push(
        `[CT-9B_COMPONENT_SPEC_INVALID_EXAMPLE_STORY_ID] ${label}.exampleStoryIds[${index}] must be a non-empty string`
      );
    }
  }
}

function validateStoryKind(errors, kind, itemLabel, seenKinds, parentLabel) {
  if (typeof kind !== 'string' || kind.length === 0) {
    errors.push(`[CT-9B_COMPONENT_SPEC_INVALID_KIND] ${itemLabel} must be a non-empty string`);
    return;
  }

  if (!allowedComponentSpecKinds.includes(kind)) {
    errors.push(
      `[CT-9B_COMPONENT_SPEC_UNKNOWN_KIND] ${itemLabel} must be one of ${allowedComponentSpecKinds.join(', ')}`
    );
    return;
  }

  if (seenKinds.has(kind)) {
    errors.push(
      `[CT-9B_COMPONENT_SPEC_DUPLICATE_KIND] ${itemLabel} duplicates "${kind}" in ${parentLabel}`
    );
    return;
  }

  seenKinds.add(kind);
}

function validateNullableRepoPath(errors, value, label) {
  if (value === null) {
    return;
  }

  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    path.isAbsolute(value) ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.includes('://')
  ) {
    errors.push(
      `[CT-9B_COMPONENT_SPEC_INVALID_REPO_PATH] ${label} must be a repo-relative path string or null`
    );
  }
}

function validateNullableString(errors, value, label) {
  if (value === null) {
    return;
  }

  if (typeof value !== 'string' || value.length === 0) {
    errors.push(
      `[CT-9B_COMPONENT_SPEC_INVALID_STRING] ${label} must be a non-empty string or null`
    );
  }
}

function assertPlainObject(errors, value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`[CT-9B_COMPONENT_SPEC_INVALID_OBJECT] ${label} must be an object`);
    return false;
  }

  return true;
}

function validateKeySpec(errors, value, keySpec, label) {
  const requiredKeys = [...keySpec.required].sort();
  const optionalKeys = [...(keySpec.optional ?? [])].sort();
  const allowedKeys = [...requiredKeys, ...optionalKeys].sort();
  const actualKeys = Object.keys(value).sort();

  for (const key of requiredKeys) {
    if (!actualKeys.includes(key)) {
      errors.push(`[CT-9B_COMPONENT_SPEC_MISSING_REQUIRED_KEY] ${label}.${key} is required`);
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.includes(key)) {
      errors.push(`[CT-9B_COMPONENT_SPEC_UNEXPECTED_KEY] ${label}.${key} is not allowed`);
    }
  }
}

function requireLiteral(errors, actual, expected, label) {
  if (actual !== expected) {
    errors.push(`[CT-9B_COMPONENT_SPEC_INVALID_LITERAL] ${label} must be ${expected}`);
  }
}
