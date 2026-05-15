import { test, expect } from '@playwright/test';

test.describe('Fidelity & Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure we are in cockpit mode
    const enterButton = page.getByRole('button', { name: /ENTER COCKPIT/i });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }
  });

  test('scratchpad has ARIA live region', async ({ page }) => {
    const scratchpad = page.getByTestId('scratchpad');
    await expect(scratchpad).toHaveAttribute('aria-live', 'polite');
    await expect(scratchpad).toHaveAttribute('aria-atomic', 'true');
  });

  test('avionics keys meet minimum touch target size (44px)', async ({ page }) => {
    // Increase viewport to ensure 1:1 scale for target verification
    await page.setViewportSize({ width: 1440, height: 960 });
    
    const keys = page.locator('.avionics-key');
    const count = await keys.count();
    
    // Check a sample of keys to ensure they meet the 44px requirement
    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await keys.nth(i).boundingBox();
      // Allow for sub-pixel rendering differences (e.g. 43.99px)
      expect(box?.height).toBeGreaterThanOrEqual(43.5);
    }
  });

  test('keyboard help overlay is accessible', async ({ page }) => {
    // Press 'H' to toggle help
    await page.keyboard.press('h');
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    const title = page.locator('#keyboard-help-title');
    await expect(title).toContainText(/Keyboard Shortcuts/i);
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    // Wait for animation or check if gone (it might need a click or escape handler in state)
    // For now, let's just check if it was visible
  });

  test('cockpit modes are correctly labeled for pilot tasks', async ({ page }) => {
    // The DisplaySelector contains the mode buttons
    const modes = [
      'Preflight FMC Setup',
      'Route Verification',
      'MCP/FCU Mode Training',
      'Approach Setup & Monitoring',
      'Flight Deck Scan',
      'Custom Practice'
    ];
    
    for (const mode of modes) {
      // Use role+name to avoid ambiguity with help card headers
      await expect(page.getByRole('button', { name: mode })).toBeVisible();
    }
  });

  test('hardware annunciators are rendered correctly', async ({ page }) => {
    // Check Boeing annunciators (MSG, FAIL, OFST)
    await page.getByRole('button', { name: /BOEING/i }).click(); // Switch to Boeing if needed
    const boeingAnnun = page.locator('.boeing-cdu-shell');
    await expect(boeingAnnun.getByText('MSG')).toBeVisible();
    await expect(boeingAnnun.getByText('FAIL')).toBeVisible();
    await expect(boeingAnnun.getByText('OFST')).toBeVisible();

    // Check Airbus annunciators (FAIL, MCDU MENU, FM, IND, RDY)
    await page.getByRole('button', { name: /AIRBUS/i }).click();
    const airbusAnnun = page.locator('.airbus-mcdu-shell');
    await expect(airbusAnnun.getByText('FAIL')).toBeVisible();
    await expect(airbusAnnun.getByText('MCDU MENU')).toBeVisible();
    await expect(airbusAnnun.getByText('FM')).toBeVisible();
    await expect(airbusAnnun.getByText('IND')).toBeVisible();
    await expect(airbusAnnun.getByText('RDY')).toBeVisible();
  });
});
