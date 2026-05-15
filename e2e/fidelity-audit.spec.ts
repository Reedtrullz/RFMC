import { test, expect } from '@playwright/test';
import { dismissWelcome, expectScreenText } from './helpers';

test.describe('Fidelity & Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    // Ensure we are in cockpit mode
    const enterButton = page.getByRole('button', { name: /ENTER COCKPIT/i });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }

    // Switch to 'Preflight FMC Setup' to ensure CDU is focused and visible
    const fmcFocusBtn = page.getByTestId('layout-mode-fmc-focus');
    if (await fmcFocusBtn.isVisible()) {
      await fmcFocusBtn.click();
      await expect(page.getByTestId('cdu-panel')).toBeVisible({ timeout: 10000 });
    }
  });

  test('scratchpad has ARIA live region', async ({ page }) => {
    // Wait for CDU to be visible
    await expect(page.getByTestId('cdu-panel')).toBeVisible({ timeout: 15000 });
    
    const scratchpad = page.getByTestId('scratchpad');
    await expect(scratchpad).toHaveAttribute('aria-live', 'polite', { timeout: 10000 });
    await expect(scratchpad).toHaveAttribute('aria-atomic', 'true');
  });

  test('avionics keys meet minimum touch target size (44px)', async ({ page }) => {
    // Increase viewport to ensure a reasonable base size
    await page.setViewportSize({ width: 1440, height: 960 });
    
    const keys = page.locator('.avionics-key');
    const count = await keys.count();
    
    // Check a sample of keys to ensure they meet the 44px requirement
    for (let i = 0; i < Math.min(count, 10); i++) {
      const height = await keys.nth(i).evaluate(el => (el as HTMLElement).offsetHeight);
      // Verify the design height is at least 44px (using offsetHeight ignores CSS scale transforms)
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });

  test('keyboard help overlay is accessible', async ({ page }) => {
    // Click background to ensure keyboard focus
    await page.mouse.click(10, 10);
    
    // Press 'h' to toggle help
    await page.keyboard.press('h');
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    const title = page.locator('#keyboard-help-title');
    await expect(title).toContainText(/Keyboard Shortcuts/i);
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('cockpit modes are correctly labeled for pilot tasks', async ({ page }) => {
    // The DisplaySelector contains the mode buttons
    const modes = [
      'fmc-focus',
      'navigation',
      'automation',
      'approach',
      'full-deck',
      'free-practice'
    ];
    
    for (const mode of modes) {
      await expect(page.getByTestId(`layout-mode-${mode}`)).toBeVisible();
    }
  });

  test('hardware annunciators are rendered correctly', async ({ page }) => {
    // Check Boeing annunciators (MSG, FAIL, OFST)
    await page.evaluate(() => (window as any).useFMCStore.getState().setAircraft('BOEING_737'));
    
    const boeingAnnun = page.locator('.boeing-cdu-shell');
    await expect(boeingAnnun.getByText(/MSG/i)).toBeVisible({ timeout: 10000 });
    await expect(boeingAnnun.getByText(/FAIL/i)).toBeVisible();
    await expect(boeingAnnun.getByText(/OFST/i)).toBeVisible();

    // Check Airbus annunciators (FAIL, MCDU MENU, FM, IND, RDY)
    await page.evaluate(() => (window as any).useFMCStore.getState().setAircraft('AIRBUS_A320'));

    const airbusAnnun = page.locator('.airbus-mcdu-shell');
    await expect(airbusAnnun.getByText('FAIL', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(airbusAnnun.getByText('MCDU MENU', { exact: true })).toBeVisible();
    await expect(airbusAnnun.getByText('FM', { exact: true }).first()).toBeVisible();
    await expect(airbusAnnun.getByText('IND', { exact: true })).toBeVisible();
    await expect(airbusAnnun.getByText('RDY', { exact: true })).toBeVisible();
  });
});
