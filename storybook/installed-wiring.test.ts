import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import project from '../ds-skills.project.json';
import policy from '../.storybook/storybook-version-policy.json';
import manifest from '../package.json';

const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');

describe('Collider installed evidence command wiring', () => {
  it('keeps actual Storybook framework/dependencies and addon configuration aligned', () => {
    const dependencies: Record<string, string> = manifest.devDependencies;
    expect(dependencies.storybook).toBe(policy.storybookVersion);
    expect(dependencies[policy.framework]).toBe(policy.storybookVersion);
    const main = fs.readFileSync(path.join(root, '.storybook/main.ts'), 'utf8');
    for (const addon of policy.requiredAddons) {
      expect(dependencies[addon]).toBeDefined();
      expect(main).toContain(`'${addon}'`);
      // Designs has an independent release train; only core addons share this pin.
      if (['@storybook/addon-vitest', '@storybook/addon-a11y'].includes(addon))
        expect(dependencies[addon]).toBe(policy.storybookVersion);
    }
  });

  it('keeps preflight and its CI owner on the same installed required-kind gate', () => {
    expect(manifest.scripts['govern:storybook-proof']).toBe(
      'node .ds-skills/project.mjs storybook proof build --config ds-skills.project.json'
    );
    const justfile = fs.readFileSync(path.join(root, 'justfile'), 'utf8');
    expect(justfile).toContain('storybook-proof:\n    pnpm govern:storybook-proof');
    const job = workflow.split('\n  storybook-proof:')[1].split('\n  quality:')[0];
    expect(job).toContain('run: pnpm govern:storybook-proof');
    expect(job).toContain('node .ds-skills/project.mjs --install');
  });

  it('uses one actual head revision across checkout, upload, review and restore', () => {
    expect(workflow).toContain(
      'REVIEW_SHA: ${{ github.event.pull_request.head.sha || github.sha }}'
    );
    const checkouts = workflow.match(
      /uses: actions\/checkout@v4\n        with:\n          ref: \$\{\{ env.REVIEW_SHA \}\}/g
    );
    expect(checkouts).toHaveLength(8);
    expect(workflow).not.toContain('storybook-static-${{ github.sha }}');
    expect(workflow).toContain('name: storybook-static-${{ env.REVIEW_SHA }}');
    expect(workflow).toContain('name: chromatic-status-${{ env.REVIEW_SHA }}');
    expect(project.storybook.chromatic.restore.repository).toBe('atomize-hq/collider');
    expect(project.storybook.chromatic.restore.workflow).toBe('ci.yml');
  });

  it('does not upload an old status after an unevaluable publication', () => {
    const job = workflow
      .split('\n  chromatic-review:')[1]
      .split('\n  reusable-component-promotion:')[0];
    expect(job).toContain("import { readPinnedResult } from './.ds-skills/project.mjs'");
    expect(job).toContain("['written', 'unchanged'].includes(result.artifactStatus)");
    expect(job).toContain("steps.publish_chromatic_review.outputs.current_status == 'true'");
    expect(job).toContain("steps.publish_chromatic_review.outcome != 'success'");
    expect(job).toContain('process.exitCode = status');
  });

  it('enforces explicit review requirements in CI without change-path downgrades', () => {
    const job = workflow.split('\n  reusable-component-promotion:')[1];
    expect(job).toContain('pnpm govern:storybook-proof');
    expect(job).toContain('pnpm generate:reusable-component-status');
    expect(job).toContain(
      'pnpm govern:reusable-component-promotion --profile component-review --consumer ci'
    );
    expect(job).not.toContain('continue-on-error');
    expect(job).not.toContain('REUSABLE_COMPONENT_PROMOTION_CHANGE_CLASS');
    expect(project.components.profiles['component-review']).toMatchObject({
      requirements: ['story-coverage', 'visual-review'],
      consumers: { ci: 'blocking' },
    });
    expect(project.components.profiles['component-review'].requirements).not.toContain(
      'figma-publication'
    );
  });
});
