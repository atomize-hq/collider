import { describe, expect, it } from 'vitest';

import thinkingIndicatorSpec from './component-specs/thinking-indicator.json';
import proofCoverage from '../artifacts/storybook/proof-coverage.json';
import storyInventory from './story-inventory.json';
import contractDoc from './reusable-component-mapping-contract.md?raw';
import projectionPolicyDoc from './reusable-component-mapping-projection-policy.md?raw';
import {
  reusableComponentMappingComparableFields,
  figmaCodeConnectPathFor,
  reusableComponentMappingAllowedCt10bFields,
  reusableComponentMappingConformanceFields,
  reusableComponentMappingContractVersion,
  reusableComponentMappingIdentityFields,
  reusableComponentMappingOutputDirectories,
  reusableComponentMappingProvisionalNullableFields,
  reusableComponentMappingProjectionKinds,
  reusableComponentMappingRepoOwnedFields,
  reusableComponentMappingRequiredProjectionFields,
  reusableComponentMappingRequiredFields,
  reusableComponentMappingResolvedFields,
  reusableComponentMappingSharedProjectionFields,
  reusableComponentMappingStorybookLinkFields,
  storybookConnectPathFor,
} from '../scripts/lib/reusable-component-mapping-contract.mjs';

type MappingRecord = Record<string, unknown>;

const identityPathFields = [
  'componentSpecPath',
  'storyInventoryPath',
  'proofCoveragePath',
  'chromaticStatusPath',
] as const;

const unresolvedRecord: MappingRecord = {
  mappingVersion: reusableComponentMappingContractVersion,
  componentId: thinkingIndicatorSpec.componentId,
  componentSpecPath: 'storybook/component-specs/thinking-indicator.json',
  storyInventoryPath: 'storybook/story-inventory.json',
  proofCoveragePath: 'artifacts/storybook/proof-coverage.json',
  chromaticStatusPath: 'artifacts/chromatic/status.json',
  codeEntrypoint: thinkingIndicatorSpec.downstreamHooks.codeEntrypoint,
  figmaComponentRef: thinkingIndicatorSpec.downstreamHooks.figmaComponentRef,
  supportedVariantsSource: thinkingIndicatorSpec.downstreamHooks.supportedVariantsSource,
  slotNamesSource: thinkingIndicatorSpec.downstreamHooks.slotNamesSource,
  exampleStoryIds: thinkingIndicatorSpec.downstreamHooks.exampleStoryIds,
  supportedVariants: [
    { name: 'intent', values: ['primary', 'secondary'] },
    { name: 'size', values: ['sm', 'md'] },
  ],
  slotNames: ['icon', 'label', 'root'],
  implementedStoryIds: [
    'contracts-pilot-recipe--thinking-indicator-recipe',
    'contracts-generated-tokens--token-registry',
  ],
  publishedStorybookUrl: null,
  publishedStorybookRevisionGitSha: null,
  publishedStorybookComponentIds: null,
  publishedStorybookStoryIds: null,
  storyLinkStatus: 'missing-status-artifact',
  blockingFields: ['publishedStorybookUrl'],
  sources: {
    componentSpec: 'storybook/component-specs/thinking-indicator.json',
    proofCoverage: 'artifacts/storybook/proof-coverage.json',
    storyInventory: 'storybook/story-inventory.json',
    supportedVariantsSource: thinkingIndicatorSpec.downstreamHooks.supportedVariantsSource,
    slotNamesSource: thinkingIndicatorSpec.downstreamHooks.slotNamesSource,
    chromaticStatus: 'artifacts/chromatic/status.json',
  },
};

const resolvedRecord: MappingRecord = {
  ...unresolvedRecord,
  publishedStorybookUrl: 'https://chromatic.example.com/build?appId=storybook&number=42',
  publishedStorybookRevisionGitSha: '1111111111111111111111111111111111111111',
  publishedStorybookComponentIds: ['thinking-indicator'],
  publishedStorybookStoryIds: [
    'contracts-pilot-recipe--thinking-indicator-recipe',
    'contracts-generated-tokens--token-registry',
  ],
  storyLinkStatus: 'resolved',
  blockingFields: [],
};

