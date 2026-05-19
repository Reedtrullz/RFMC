import { expect, type Locator, type Page } from '@playwright/test';
import { dismissWelcome } from '../helpers';

export type CockpitPanelId = 'cdu' | 'nd' | 'pfd' | 'autoflight';
export type CockpitAircraft = 'boeing' | 'airbus';

const PANEL_TEST_ID: Record<CockpitPanelId, string> = {
  cdu: 'cdu-panel',
  nd: 'nd-panel',
  pfd: 'pfd-panel',
  autoflight: 'autoflight-panel',
};

export async function prepareCockpit(page: Page) {
  await page.addInitScript(() => localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true'));
  await page.goto('/');
  await dismissWelcome(page);
  await page.evaluate(() => {
    (window as any).useFMCStore?.setState({ mode: 'ACTIVE' });
  });
  await page.waitForTimeout(300);
}

export async function switchAircraft(page: Page, aircraft: CockpitAircraft) {
  if (aircraft === 'airbus') {
    await page.evaluate(() => {
      (window as any).useAircraftStore?.getState().setAircraft('AIRBUS_A320');
      (window as any).useFMCStore?.setState({ mode: 'ACTIVE' });
    });
  } else {
    await page.evaluate(() => {
      (window as any).useAircraftStore?.getState().setAircraft('BOEING_737');
      (window as any).useFMCStore?.setState({ mode: 'ACTIVE' });
    });
  }
  await page.waitForTimeout(300);
}

export async function setCockpitMode(page: Page, mode: string) {
  await page.evaluate((layoutMode) => {
    (window as any).useCockpitLayoutStore?.getState().setCockpitLayoutMode(layoutMode);
  }, mode);
  await page.waitForTimeout(500);
}

export async function focusPanel(page: Page, panel: CockpitPanelId) {
  await page.evaluate((panelId) => {
    (window as any).useCockpitLayoutStore?.getState().setFocusedPanel(panelId);
  }, panel);
  await page.waitForTimeout(500);
}

export function panelLocator(page: Page, panel: CockpitPanelId) {
  return page.getByTestId(PANEL_TEST_ID[panel]);
}

export async function expectVisiblePanel(page: Page, panel: CockpitPanelId) {
  await expect(panelLocator(page, panel)).toBeVisible();
}

export async function expectPanelNotClipped(page: Page, panel: CockpitPanelId) {
  const stageBox = await page.locator('.cockpit-main__stage').boundingBox();
  const panelBox = await panelLocator(page, panel).boundingBox();

  expect(stageBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.x).toBeGreaterThanOrEqual(stageBox!.x - 1);
  expect(panelBox!.y).toBeGreaterThanOrEqual(stageBox!.y - 1);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(stageBox!.x + stageBox!.width + 1);
  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height + 1);
}

export async function expectPanelPairAligned(page: Page, first: CockpitPanelId, second: CockpitPanelId) {
  const firstBox = await panelLocator(page, first).boundingBox();
  const secondBox = await panelLocator(page, second).boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThanOrEqual(80);
  expect(Math.abs(firstBox!.height - secondBox!.height)).toBeLessThanOrEqual(140);
}

export async function expectAutoflightAboveDisplays(page: Page) {
  const autoflight = await panelLocator(page, 'autoflight').boundingBox();
  const pfd = await panelLocator(page, 'pfd').boundingBox();
  const nd = await panelLocator(page, 'nd').boundingBox();

  expect(autoflight).not.toBeNull();
  expect(pfd).not.toBeNull();
  expect(nd).not.toBeNull();
  expect(autoflight!.y + autoflight!.height).toBeLessThanOrEqual(Math.min(pfd!.y, nd!.y) + 8);
}

export async function expectStageUsesViewport(page: Page, ratios = { minWidthRatio: 0.58, minHeightRatio: 0.58 }) {
  const viewport = page.viewportSize();
  const stageBox = await page.locator('.cockpit-main__stage').boundingBox();

  expect(viewport).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(stageBox!.width).toBeGreaterThanOrEqual(viewport!.width * ratios.minWidthRatio);
  expect(stageBox!.height).toBeGreaterThanOrEqual(viewport!.height * ratios.minHeightRatio);
}

