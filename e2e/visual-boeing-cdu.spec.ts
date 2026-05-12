import { test, expect } from '@playwright/test';

test.describe('Boeing CDU Visual Regression', () => {
  test('IDENT page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/ident');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-ident.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('POS INIT page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/pos-init');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-pos-init.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('RTE 1/2 page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/rte-1');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-rte-1.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('RTE 2/2 page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/rte-2');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-rte-2.png', {
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

  test('TAKEOFF REF page baseline', async ({ page }) => {
    await page.goto('/visual/boeing/takeoff-ref');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-takeoff-ref.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