describe('reusable component mapping contract docs', () => {
  it('pins the exact shared field inventory and CT-10B consumption boundary', () => {
    expect(contractDoc).toContain('`storybook/reusable-component-mapping-contract.md`');
    expect(contractDoc).toContain(
      '`CT-11B` v1 is a shared repo-owned JSON object with exactly these top-level keys'
    );
    expect(contractDoc).toContain('`supportedVariants`');
    expect(contractDoc).toContain('`slotNames`');
    expect(contractDoc).toContain('`implementedStoryIds`');
    expect(contractDoc).toContain('`publishedStorybookUrl`');
    expect(contractDoc).toContain('`publishedStorybookRevisionGitSha`');
    expect(contractDoc).toContain('`publishedStorybookComponentIds`');
    expect(contractDoc).toContain('`publishedStorybookStoryIds`');
    expect(contractDoc).toContain('`storyLinkStatus`');
    expect(contractDoc).toContain('`blockingFields`');
    expect(contractDoc).toContain('`sources`');
    expect(contractDoc).toContain(
      'Each emitted projection must preserve those same shared top-level fields'
    );
    expect(contractDoc).toContain(
      'Any shared top-level field change must be implemented atomically'
    );
    expect(contractDoc).toContain('`build.url`');
    expect(contractDoc).toContain('`revision.gitSha`');
    expect(contractDoc).toContain('`proofInventory.selectedComponentIds`');
    expect(contractDoc).toContain('`proofInventory.selectedStoryIds`');
    expect(contractDoc).toContain('Missing required keys are invalid.');
    expect(contractDoc).toContain('are the only provisional-nullable fields in `S1`.');
    expect(contractDoc).toContain('Vendor-native IDs are never primary identity');
    expect(contractDoc).toContain(
      'Vendor URLs, host conventions, local preview URLs, and hand-authored Storybook links are forbidden'
    );
  });

  it('pins the shared projection boundary and unresolved-value policy', () => {
    expect(projectionPolicyDoc).toContain(
      '`CT-11B` is the only allowed shared intermediate boundary'
    );
    expect(projectionPolicyDoc).toContain('`storybook/connect/<component-id>.json`');
    expect(projectionPolicyDoc).toContain('`figma/code-connect/<component-id>.json`');
    expect(projectionPolicyDoc).toContain(
      'Both output surfaces must preserve the same `componentId`.'
    );
    expect(projectionPolicyDoc).toContain(
      'The same shared top-level field set must be preserved verbatim'
    );
    expect(projectionPolicyDoc).toContain('Adapters may not infer missing code entrypoints');
    expect(projectionPolicyDoc).toContain(
      'Adapters may not derive Storybook URLs from host conventions'
    );
    expect(projectionPolicyDoc).toContain('Any shared top-level field change must update');
  });
});

describe('reusable component mapping contract module', () => {
  it('exports the frozen field groups and output helpers', () => {
    expect(reusableComponentMappingContractVersion).toBe('1');
    expect(reusableComponentMappingIdentityFields).toEqual([
      'componentId',
      'componentSpecPath',
      'storyInventoryPath',
      'proofCoveragePath',
      'chromaticStatusPath',
    ]);
    expect(reusableComponentMappingRepoOwnedFields).toEqual([
      'codeEntrypoint',
      'figmaComponentRef',
      'supportedVariantsSource',
      'slotNamesSource',
      'exampleStoryIds',
    ]);
    expect(reusableComponentMappingStorybookLinkFields).toEqual([
      'publishedStorybookUrl',
      'publishedStorybookRevisionGitSha',
      'publishedStorybookComponentIds',
      'publishedStorybookStoryIds',
    ]);
    expect(reusableComponentMappingResolvedFields).toEqual([
      'supportedVariants',
      'slotNames',
      'implementedStoryIds',
    ]);
    expect(reusableComponentMappingConformanceFields).toEqual([
      'storyLinkStatus',
      'blockingFields',
      'sources',
    ]);
    expect(reusableComponentMappingProvisionalNullableFields).toEqual([
      'codeEntrypoint',
      'figmaComponentRef',
      'publishedStorybookUrl',
      'publishedStorybookRevisionGitSha',
      'publishedStorybookComponentIds',
      'publishedStorybookStoryIds',
    ]);
    expect(reusableComponentMappingAllowedCt10bFields).toEqual([
      'build.url',
      'revision.gitSha',
      'proofInventory.selectedComponentIds',
      'proofInventory.selectedStoryIds',
    ]);
    expect(reusableComponentMappingRequiredFields).toEqual([
      'mappingVersion',
      'componentId',
      'componentSpecPath',
      'storyInventoryPath',
      'proofCoveragePath',
      'chromaticStatusPath',
      'codeEntrypoint',
      'figmaComponentRef',
      'supportedVariantsSource',
      'slotNamesSource',
      'exampleStoryIds',
      'publishedStorybookUrl',
      'publishedStorybookRevisionGitSha',
      'publishedStorybookComponentIds',
      'publishedStorybookStoryIds',
    ]);
    expect(reusableComponentMappingSharedProjectionFields).toEqual([
      ...reusableComponentMappingRequiredFields,
      'supportedVariants',
      'slotNames',
      'implementedStoryIds',
      'storyLinkStatus',
      'blockingFields',
      'sources',
    ]);
    expect(reusableComponentMappingComparableFields).toEqual(
      reusableComponentMappingSharedProjectionFields
    );
    expect(reusableComponentMappingRequiredProjectionFields).toEqual([
      'projectionKind',
      ...reusableComponentMappingSharedProjectionFields,
    ]);
    expect(reusableComponentMappingProjectionKinds).toEqual({
      storybookConnect: 'storybook-connect',
      figmaCodeConnect: 'figma-code-connect',
    });
    expect(reusableComponentMappingOutputDirectories).toEqual({
      storybookConnect: 'storybook/connect',
      figmaCodeConnect: 'figma/code-connect',
    });
    expect(storybookConnectPathFor('thinking-indicator')).toBe(
      'storybook/connect/thinking-indicator.json'
    );
    expect(figmaCodeConnectPathFor('thinking-indicator')).toBe(
      'figma/code-connect/thinking-indicator.json'
    );
  });
});

