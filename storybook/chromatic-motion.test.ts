import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let restoreMotion = () => {};

beforeEach(() => vi.resetModules());
afterEach(() => {
  restoreMotion();
  vi.unstubAllGlobals();
});

describe('Storybook capture-only motion policy', () => {
  it.each([
    ['Chromatic user agent', 'Chrome Chromatic', 'https://example.test/iframe.html', true],
    ['Chromatic URL', 'Chrome', 'http://localhost:6006/iframe.html?chromatic=true', true],
    ['local Storybook', 'Chrome', 'http://localhost:6006/iframe.html', false],
    ['local browser tests', 'HeadlessChrome', 'http://localhost:63315/', false],
  ])('%s sets the real Motion capture policy', async (_, userAgent, href, expected) => {
    const { MotionGlobalConfig } = await import('motion/react');
    const previous = MotionGlobalConfig.skipAnimations;
    restoreMotion = () => {
      MotionGlobalConfig.skipAnimations = previous;
    };
    // Start with the opposite value so the non-Chromatic cases prove reset too.
    MotionGlobalConfig.skipAnimations = !expected;
    vi.stubGlobal('window', { navigator: { userAgent }, location: { href } });

    await import('../.storybook/preview');

    expect(MotionGlobalConfig.skipAnimations).toBe(expected);
  });
});
