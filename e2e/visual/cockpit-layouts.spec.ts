import { test, expect, type Page } from '@playwright/test';
import { dismissWelcome } from '../helpers';

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

/**
 * Set the cockpit layout mode via the Zustand store exposed on window.
 * `dismissWelcome` switches to full-deck when cockpit mode is detected,
 * so each test re-selects the mode under test after that completes.
 */
async function setCockpitMode(page: Page, mode: string) {
  await page.evaluate((m) => {
    const store = (window as any).useCockpitLayoutStore;
    if (store) store.getState().setCockpitLayoutMode(m);
  }, mode);
  await page.waitForTimeout(500);
}

/**
 * Switch to Airbus A320 via the exposed aircraft store.
 * The "A320neo" UI button lives inside DemoWelcome, which is dismissed.
 */
async function switchToAirbus(page: Page) {
  await page.evaluate(() => {
    (window as any).useAircraftStore?.getState().setAircraft('AIRBUS_A320');
  });
  await page.waitForTimeout(500);
}

/**
 * Navigate to the app, set viewport, and dismiss the welcome modal.
 */
async function prepareCockpit(page: Page) {
  await page.goto('/');
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await dismissWelcome(page);
  await page.waitForTimeout(300);
}

test.describe('Cockpit Layout Visual Regression', () => {

  test('Boeing FMC focus @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'fmc-focus');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-boeing-fmc-focus.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Boeing navigation mode @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'navigation');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-boeing-navigation.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Boeing automation mode @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'automation');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-boeing-automation.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Boeing approach mode @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'approach');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-boeing-approach.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Boeing full deck @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'full-deck');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-boeing-full-deck.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Airbus FMC focus @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await switchToAirbus(page);
    await setCockpitMode(page, 'fmc-focus');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-airbus-fmc-focus.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Airbus navigation mode @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await switchToAirbus(page);
    await setCockpitMode(page, 'navigation');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-airbus-navigation.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Airbus automation mode @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await switchToAirbus(page);
    await setCockpitMode(page, 'automation');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-airbus-automation.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Airbus approach mode @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await switchToAirbus(page);
    await setCockpitMode(page, 'approach');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-airbus-approach.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Airbus full deck @Visual Regression', async ({ page }) => {
    await prepareCockpit(page);
    await switchToAirbus(page);
    await setCockpitMode(page, 'full-deck');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
    await expect(page.locator('.cockpit-grid')).toHaveScreenshot('cockpit-airbus-full-deck.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Full deck has all required panels', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'full-deck');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();
  });

  test('Help sidebar is docked and not overlaying stage', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'fmc-focus');
    await page.waitForTimeout(500);
    const sidebar = page.locator('.mode-help-sidebar');
    if (await sidebar.isVisible()) {
      const stage = page.locator('.cockpit-main__stage');
      const sidebarBox = await sidebar.boundingBox();
      const stageBox = await stage.boundingBox();
      if (sidebarBox && stageBox) {
        expect(sidebarBox.x + sidebarBox.width).toBeLessThanOrEqual(stageBox.x + 1);
      }
    }
  });

  test('Panel tray is docked', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'fmc-focus');
    await page.waitForTimeout(500);
    const tray = page.locator('.panel-tray-dock');
    await expect(tray).toBeVisible();
  });
});
