import { test, expect } from '@playwright/test';

test.describe('Navigation Display Realism Visual Regression', () => {
  test('Boeing ND MAP Failure', async ({ page }) => {
    await page.goto('/visual/nd/boeing-map-failure');
    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('svg')).toHaveScreenshot('boeing-nd-map-failure.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus ND ARC Aligning', async ({ page }) => {
    await page.goto('/visual/nd/airbus-arc-aligning');
    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('svg')).toHaveScreenshot('airbus-nd-arc-aligning.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Boeing Scratchpad Caution', async ({ page }) => {
    await page.goto('/visual/boeing/scratchpad-caution');
    await expect(page.getByTestId('scratchpad')).toBeVisible();
    await expect(page.getByTestId('scratchpad')).toHaveScreenshot('boeing-scratchpad-caution.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
