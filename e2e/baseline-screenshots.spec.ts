import { test, expect, type Page, type TestInfo } from '@playwright/test';

interface CaptureRecord {
  name: string;
  path: string;
  viewport: { width: number; height: number } | null;
  aircraft: string | null;
  pageTitle: string;
}

async function dismissWelcome(page: Page) {
  const skipButton = page.locator('button:has-text("Skip Demo")');
  try {
    await skipButton.waitFor({ state: 'visible', timeout: 10000 });
    await skipButton.click();
    // Wait for the overlay to actually disappear
    await expect(page.locator('text=VirtualCDU')).toBeHidden({ timeout: 5000 });
  } catch (e) {
    // If not visible, maybe it's already dismissed or didn't appear
  }
}

async function press(page: Page, label: string) {
  const btn = page.getByRole('button', { name: label, exact: true }).first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
}

async function lsk(page: Page, id: string) {
  await page.getByRole('button', { name: `LSK ${id}`, exact: true }).click();
}

async function enterText(page: Page, value: string) {
  for (const char of value) {
    if (char === ' ') await press(page, 'SP');
    else await press(page, char);
  }
}

async function capture(page: Page, testInfo: TestInfo, records: CaptureRecord[], name: string) {
  // Ensure network is idle and styles are applied
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Wait for either the screen or the welcome title
  await Promise.race([
    page.waitForSelector('.bg-cdu-screen', { timeout: 30000 }),
    page.waitForSelector('text=VirtualCDU', { timeout: 30000 }),
  ]);

  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({
    path,
    fullPage: true,
    animations: 'disabled',
  });
  records.push({
    name,
    path,
    viewport: page.viewportSize(),
    aircraft: await page
      .locator('text=/BOEING 737-800|AIRBUS A320/')
      .first()
      .textContent()
      .catch(() => null),
    pageTitle: await page
      .locator('.bg-cdu-screen')
      .first()
      .innerText()
      .then((text) => text.split('\n')[0] ?? '')
      .catch(() => ''),
  });
}

async function seedBoeingRoute(page: Page) {
  await page.goto('/');
  await dismissWelcome(page);
  await press(page, 'RTE');
  await enterText(page, 'KJFK');
  await lsk(page, 'L1');
  await enterText(page, 'KDCA');
  await lsk(page, 'L3');
  await lsk(page, 'L6');
  await enterText(page, 'KJFK DCT RBV DIXIE KDCA');
  await lsk(page, 'L1');
}

