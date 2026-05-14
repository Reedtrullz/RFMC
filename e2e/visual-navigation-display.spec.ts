import { test, expect } from '@playwright/test';

test.describe('Navigation Display Visual Regression', () => {
  test('Boeing MAP mode baseline', async ({ page }) => {
    await page.goto('/visual/nd/boeing-map');
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toHaveScreenshot('boeing-nd-map.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus ARC mode baseline', async ({ page }) => {
    await page.goto('/visual/nd/airbus-arc');
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toHaveScreenshot('airbus-nd-arc.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
  test('Boeing MAP failure baseline', async ({ page }) => {
    await page.goto('/visual/nd/boeing-map-failure');
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toHaveScreenshot('boeing-nd-map-failure.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus ARC aligning baseline', async ({ page }) => {
    await page.goto('/visual/nd/airbus-arc-aligning');
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toHaveScreenshot('airbus-nd-arc-aligning.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
