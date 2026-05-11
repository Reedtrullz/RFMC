import { test, expect } from '@playwright/test';

async function dismissWelcome(page) {
  const skipButton = page.locator('button:has-text("Skip Demo")');
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click();
  }
}

test.describe('VirtualCDU Basic', () => {
  test('loads IDENT page with aircraft model', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await expect(page.locator('text=IDENT')).toBeVisible();
    await expect(page.locator('.bg-cdu-screen >> text=737-800')).toBeVisible();
  });

  test('navigates to RTE page', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await page.locator('button:has-text("RTE")').first().click();
    await expect(page.locator('.bg-cdu-screen >> text=RTE')).toBeVisible();
    await expect(page.locator('.bg-cdu-screen >> text=ORIGIN')).toBeVisible();
  });

  test('enters scratchpad text', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await page.locator('button:has-text("1")').first().click();
    await page.locator('button:has-text("2")').first().click();
    await expect(page.locator('[data-testid="scratchpad"]')).toContainText('12');
  });

  test('clears scratchpad with CLR', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await page.locator('button:has-text("1")').first().click();
    await page.locator('button:has-text("CLR")').first().click();
    await expect(page.locator('[data-testid="scratchpad"]')).not.toContainText('1');
  });

  test('switches to Airbus mode from welcome', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);
    await expect(page.locator('.bg-cdu-screen >> text=INIT')).toBeVisible();
  });
});
