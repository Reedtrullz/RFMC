import { test, expect } from '@playwright/test';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function dismissWelcome(page) {
  const skipButton = page.locator('button:has-text("Skip Demo")');
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click();
  }
}

async function press(page, label: string) {
  await page.locator('button.cdu-button').filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) }).first().click();
}

async function pressFunction(page, label: string) {
  await page.locator('button.cdu-button').filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) }).last().click();
}

async function lsk(page, id: string) {
  await page.getByRole('button', { name: `LSK ${id}`, exact: true }).click();
}

async function enterText(page, value: string) {
  for (const char of value) {
    if (char === ' ') await press(page, 'SP');
    else await press(page, char);
  }
}

async function expectScreenText(page, text: string) {
  await expect(page.locator('.bg-cdu-screen').filter({ hasText: text }).first()).toBeVisible();
}

test.describe('VirtualCDU Basic', () => {
  test('loads IDENT page with aircraft model', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await expect(page.locator('text=IDENT')).toBeVisible();
    await expect(page.locator('.bg-cdu-screen >> text=737-800')).toBeVisible();
  });

  test('navigates to RTE page', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await press(page, 'RTE');
    await expect(page.locator('.bg-cdu-screen >> text=RTE')).toBeVisible();
    await expect(page.locator('.bg-cdu-screen >> text=ORIGIN')).toBeVisible();
  });

  test('enters scratchpad text', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await press(page, '1');
    await press(page, '2');
    await expect(page.locator('[data-testid="scratchpad"]')).toContainText('12');
  });

  test('clears scratchpad with CLR', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await press(page, '1');
    await press(page, 'CLR');
    await expect(page.locator('[data-testid="scratchpad"]')).not.toContainText('1');
  });

  test('switches to Airbus mode from welcome', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);
    await expect(page.locator('.bg-cdu-screen >> text=INIT')).toBeVisible();
  });

  test('completes Boeing preflight flow through TAKEOFF REF', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);

    await lsk(page, 'L1');
    await expectScreenText(page, 'POS INIT');
    await enterText(page, 'KJFK');
    await lsk(page, 'L1');
    await enterText(page, 'A12');
    await lsk(page, 'L3');
    await lsk(page, 'L5');

    await expectScreenText(page, 'RTE');
    await enterText(page, 'KJFK');
    await lsk(page, 'L1');
    await enterText(page, 'KDCA');
    await lsk(page, 'L3');
    await enterText(page, 'AA123');
    await lsk(page, 'R1');
    await lsk(page, 'L6');
    await enterText(page, 'KJFK DCT RBV DIXIE KDCA');
    await lsk(page, 'L1');
    await expectScreenText(page, 'RBV');
    await expect(page.getByTestId('navigation-display')).toContainText('RBV');
    await lsk(page, 'R3');

    await expectScreenText(page, 'LEGS');
    await expectScreenText(page, 'DIXIE');

    await press(page, 'DEP ARR');
    await enterText(page, 'MERIT4');
    await lsk(page, 'L2');
    await enterText(page, '04L');
    await lsk(page, 'L3');
    await lsk(page, 'L6');
    await enterText(page, 'FRDMM2');
    await lsk(page, 'L2');
    await enterText(page, 'ILS19');
    await lsk(page, 'L3');

    await press(page, 'PERF');
    await enterText(page, '350');
    await lsk(page, 'L1');
    await enterText(page, '45');
    await lsk(page, 'L3');
    await enterText(page, '130.5');
    await lsk(page, 'R1');
    await enterText(page, '5');
    await lsk(page, 'R3');
    await lsk(page, 'L5');

    await expectScreenText(page, 'THRUST LIM');
    await enterText(page, '45');
    await lsk(page, 'L2');
    await lsk(page, 'L6');

    await expectScreenText(page, 'TAKEOFF REF');
    await enterText(page, '04L');
    await lsk(page, 'L1');
    await enterText(page, '130');
    await lsk(page, 'R1');
    await enterText(page, '135');
    await lsk(page, 'R2');
    await enterText(page, '140');
    await lsk(page, 'R3');
    await enterText(page, '5.5');
    await lsk(page, 'R4');
    await enterText(page, '15');
    await lsk(page, 'L4');
    await enterText(page, '270/10');
    await lsk(page, 'L5');
    await enterText(page, '1013');
    await lsk(page, 'R5');
    await press(page, 'EXEC');

    await expectScreenText(page, '130 KT');
    await expectScreenText(page, '135 KT');
    await expectScreenText(page, '140 KT');
  });

  test('shows HOLD and FIX overlays on the ND training display', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);

    await press(page, 'HOLD');
    await enterText(page, 'RBV');
    await lsk(page, 'L1');
    await expect(page.getByTestId('nd-hold-overlay')).toBeVisible();

    await pressFunction(page, 'FIX');
    await enterText(page, 'KJFK');
    await lsk(page, 'L1');
    await enterText(page, '180');
    await press(page, '/');
    await enterText(page, '20');
    await lsk(page, 'L2');
    await expect(page.getByTestId('nd-fix-overlay')).toBeVisible();
  });

  test('runs Airbus INIT, F-PLN, DEP/ARR, and PERF TO entries', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);

    await enterText(page, 'KJFK/KDCA');
    await lsk(page, 'L1');
    await enterText(page, '50');
    await lsk(page, 'L2');
    await enterText(page, '350');
    await lsk(page, 'L3');
    await expectScreenText(page, 'KJFK/KDCA');

    await press(page, 'F-PLN');
    await expectScreenText(page, 'F-PLN');
    await lsk(page, 'L1');
    await expectScreenText(page, 'DEP/ARR');
    await enterText(page, 'MERIT4');
    await lsk(page, 'L1');
    await enterText(page, '04L');
    await lsk(page, 'L3');
    await enterText(page, 'FRDMM2');
    await lsk(page, 'L5');
    await enterText(page, 'ILS19');
    await lsk(page, 'R1');

    await press(page, 'PERF');
    await enterText(page, '130');
    await lsk(page, 'L1');
    await enterText(page, '135');
    await lsk(page, 'L3');
    await enterText(page, '140');
    await lsk(page, 'L5');
    await enterText(page, 'CONF2');
    await lsk(page, 'R1');
    await enterText(page, '55');
    await lsk(page, 'R3');

    await expectScreenText(page, '130 KT');
    await expectScreenText(page, 'CONF2');
    await expectScreenText(page, '55°C');
  });

  test('imports SimBrief plan from mocked API response', async ({ page }) => {
    await page.route('https://www.simbrief.com/api/xml.fetcher.php**', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          origin: 'KJFK',
          destination: 'KDCA',
          flightNumber: 'AA123',
          route: 'RBV DIXIE',
          crzAlt: 35000,
          costIndex: 45,
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Import SimBrief' }).click();
    await page.getByPlaceholder('123456').fill('123456');
    await page.getByRole('button', { name: 'Import Flight Plan' }).click();

    await expect(page.getByTestId('scratchpad')).toContainText('SIMBRIEF LOADED');
    await dismissWelcome(page);
    await press(page, 'RTE');
    await expectScreenText(page, 'KJFK');
    await expectScreenText(page, 'KDCA');
    await expect(page.getByTestId('navigation-display')).toContainText('RBV');
  });

  test('keeps ND context available without covering CDU controls on iPad', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/');
    await dismissWelcome(page);

    const ndBox = await page.getByTestId('navigation-display').boundingBox();
    const rteBox = await page.getByRole('button', { name: 'RTE', exact: true }).first().boundingBox();

    expect(ndBox).not.toBeNull();
    expect(rteBox).not.toBeNull();
    expect(ndBox!.y + ndBox!.height).toBeLessThanOrEqual(rteBox!.y);

    await page.getByRole('button', { name: 'ND', exact: true }).click();
    await expect(page.getByTestId('navigation-display')).toBeHidden();
    await expect(page.getByRole('button', { name: 'RTE', exact: true }).first()).toBeVisible();
  });

  test('renders nonblank Boeing and Airbus CDU screenshots', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    const boeing = await page.locator('.bg-cdu-screen').first().screenshot();
    expect(boeing.length).toBeGreaterThan(10_000);
    await expectScreenText(page, 'IDENT');

    await page.reload();
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);
    const airbus = await page.locator('.bg-cdu-screen').first().screenshot();
    expect(airbus.length).toBeGreaterThan(10_000);
    await expectScreenText(page, 'INIT');
  });
});
