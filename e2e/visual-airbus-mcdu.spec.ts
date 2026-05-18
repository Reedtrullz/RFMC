import { test, expect } from '@playwright/test';

test.describe('Airbus MCDU Visual Regression', () => {
  test('DIR INTC page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/dir-intc');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-dir-intc.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('INIT A page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/init-a');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-init-a.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('INIT A page aligning', async ({ page }) => {
    await page.goto('/visual/airbus/init-a-aligning');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-init-a-aligning.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('F-PLN page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/f-pln');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-f-pln.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('FUEL PRED page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/fuel-pred');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-fuel-pred.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('RAD NAV page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/rad-nav');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-rad-nav.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('MCDU MENU page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/mcdu-menu');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-mcdu-menu.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('PERF APPR page baseline', async ({ page }) => {
    await page.goto('/visual/airbus/perf-appr');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-perf-appr.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
