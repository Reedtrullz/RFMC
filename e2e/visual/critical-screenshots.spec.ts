import { test, expect } from '@playwright/test';
import { dismissWelcome, expectScreenText } from '../helpers';

test.describe('Critical Visual Regression', () => {
  test('Boeing CDU default @Visual Regression', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await expectScreenText(page, 'IDENT');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-cdu-default.png', {
      maxDiffPixelRatio: 0.02,
      mask: page.locator('[data-testid="hardware-realism-controls"]'),
    });
  });

  test('Airbus MCDU default @Visual Regression', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);
    await expectScreenText(page, 'INIT');
    await expect(page.getByTestId('airbus-mcdu')).toBeVisible();
    await expect(page.getByTestId('airbus-mcdu')).toHaveScreenshot('airbus-mcdu-default.png', {
      maxDiffPixelRatio: 0.02,
      mask: page.locator('[data-testid="hardware-realism-controls"]'),
    });
  });

  test('Boeing IDENT page @Visual Regression', async ({ page }) => {
    await page.goto('/visual/boeing/ident');
    await expect(page.getByTestId('boeing-cdu')).toBeVisible();
    await expect(page.getByTestId('boeing-cdu')).toHaveScreenshot('boeing-ident-critical.png', {
      maxDiffPixelRatio: 0.02,
      mask: page.locator('[data-testid="hardware-realism-controls"]'),
    });
  });
});