describe('reusable component mapping contract examples', () => {
  it('keeps inherited CT-9B fields aligned with the current thinking-indicator proof metadata', () => {
    expect(thinkingIndicatorSpec.componentId).toBe('thinking-indicator');
    expect(thinkingIndicatorSpec.downstreamHooks.codeEntrypoint).toBe(
      unresolvedRecord.codeEntrypoint
    );
    expect(thinkingIndicatorSpec.downstreamHooks.figmaComponentRef).toBe(
      unresolvedRecord.figmaComponentRef
    );
    expect(thinkingIndicatorSpec.downstreamHooks.supportedVariantsSource).toBe(
      unresolvedRecord.supportedVariantsSource
    );
    expect(thinkingIndicatorSpec.downstreamHooks.slotNamesSource).toBe(
      unresolvedRecord.slotNamesSource
    );
    expect(thinkingIndicatorSpec.downstreamHooks.exampleStoryIds).toEqual(
      unresolvedRecord.exampleStoryIds
    );
    expect(unresolvedRecord.componentId).toBe(proofCoverage.components[0]?.componentId);
    expect(storyInventory.components[0]?.componentId).toBe(unresolvedRecord.componentId);
  });

  it('accepts an unresolved baseline record and a resolved-link record with the same identity basis', () => {
    expect(validateMappingRecord(unresolvedRecord)).toEqual([]);
    expect(validateMappingRecord(resolvedRecord)).toEqual([]);
    expect(pickIdentityBasis(unresolvedRecord)).toEqual(pickIdentityBasis(resolvedRecord));
    expect(pickRepoOwnedFields(unresolvedRecord)).toEqual(pickRepoOwnedFields(resolvedRecord));
    expect(pickResolvedFields(unresolvedRecord)).toEqual(pickResolvedFields(resolvedRecord));
    expect(pickConformanceFields(resolvedRecord)).toEqual({
      storyLinkStatus: 'resolved',
      blockingFields: [],
      sources: unresolvedRecord.sources,
    });
    expect(resolvedRecord.publishedStorybookStoryIds).toEqual(
      storyInventory.components[0]?.implementedStoryRefs.map((story) => story.storyId)
    );
  });

  it('rejects a record that omits a required key even when the field is provisional-nullable', () => {
    const missingPublishedUrl = { ...unresolvedRecord };
    Reflect.deleteProperty(missingPublishedUrl, 'publishedStorybookUrl');

    expect(validateMappingRecord(missingPublishedUrl)).toContain(
      '[CT-11B_MAPPING_MISSING_REQUIRED_KEY] publishedStorybookUrl is required'
    );
  });

  it('rejects extra top-level keys that are outside the frozen CT-11B v1 shape', () => {
    const recordWithExtraField = {
      ...unresolvedRecord,
      vendorComponentId: 'button@vendor',
    };

    expect(validateMappingRecord(recordWithExtraField)).toContain(
      '[CT-11B_MAPPING_EXTRA_TOP_LEVEL_KEY] vendorComponentId is not allowed'
    );
  });
});

