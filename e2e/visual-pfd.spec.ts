import { test, expect } from '@playwright/test';

async function openPfdRoute(page: import('@playwright/test').Page, route: string) {
  await page.addInitScript(() => localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true'));
  await page.goto(route);
  const firstRun = page.getByRole('button', { name: 'Got it' });
  if (await firstRun.isVisible().catch(() => false)) await firstRun.click();
}

test.describe('Primary Flight Display Visual Regression', () => {
  test('Boeing automation PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/boeing-automation');
    await expect(page.getByTestId('boeing-pfd')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('boeing-pfd-automation.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus automation PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/airbus-automation');
    await expect(page.getByTestId('airbus-pfd')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('airbus-pfd-automation.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Boeing focused PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/boeing-focused');
    await expect(page.getByRole('dialog', { name: /PFD focus mode/i })).toBeVisible();
    await expect(page.getByTestId('focused-pfd-panel')).toBeVisible();
    await expect(page.getByTestId('focused-pfd-panel')).toHaveScreenshot('boeing-pfd-focused.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus focused PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/airbus-focused');
    await expect(page.getByRole('dialog', { name: /PFD focus mode/i })).toBeVisible();
    await expect(page.getByTestId('focused-pfd-panel')).toBeVisible();
    await expect(page.getByTestId('focused-pfd-panel')).toHaveScreenshot('airbus-pfd-focused.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Boeing approach PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/boeing-approach');
    await expect(page.getByTestId('boeing-pfd')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('boeing-pfd-approach.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus approach PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/airbus-approach');
    await expect(page.getByTestId('airbus-pfd')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('airbus-pfd-approach.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Boeing unavailable PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/boeing-failure');
    await expect(page.getByTestId('boeing-pfd')).toBeVisible();
    await expect(page.getByText('IRS NAV')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('boeing-pfd-failure.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Airbus unavailable PFD baseline @Visual Regression', async ({ page }) => {
    await openPfdRoute(page, '/visual/pfd/airbus-failure');
    await expect(page.getByTestId('airbus-pfd')).toBeVisible();
    await expect(page.getByText('ADR/IR')).toBeVisible();
    await expect(page.getByTestId('primary-flight-display')).toHaveScreenshot('airbus-pfd-failure.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
