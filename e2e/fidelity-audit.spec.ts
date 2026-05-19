import { test, expect } from '@playwright/test';
import { dismissWelcome, expectScreenText } from './helpers';

test.describe('Fidelity & Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    // Switch to FMC Focus mode to ensure CDU is prominent
    await page.getByTestId('layout-mode-fmc-focus').click();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
  });

  test('scratchpad has ARIA live region', async ({ page }) => {
    // Wait for CDU to be visible
    await expect(page.getByTestId('cdu-panel')).toBeVisible({ timeout: 15000 });

    const scratchpad = page.getByTestId('scratchpad');
    await expect(scratchpad).toHaveAttribute('aria-live', /polite|assertive/, { timeout: 10000 });
    await expect(scratchpad).toHaveAttribute('aria-atomic', 'true');
  });

  test('avionics keys meet minimum touch target size (44px)', async ({ page }) => {
    // Increase viewport to ensure a reasonable base size
    await page.setViewportSize({ width: 1440, height: 960 });

    const keys = page.locator('.avionics-key');
    const count = await keys.count();

    // Check a sample of keys to ensure they meet the 44px requirement
    for (let i = 0; i < Math.min(count, 10); i++) {
      const height = await keys.nth(i).evaluate((el) => (el as HTMLElement).offsetHeight);
      // Verify the design height is at least 44px (using offsetHeight ignores CSS scale transforms)
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });

  test('keyboard help overlay is accessible', async ({ page }) => {
    // Click background to ensure keyboard focus
    await page.mouse.click(10, 10);

    // Press '?' to toggle help
    await page.keyboard.press('?');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    const title = page.locator('#keyboard-help-title');
    await expect(title).toContainText(/Keyboard Shortcuts/i);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('function keys operate left and right LSKs', async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).useFMCStore.getState();
      store.setAircraft('BOEING_737');
      store.setPage('RTE');
    });

    await page.keyboard.type('KJFK');
    await page.keyboard.press('F1');
    await expect
      .poll(async () => page.evaluate(() => (window as any).useFMCStore.getState().pendingRoute?.origin))
      .toBe('KJFK');

    await page.keyboard.type('RF123');
    await page.keyboard.press('F7');
    await expect
      .poll(async () => page.evaluate(() => (window as any).useFMCStore.getState().pendingRoute?.flightNumber))
      .toBe('RF123');
  });

  test('documented help shortcut does not consume CDU H input', async ({ page }) => {
    await page.keyboard.press('H');
    await expect.poll(async () => page.evaluate(() => (window as any).useFMCStore.getState().scratchpad)).toBe('H');
    await page.keyboard.press('?');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('high contrast and reduced motion accessibility hooks apply', async ({ page }) => {
    await page.getByRole('button', { name: 'CONTRAST' }).click();
    await expect(page.locator('.cockpit-grid')).toHaveClass(/cockpit-high-contrast/);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const firstKey = page.locator('.avionics-key').first();
    await firstKey.evaluate((element) => element.classList.add('avionics-key--highlighted'));
    await expect.poll(async () => firstKey.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  });

  test('cockpit modes are correctly labeled for pilot tasks', async ({ page }) => {
    // The DisplaySelector contains the mode buttons
    const modes = ['fmc-focus', 'navigation', 'automation', 'approach', 'full-deck', 'free-practice'];

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
