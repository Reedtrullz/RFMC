import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    const skipButton = page.locator('button:has-text("Skip Demo")');
    try {
      await skipButton.waitFor({ state: 'visible', timeout: 5000 });
      await skipButton.click();
    } catch (e) {
      // Button might not be there or already dismissed
    }
  });

  test('IDENT Page Visual Match', async ({ page }) => {
    await page.goto('/visual/boeing/ident');
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-ident.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('POS INIT Page Visual Match', async ({ page }) => {
    await page.goto('/visual/boeing/pos-init');
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-pos-init.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('RTE Page Visual Match', async ({ page }) => {
    await page.goto('/visual/boeing/rte-1');
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-rte.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('N1 LIMIT Page Visual Match', async ({ page }) => {
    await page.goto('/visual/boeing/n1-limit');
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-n1-limit.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Cockpit Layout (Full View)', async ({ page }) => {
    const enterButton = page.getByRole('button', { name: 'Enter Cockpit' });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }
    await expect(page.locator('.cockpit-grid')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-full-layout.png', {
      maxDiffPixelRatio: 0.1,
    });
  });
});