test.describe('VirtualCDU baseline screenshots', () => {
  test.skip(!process.env.CAPTURE_BASELINE, 'Baseline capture only runs through npm run capture:baseline');
  test.setTimeout(120_000);

  test('captures Phase 0 desktop baseline screens', async ({ page }, testInfo) => {
    const records: CaptureRecord[] = [];
    await page.goto('/');
    await capture(page, testInfo, records, '00-welcome-boeing');
    await dismissWelcome(page);
    await capture(page, testInfo, records, '01-boeing-ident');

    await lsk(page, 'L1');
    await capture(page, testInfo, records, '02-boeing-pos-init');
    await enterText(page, 'KJFK');
    await lsk(page, 'L1');
    await enterText(page, 'A12');
    await lsk(page, 'L3');
    await capture(page, testInfo, records, '03-boeing-pos-init-filled');

    await press(page, 'RTE');
    await capture(page, testInfo, records, '04-boeing-rte-page-1');
    await enterText(page, 'KJFK');
    await lsk(page, 'L1');
    await enterText(page, 'KDCA');
    await lsk(page, 'L3');
    await enterText(page, 'AA123');
    await lsk(page, 'R1');
    await capture(page, testInfo, records, '05-boeing-rte-page-1-filled');
    await lsk(page, 'L6');
    await capture(page, testInfo, records, '06-boeing-rte-page-2');
    await enterText(page, 'KJFK DCT RBV DIXIE KDCA');
    await lsk(page, 'L1');
    await capture(page, testInfo, records, '07-boeing-rte-page-2-route');
    await lsk(page, 'R3');
    await capture(page, testInfo, records, '08-boeing-legs');

    await press(page, 'DEP ARR');
    await capture(page, testInfo, records, '09-boeing-dep-arr-dep');
    await enterText(page, 'MERIT4');
    await lsk(page, 'L2');
    await enterText(page, '04L');
    await lsk(page, 'L3');
    await capture(page, testInfo, records, '10-boeing-dep-arr-dep-filled');
    await lsk(page, 'L6');
    await capture(page, testInfo, records, '11-boeing-dep-arr-arr');

    await press(page, 'PERF');
    await capture(page, testInfo, records, '12-boeing-perf-init');
    await enterText(page, '350');
    await lsk(page, 'L1');
    await enterText(page, '45');
    await lsk(page, 'L3');
    await capture(page, testInfo, records, '13-boeing-perf-init-filled');
    await lsk(page, 'L5');
    await capture(page, testInfo, records, '14-boeing-thrust-lim');
    await lsk(page, 'L6');
    await capture(page, testInfo, records, '15-boeing-takeoff-ref');
    await enterText(page, '120');
    await lsk(page, 'R2');
    await capture(page, testInfo, records, '16-boeing-invalid-vspeed');

    await press(page, 'CLB');
    await capture(page, testInfo, records, '17-boeing-clb');
    await press(page, 'CRZ');
    await capture(page, testInfo, records, '18-boeing-crz');
    await press(page, 'DES');
    await capture(page, testInfo, records, '19-boeing-des');
    await press(page, 'DIR INTC');
    await capture(page, testInfo, records, '20-boeing-dir-intc');
    await press(page, 'N1 LIMIT');
    await capture(page, testInfo, records, '21-boeing-n1-limit');
    await press(page, 'HOLD');
    await capture(page, testInfo, records, '22-boeing-hold');
    await enterText(page, 'RBV');
    await lsk(page, 'L1');
    await capture(page, testInfo, records, '23-boeing-hold-exec-lit');
    await press(page, 'FIX');
    await capture(page, testInfo, records, '24-boeing-fix');
    await press(page, 'PROG');
    await capture(page, testInfo, records, '25-boeing-progress');
    await press(page, 'MENU');
    await capture(page, testInfo, records, '26-boeing-menu');

    await page.goto('/');
    await page.getByRole('button', { name: /Full Preflight/ }).click();
    await capture(page, testInfo, records, '27-tutorial-active');

    await page.goto('/');
    await page.getByRole('button', { name: 'A320neo', exact: true }).click();
    await capture(page, testInfo, records, '28-welcome-airbus');
    await dismissWelcome(page);
    await capture(page, testInfo, records, '29-airbus-init-a');
    await press(page, 'INIT');
    await lsk(page, 'R6');
    await capture(page, testInfo, records, '30-airbus-init-b');
    await press(page, 'F-PLN');
    await capture(page, testInfo, records, '31-airbus-f-pln');
    await lsk(page, 'L1');
    await capture(page, testInfo, records, '32-airbus-dep-arr');
    await press(page, 'PERF');
    await capture(page, testInfo, records, '33-airbus-perf-takeoff');
    await lsk(page, 'R6');
    await capture(page, testInfo, records, '34-airbus-perf-appr');
    await press(page, 'PROG');
    await capture(page, testInfo, records, '35-airbus-prog');
    await press(page, 'RAD NAV');
    await capture(page, testInfo, records, '36-airbus-rad-nav');
    await press(page, 'DATA');
    await capture(page, testInfo, records, '37-airbus-data-index');
    await press(page, 'DIR');
    await capture(page, testInfo, records, '38-airbus-dir');

    await page.goto('/');
    await dismissWelcome(page);
    await page.getByRole('button', { name: /DISCONNECTED/ }).click();
    await capture(page, testInfo, records, '39-connection-diagnostics-disconnected');

    await testInfo.attach('baseline-manifest', {
      body: JSON.stringify(records, null, 2),
      contentType: 'application/json',
    });
  });

  test('captures iPad portrait and landscape baselines', async ({ page }, testInfo) => {
    const records: CaptureRecord[] = [];
    await page.setViewportSize({ width: 1024, height: 768 });
    await seedBoeingRoute(page);
    await capture(page, testInfo, records, '40-ipad-landscape-legs');

    await page.setViewportSize({ width: 768, height: 1024 });
    await seedBoeingRoute(page);
    await capture(page, testInfo, records, '41-ipad-portrait-legs');

    await testInfo.attach('baseline-manifest', {
      body: JSON.stringify(records, null, 2),
      contentType: 'application/json',
    });
  });
});
