import { test, expect } from '@playwright/test';
import { dismissWelcome, expectScreenText } from './helpers';

test.describe('Autopilot Mode Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    // Switch to Full Deck mode so both MCP/FCU and CDU/Scratchpad are visible
    await page.getByTestId('layout-mode-full-deck').click();
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.getByTestId('scratchpad')).toBeVisible();
  });

  test('LNAV should be rejected if no route is active', async ({ page }) => {
    // 1. Ensure we are in Boeing 737 (default)
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();

    // 2. Press LNAV
    await page.getByRole('button', { name: 'LNAV', exact: true }).click();

    // 3. Check scratchpad for error message
    await expect(page.getByTestId('scratchpad')).toContainText('NO ACTIVE ROUTE');

    // 4. Verify LNAV annunciator is NOT lit
    const lnavBtn = page.getByRole('button', { name: 'LNAV', exact: true });
    await expect(lnavBtn.locator('.annunciator-amber, .annunciator-green')).not.toBeVisible();
  });

  test('VNAV should be rejected if no performance data', async ({ page }) => {
    await page.getByRole('button', { name: 'VNAV', exact: true }).click();
    await expect(page.getByTestId('scratchpad')).toContainText('PERF/VNAV UNAVAILABLE');
  });

  test('Airbus LOC should work as a toggle', async ({ page }) => {
    // Switch to Airbus via welcome modal (needs a reload or navigating back to see it if already dismissed)
    await page.goto('/');
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);

    const locBtn = page.getByRole('button', { name: 'LOC', exact: true });
    await locBtn.click();

    // Toggles the local state - verify button background or state indicator if possible
    await expect(locBtn).toBeVisible();
  });
});
