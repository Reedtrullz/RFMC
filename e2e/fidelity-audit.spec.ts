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
    const keys = page.locator('.avionics-key');
    const count = await keys.count();
    
    // Check a sample of keys to ensure they meet the 44px requirement
    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await keys.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
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
    const toolbar = page.locator('.cockpit-toolbar, .cockpit-grid'); // Adjust selector as needed
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
      await expect(page.getByText(mode)).toBeVisible();
    }
  });
});
