import path from 'node:path';
import { expandTypesMap, register } from '@tokens-studio/sd-transforms';
import { stagedRuntimeCssPath } from './paths.mjs';

let hooksRegistered = false;

export function ensureStyleDictionaryHooksRegistered(StyleDictionary) {
  if (hooksRegistered) {
    return;
  }

  register(StyleDictionary, {
    platform: 'css',
  });
  hooksRegistered = true;
}

export function createStyleDictionaryConfig(tokens, options = {}) {
  const cssBuildPath = options.cssBuildPath ?? path.dirname(stagedRuntimeCssPath);

  return {
    usesDtcg: true,
    tokens,
    preprocessors: ['tokens-studio'],
    expand: {
      typesMap: expandTypesMap,
    },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab'],
        buildPath: withTrailingSeparator(cssBuildPath),
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: {
              selector: ':root',
              showFileHeader: false,
              sort: 'name',
            },
          },
        ],
      },
    },
  };
}

function withTrailingSeparator(value) {
  return value.endsWith(path.sep) ? value : `${value}${path.sep}`;
}
