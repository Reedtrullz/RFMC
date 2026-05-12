import { test, expect } from '@playwright/test';

test.describe('Boeing CDU Visual Regression', () => {
  test('POS INIT page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/pos-init');
    // Wait for the specific aircraft theme to apply
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-pos-init.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('RTE page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/rte');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-rte.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('LEGS page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/legs');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-legs.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
