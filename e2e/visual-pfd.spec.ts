import { test, expect } from '@playwright/test';

test.describe('Primary Flight Display Visual Regression', () => {
  test('Boeing automation PFD baseline @Visual Regression', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true'));
    await page.goto('/visual/pfd/boeing-automation');
    const firstRun = page.getByRole('button', { name: 'Got it' });
    if (await firstRun.isVisible().catch(() => false)) await firstRun.click();
    await expect(page.getByTestId('boeing-pfd')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('boeing-pfd-automation.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus automation PFD baseline @Visual Regression', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true'));
    await page.goto('/visual/pfd/airbus-automation');
    const firstRun = page.getByRole('button', { name: 'Got it' });
    if (await firstRun.isVisible().catch(() => false)) await firstRun.click();
    await expect(page.getByTestId('airbus-pfd')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('airbus-pfd-automation.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
