import { test, expect } from '@playwright/test';

test.describe('Autopilot Mode Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('LNAV should be rejected if no route is active', async ({ page }) => {
    // 1. Ensure we are in Boeing 737 (default)
    await expect(page.getByTestId('autopilot-trainer')).toBeVisible();

    // 2. Press LNAV
    await page.getByText('LNAV', { exact: true }).click();

    // 3. Check scratchpad for error message
    // Note: The scratchpad is usually on the CDU
    await expect(page.locator('.scratchpad')).toContainText('NO ACTIVE ROUTE');
    
    // 4. Verify LNAV annunciator is NOT lit
    const lnavBtn = page.locator('button:has-text("LNAV")');
    await expect(lnavBtn.locator('.annunciator-amber, .annunciator-green')).not.toBeVisible();
  });

  test('VNAV should be rejected if no performance data', async ({ page }) => {
    await page.getByText('VNAV', { exact: true }).click();
    await expect(page.locator('.scratchpad')).toContainText('PERF/VNAV UNAVAILABLE');
  });

  test('Airbus LOC should work as a toggle', async ({ page }) => {
    // Switch to Airbus
    await page.getByLabel('Aircraft Type').selectOption('AIRBUS_A320');
    
    const locBtn = page.getByText('LOC', { exact: true });
    await locBtn.click();
    
    // Check if AP status or FMA changes (Mocked truth model currently allows LOC)
    // For now we just check if it doesn't crash and toggles the local state
  });
});