export async function expectPanelGroupUsesViewport(
  page: Page,
  panels: CockpitPanelId[],
  ratios = { minWidthRatio: 0.5, minHeightRatio: 0.45 },
) {
  const viewport = page.viewportSize();
  const boxes = await Promise.all(panels.map((panel) => panelLocator(page, panel).boundingBox()));
  const presentBoxes = boxes.filter((box): box is NonNullable<typeof box> => !!box);

  expect(viewport).not.toBeNull();
  expect(presentBoxes.length).toBe(panels.length);

  const left = Math.min(...presentBoxes.map((box) => box.x));
  const top = Math.min(...presentBoxes.map((box) => box.y));
  const right = Math.max(...presentBoxes.map((box) => box.x + box.width));
  const bottom = Math.max(...presentBoxes.map((box) => box.y + box.height));

  expect(right - left).toBeGreaterThanOrEqual(viewport!.width * ratios.minWidthRatio);
  expect(bottom - top).toBeGreaterThanOrEqual(viewport!.height * ratios.minHeightRatio);
}

export async function expectHelpSidebarDocked(page: Page) {
  const sidebar = page.locator('.mode-help-sidebar');
  if (!(await sidebar.isVisible().catch(() => false))) return;

  const stage = page.locator('.cockpit-main__stage');
  const sidebarBox = await sidebar.boundingBox();
  const stageBox = await stage.boundingBox();

  expect(sidebarBox).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(sidebarBox!.x + sidebarBox!.width).toBeLessThanOrEqual(stageBox!.x + 1);
}

export async function expectPanelTrayDocked(page: Page) {
  const tray = page.locator('.panel-tray-dock');
  await expect(tray).toBeVisible();

  const viewport = page.viewportSize();
  const trayBox = await tray.boundingBox();

  expect(viewport).not.toBeNull();
  expect(trayBox).not.toBeNull();
  expect(trayBox!.x + trayBox!.width).toBeGreaterThanOrEqual(viewport!.width - trayBox!.width - 4);
}

export async function expectFocusedPanelCentered(page: Page, panel: CockpitPanelId) {
  const overlayBox = await page.locator('.focus-overlay').boundingBox();
  const panelBox = await page.getByTestId(`focused-${panel}-panel`).boundingBox();

  expect(overlayBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.x).toBeGreaterThanOrEqual(overlayBox!.x);
  expect(panelBox!.y).toBeGreaterThanOrEqual(overlayBox!.y);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(overlayBox!.x + overlayBox!.width + 1);
  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(overlayBox!.y + overlayBox!.height + 1);

  const overlayCenterX = overlayBox!.x + overlayBox!.width / 2;
  const panelCenterX = panelBox!.x + panelBox!.width / 2;
  expect(Math.abs(panelCenterX - overlayCenterX)).toBeLessThanOrEqual(Math.max(24, overlayBox!.width * 0.08));
}

export async function expectMainPanelsHealthy(page: Page, panels: CockpitPanelId[]) {
  await expectStageUsesViewport(page);
  await expectPanelGroupUsesViewport(page, panels, {
    minWidthRatio: panels.length === 1 ? 0.2 : panels.length === 2 ? 0.44 : 0.55,
    minHeightRatio: panels.length === 1 ? 0.42 : 0.52,
  });
  await expectHelpSidebarDocked(page);
  await expectPanelTrayDocked(page);
  for (const panel of panels) {
    await expectVisiblePanel(page, panel);
    await expectPanelNotClipped(page, panel);
  }
  if (panels.includes('pfd') && panels.includes('nd')) {
    await expectPanelPairAligned(page, 'pfd', 'nd');
  }
  if (panels.includes('autoflight') && panels.includes('pfd') && panels.includes('nd')) {
    await expectAutoflightAboveDisplays(page);
  }
}

export async function screenshot(locator: Locator, name: string) {
  await expect(locator).toHaveScreenshot(name, { maxDiffPixelRatio: 0.04, timeout: 20_000 });
}