function validateMappingRecord(record: MappingRecord) {
  const errors: string[] = [];
  const allowedFields = new Set(reusableComponentMappingSharedProjectionFields);

  for (const field of Object.keys(record)) {
    if (!allowedFields.has(field)) {
      errors.push(`[CT-11B_MAPPING_EXTRA_TOP_LEVEL_KEY] ${field} is not allowed`);
    }
  }

  for (const field of reusableComponentMappingSharedProjectionFields) {
    if (!(field in record)) {
      errors.push(`[CT-11B_MAPPING_MISSING_REQUIRED_KEY] ${field} is required`);
    }
  }

  if (record.mappingVersion !== reusableComponentMappingContractVersion) {
    errors.push('[CT-11B_MAPPING_VERSION_MISMATCH] mappingVersion must equal "1"');
  }

  for (const field of reusableComponentMappingSharedProjectionFields) {
    if (!(field in record)) {
      continue;
    }

    const value = record[field];
    if (value === null && !reusableComponentMappingProvisionalNullableFields.includes(field)) {
      errors.push(`[CT-11B_MAPPING_INVALID_NULL] ${field} may not be null`);
    }
  }

  if (typeof record.componentId !== 'string' || record.componentId.length === 0) {
    errors.push('[CT-11B_MAPPING_INVALID_COMPONENT_ID] componentId must be a non-empty string');
  }

  for (const field of identityPathFields) {
    if (typeof record[field] !== 'string' || record[field].length === 0) {
      errors.push(`[CT-11B_MAPPING_INVALID_PATH] ${field} must be a non-empty repo-relative path`);
    }
  }

  if (
    typeof record.supportedVariantsSource !== 'string' ||
    record.supportedVariantsSource.length === 0
  ) {
    errors.push(
      '[CT-11B_MAPPING_INVALID_SOURCE] supportedVariantsSource must be a non-empty repo-relative path'
    );
  }

  if (typeof record.slotNamesSource !== 'string' || record.slotNamesSource.length === 0) {
    errors.push(
      '[CT-11B_MAPPING_INVALID_SOURCE] slotNamesSource must be a non-empty repo-relative path'
    );
  }

  if (!isStringArray(record.exampleStoryIds)) {
    errors.push('[CT-11B_MAPPING_INVALID_STRING_ARRAY] exampleStoryIds must be a string array');
  }

  if (!Array.isArray(record.supportedVariants)) {
    errors.push('[CT-11B_MAPPING_INVALID_SUPPORTED_VARIANTS] supportedVariants must be an array');
  }

  if (!isStringArray(record.slotNames)) {
    errors.push('[CT-11B_MAPPING_INVALID_STRING_ARRAY] slotNames must be a string array');
  }

  if (!isStringArray(record.implementedStoryIds)) {
    errors.push('[CT-11B_MAPPING_INVALID_STRING_ARRAY] implementedStoryIds must be a string array');
  }

  if (
    record.publishedStorybookComponentIds !== null &&
    !isStringArray(record.publishedStorybookComponentIds)
  ) {
    errors.push(
      '[CT-11B_MAPPING_INVALID_STRING_ARRAY] publishedStorybookComponentIds must be a string array or null'
    );
  }

  if (
    record.publishedStorybookStoryIds !== null &&
    !isStringArray(record.publishedStorybookStoryIds)
  ) {
    errors.push(
      '[CT-11B_MAPPING_INVALID_STRING_ARRAY] publishedStorybookStoryIds must be a string array or null'
    );
  }

  if (typeof record.storyLinkStatus !== 'string' || record.storyLinkStatus.length === 0) {
    errors.push('[CT-11B_MAPPING_INVALID_LINK_STATUS] storyLinkStatus must be a non-empty string');
  }

  if (!isStringArray(record.blockingFields)) {
    errors.push('[CT-11B_MAPPING_INVALID_STRING_ARRAY] blockingFields must be a string array');
  }

  if (!isObjectRecord(record.sources)) {
    errors.push('[CT-11B_MAPPING_INVALID_SOURCES] sources must be an object');
  }

  return errors;
}

function pickIdentityBasis(record: MappingRecord) {
  return reusableComponentMappingIdentityFields.reduce<Record<string, unknown>>((result, field) => {
    result[field] = record[field];
    return result;
  }, {});
}

function pickRepoOwnedFields(record: MappingRecord) {
  return reusableComponentMappingRepoOwnedFields.reduce<Record<string, unknown>>(
    (result, field) => {
      result[field] = record[field];
      return result;
    },
    {}
  );
}

function pickResolvedFields(record: MappingRecord) {
  return reusableComponentMappingResolvedFields.reduce<Record<string, unknown>>((result, field) => {
    result[field] = record[field];
    return result;
  }, {});
}

function pickConformanceFields(record: MappingRecord) {
  return reusableComponentMappingConformanceFields.reduce<Record<string, unknown>>(
    (result, field) => {
      result[field] = record[field];
      return result;
    },
    {}
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
