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

async function focusPanel(page: Page, panel: string) {
  await page.evaluate((panelId) => {
    const store = (window as any).useCockpitLayoutStore;
    if (store) store.getState().setFocusedPanel(panelId);
  }, panel);
  await page.waitForTimeout(500);
}

/**
 * Switch to Airbus A320 via the exposed aircraft store.
 * The "A320neo" UI button lives inside DemoWelcome, which is dismissed.
 */
async function switchToAirbus(page: Page) {
  await page.evaluate(() => {
    (window as any).useAircraftStore?.getState().setAircraft('AIRBUS_A320');
    (window as any).useFMCStore?.setState({ mode: 'ACTIVE' });
  });
  await page.waitForTimeout(500);
}

/**
 * Navigate to the app, set viewport, and dismiss the welcome modal.
 */
async function prepareCockpit(page: Page) {
  await page.addInitScript(() => localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true'));
  await page.goto('/');
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await dismissWelcome(page);
  await page.evaluate(() => {
    (window as any).useFMCStore?.setState({ mode: 'ACTIVE' });
  });
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

  for (const panel of ['cdu', 'nd', 'pfd', 'autoflight']) {
    test(`Boeing focused ${panel} panel @Visual Regression`, async ({ page }) => {
      await prepareCockpit(page);
      await setCockpitMode(page, panel === 'cdu' ? 'fmc-focus' : panel === 'nd' ? 'navigation' : 'automation');
      await focusPanel(page, panel);
      await expect(
        page.getByRole('dialog', {
          name: new RegExp(`${panel === 'autoflight' ? 'Autoflight' : panel.toUpperCase()} focus mode`, 'i'),
        }),
      ).toBeVisible();
      await expect(page.getByTestId(`focused-${panel}-panel`)).toBeVisible();
      await expect(page.getByTestId(`focused-${panel}-panel`)).toHaveScreenshot(`focused-boeing-${panel}.png`, {
        maxDiffPixelRatio: 0.04,
      });
    });

    test(`Airbus focused ${panel} panel @Visual Regression`, async ({ page }) => {
      await prepareCockpit(page);
      await switchToAirbus(page);
      await setCockpitMode(page, panel === 'cdu' ? 'fmc-focus' : panel === 'nd' ? 'navigation' : 'automation');
      await focusPanel(page, panel);
      await expect(
        page.getByRole('dialog', {
          name: new RegExp(`${panel === 'autoflight' ? 'Autoflight' : panel.toUpperCase()} focus mode`, 'i'),
        }),
      ).toBeVisible();
      await expect(page.getByTestId(`focused-${panel}-panel`)).toBeVisible();
      await expect(page.getByTestId(`focused-${panel}-panel`)).toHaveScreenshot(`focused-airbus-${panel}.png`, {
        maxDiffPixelRatio: 0.04,
      });
    });
  }

  test('Automation layout keeps MCP/FCU above PFD and ND', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'automation');
    const autoflight = await page.getByTestId('autoflight-panel').boundingBox();
    const pfd = await page.getByTestId('pfd-panel').boundingBox();
    const nd = await page.getByTestId('nd-panel').boundingBox();

    expect(autoflight).not.toBeNull();
    expect(pfd).not.toBeNull();
    expect(nd).not.toBeNull();
    expect(autoflight!.y + autoflight!.height).toBeLessThanOrEqual(Math.min(pfd!.y, nd!.y) + 8);
    expect(Math.abs(pfd!.height - nd!.height)).toBeLessThanOrEqual(90);
  });

  test('Focused panel remains inside viewport', async ({ page }) => {
    await prepareCockpit(page);
    await setCockpitMode(page, 'automation');
    await focusPanel(page, 'autoflight');
    const overlay = await page.locator('.focus-overlay').boundingBox();
    const panel = await page.getByTestId('focused-autoflight-panel').boundingBox();

    expect(overlay).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(overlay!.x);
    expect(panel!.y).toBeGreaterThanOrEqual(overlay!.y);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(overlay!.x + overlay!.width + 1);
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(overlay!.y + overlay!.height + 1);
  });

  for (const aircraft of ['boeing', 'airbus']) {
    test(`${aircraft} tablet landscape full deck @Visual Regression`, async ({ page }) => {
      await prepareCockpit(page);
      await page.setViewportSize({ width: 1194, height: 834 });
      if (aircraft === 'airbus') await switchToAirbus(page);
      await setCockpitMode(page, 'full-deck');
      await expect(page.getByTestId('autoflight-panel')).toBeVisible();
      await expect(page.getByTestId('pfd-panel')).toBeVisible();
      await expect(page.getByTestId('nd-panel')).toBeVisible();
      await expect(page.getByTestId('cdu-panel')).toBeVisible();
      await expect(page.locator('.cockpit-grid')).toHaveScreenshot(`tablet-${aircraft}-full-deck.png`, {
        maxDiffPixelRatio: 0.04,
      });
    });

    test(`${aircraft} tablet landscape automation @Visual Regression`, async ({ page }) => {
      await prepareCockpit(page);
      await page.setViewportSize({ width: 1194, height: 834 });
      if (aircraft === 'airbus') await switchToAirbus(page);
      await setCockpitMode(page, 'automation');
      await expect(page.getByTestId('autoflight-panel')).toBeVisible();
      await expect(page.getByTestId('pfd-panel')).toBeVisible();
      await expect(page.getByTestId('nd-panel')).toBeVisible();
      await expect(page.locator('.cockpit-grid')).toHaveScreenshot(`tablet-${aircraft}-automation.png`, {
        maxDiffPixelRatio: 0.04,
      });
    });
  }
});
