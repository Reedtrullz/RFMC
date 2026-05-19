import { expect, test, type Locator, type Page } from '@playwright/test';

import { dismissWelcome } from './helpers';
async function enterCockpit(page: Page) {
  await page.goto('/');
  await dismissWelcome(page);
  // Cockpit Mode is now default, just verify we're there
  await expect(page.getByRole('button', { name: 'Preflight FMC Setup' })).toBeVisible();
}

const modeMapping = {
  'FMC Focus': 'fmc-focus',
  Navigation: 'navigation',
  Automation: 'automation',
  'Full Deck': 'full-deck',
} as const;

async function selectMode(page: Page, name: keyof typeof modeMapping) {
  const modeId = modeMapping[name];
  const button = page.getByTestId(`layout-mode-${modeId}`);
  await button.click();
  await expect(button).toHaveClass(/bg-cdu-cyan/);
}

async function expectBox(locator: Locator, minWidth: number, minHeight: number) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(minWidth);
  expect(box!.height).toBeGreaterThan(minHeight);
}

async function expectNoViewportOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.body.scrollWidth,
    scrollHeight: document.body.scrollHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);
}

test.describe('cockpit layout visual sizing', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps FMC Focus CDU readable and contained', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'FMC Focus');

    await expectBox(page.getByTestId('cdu-panel'), 440, 640);
    await expectNoViewportOverflow(page);
  });

  test('keeps Navigation ND and CDU readable as a pair', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'Navigation');

    await expectBox(page.getByTestId('nd-panel'), 280, 380);
    await expectBox(page.getByTestId('cdu-panel'), 380, 580);
    await expectNoViewportOverflow(page);
  });

  test('keeps Automation MCP, PFD, and ND readable', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'Automation');

    await expectBox(page.getByTestId('autoflight-panel'), 580, 160);
    await expectBox(page.getByTestId('pfd-panel'), 280, 380);
    await expectBox(page.getByTestId('nd-panel'), 280, 380);
    await expectNoViewportOverflow(page);
  });

  test('keeps Full Deck overview instruments above minimum readable sizes', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'Full Deck');

    await expectBox(page.getByTestId('autoflight-panel'), 580, 140);
    await expectBox(page.getByTestId('pfd-panel'), 210, 150);
    await expectBox(page.getByTestId('nd-panel'), 210, 150);

    // Verify right-side of MCP is not clipped (Bug fix verification)
    const mcp = page.getByTestId('autoflight-panel');
    await expect(mcp.getByText('CMD A')).toBeVisible();
    await expect(mcp.getByText('CWS B')).toBeVisible();
    await expect(mcp.getByText('VOR LOC')).toBeVisible();

    await expectNoViewportOverflow(page);
  });

  test('Flight Deck Scan has uncluttered readable instrument layout', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);

    await page.getByRole('button', { name: 'Flight Deck Scan' }).click();

    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();

    // Verify secondary panels are NOT visible by default in this mode
    await expect(page.getByText('PRELIGHT CHECKLIST')).not.toBeVisible();
    await expect(page.getByText('Required panels are currently hidden')).not.toBeVisible();

    const mcpBox = await page.getByTestId('autoflight-panel').boundingBox();
    const pfdBox = await page.getByTestId('pfd-panel').boundingBox();
    const ndBox = await page.getByTestId('nd-panel').boundingBox();
    const cduBox = await page.getByTestId('cdu-panel').boundingBox();

    // Verify substantial sizes (ensuring they aren't crushed by overlays)
    expect(mcpBox?.width).toBeGreaterThan(1000);
    expect(pfdBox?.width).toBeGreaterThan(260);
    expect(ndBox?.width).toBeGreaterThan(300);
    expect(cduBox?.width).toBeGreaterThan(260);
  });
});
