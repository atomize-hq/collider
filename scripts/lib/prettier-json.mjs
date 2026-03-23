import prettier from 'prettier';

export async function formatJsonArtifact(value, absPath) {
  const prettierConfig = (await prettier.resolveConfig(absPath)) ?? {};
  return prettier.format(JSON.stringify(value), {
    ...prettierConfig,
    filepath: absPath,
  });
}
