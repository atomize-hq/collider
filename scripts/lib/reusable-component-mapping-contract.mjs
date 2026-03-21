export const reusableComponentMappingContractVersion = '1';

export const reusableComponentMappingOutputDirectories = Object.freeze({
  storybookConnect: 'storybook/connect',
  figmaCodeConnect: 'figma/code-connect',
});

export const reusableComponentMappingIdentityFields = Object.freeze([
  'componentId',
  'componentSpecPath',
  'storyInventoryPath',
  'proofCoveragePath',
  'chromaticStatusPath',
]);

export const reusableComponentMappingRepoOwnedFields = Object.freeze([
  'codeEntrypoint',
  'figmaComponentRef',
  'supportedVariantsSource',
  'slotNamesSource',
  'exampleStoryIds',
]);

export const reusableComponentMappingStorybookLinkFields = Object.freeze([
  'publishedStorybookUrl',
  'publishedStorybookRevisionGitSha',
  'publishedStorybookComponentIds',
  'publishedStorybookStoryIds',
]);

export const reusableComponentMappingRequiredFields = Object.freeze([
  'mappingVersion',
  ...reusableComponentMappingIdentityFields,
  ...reusableComponentMappingRepoOwnedFields,
  ...reusableComponentMappingStorybookLinkFields,
]);

export const reusableComponentMappingProvisionalNullableFields = Object.freeze([
  'codeEntrypoint',
  'figmaComponentRef',
  ...reusableComponentMappingStorybookLinkFields,
]);

export const reusableComponentMappingAllowedCt10bFields = Object.freeze([
  'build.url',
  'revision.gitSha',
  'proofInventory.selectedComponentIds',
  'proofInventory.selectedStoryIds',
]);

export function storybookConnectPathFor(componentId) {
  return `${reusableComponentMappingOutputDirectories.storybookConnect}/${componentId}.json`;
}

export function figmaCodeConnectPathFor(componentId) {
  return `${reusableComponentMappingOutputDirectories.figmaCodeConnect}/${componentId}.json`;
}
