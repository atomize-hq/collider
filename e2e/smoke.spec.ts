import { test, expect } from '@playwright/test';

// Minimal smoke test so the e2e rail has real coverage: the app shell must boot
// and render the root route. Expand with feature flows as the UI grows.
test('app shell renders at the root route', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Collider')).toBeVisible();
});
