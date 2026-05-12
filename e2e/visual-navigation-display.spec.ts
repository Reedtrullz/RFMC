import { test, expect } from '@playwright/test';

test.describe('Navigation Display Visual Regression', () => {
  test('Boeing MAP mode baseline', async ({ page }) => {
    await page.goto('/visual/nd/boeing-map');
    await expect(page.getByTestId('navigation-display')).toBeVisible();
    await expect(page.getByTestId('navigation-display')).toHaveScreenshot('boeing-nd-map.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus ARC mode baseline', async ({ page }) => {
    await page.goto('/visual/nd/airbus-arc');
    await expect(page.getByTestId('navigation-display')).toBeVisible();
    await expect(page.getByTestId('navigation-display')).toHaveScreenshot('airbus-nd-arc.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
