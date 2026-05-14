import { expect, test, type Locator, type Page } from '@playwright/test';

async function dismissWelcome(page: Page) {
  const skipButton = page.locator('button:has-text("Skip Demo")');
  try {
    await skipButton.waitFor({ state: 'visible', timeout: 5000 });
    await skipButton.click();
  } catch {
    // Welcome may already be dismissed.
  }
}

async function enterCockpit(page: Page) {
  await page.goto('/');
  await dismissWelcome(page);
  await page.getByRole('button', { name: 'Enter Cockpit' }).click();
  await expect(page.getByRole('button', { name: 'FMC Focus' })).toBeVisible();
}

async function selectMode(page: Page, name: string) {
  await page.getByRole('button', { name }).click();
  await expect(page.getByRole('button', { name })).toHaveClass(/bg-cdu-cyan/);
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

    await expectBox(page.getByTestId('boeing-cdu'), 440, 640);
    await expectNoViewportOverflow(page);
  });

  test('keeps Navigation ND and CDU readable as a pair', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'Navigation');

    await expectBox(page.getByTestId('navigation-display'), 280, 380);
    await expectBox(page.getByTestId('boeing-cdu'), 380, 580);
    await expectNoViewportOverflow(page);
  });

  test('keeps Automation MCP, PFD, and ND readable', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'Automation');

    await expectBox(page.getByTestId('autopilot-trainer'), 580, 160);
    await expectBox(page.getByTestId('primary-flight-display'), 280, 380);
    await expectBox(page.getByTestId('navigation-display'), 280, 380);
    await expectNoViewportOverflow(page);
  });

  test('keeps Full Deck overview instruments above minimum readable sizes', async ({ page }) => {
    await enterCockpit(page);
    await selectMode(page, 'Full Deck');

    await expectBox(page.getByTestId('autopilot-trainer'), 580, 150);
    await expectBox(page.getByTestId('primary-flight-display'), 280, 380);
    await expectBox(page.getByTestId('navigation-display'), 280, 380);
    await expectNoViewportOverflow(page);
  });
});
