import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Temporary root anchor for the remaining Storybook/source-policy cutover.
// No token implementation or build configuration lives in Collider.
export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
