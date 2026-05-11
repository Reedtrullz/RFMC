import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    const skipButton = page.locator('button:has-text("Skip Demo")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  });

  test('IDENT Page Visual Match', async ({ page }) => {
    await expect(page.locator('.bg-cdu-screen').first()).toHaveScreenshot('boeing-ident.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  test('POS INIT Page Visual Match', async ({ page }) => {
    await page.getByRole('button', { name: 'LSK L1', exact: true }).click();
    await expect(page.locator('.bg-cdu-screen').first()).toHaveScreenshot('boeing-pos-init.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  test('RTE Page Visual Match', async ({ page }) => {
    await page.getByRole('button', { name: 'RTE', exact: true }).first().click();
    await expect(page.locator('.bg-cdu-screen').first()).toHaveScreenshot('boeing-rte.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  test('N1 LIMIT Page Visual Match', async ({ page }) => {
    await page.getByRole('button', { name: 'N1 LIMIT', exact: true }).click();
    await expect(page.locator('.bg-cdu-screen').first()).toHaveScreenshot('boeing-n1-limit.png', {
      maxDiffPixelRatio: 0.05
    });
  });
});
