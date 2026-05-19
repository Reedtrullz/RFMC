import { test, expect } from '@playwright/test';
import { dismissWelcome, expectScreenText, pressCdu as press, lsk, enterText } from './helpers';

async function pressFunction(page, label: string) {
  await press(page, label);
}

test.setTimeout(60000); // Global 60s timeout for complex FMS flows

test.describe('VirtualCDU Basic', () => {
  test('loads IDENT page with aircraft model', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await expectScreenText(page, 'IDENT');
    await expectScreenText(page, '737-800');
  });

  test('navigates to RTE page', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);
    await press(page, 'RTE');
    await expectScreenText(page, 'RTE');
    await expectScreenText(page, 'ORIGIN');
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
    await expectScreenText(page, 'INIT');
  });

  test('completes Boeing preflight flow through TAKEOFF REF', async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto('/');
    await dismissWelcome(page);

    await lsk(page, 'R6');
    await expectScreenText(page, 'POS INIT');
    await lsk(page, 'L4'); // ALIGN IRS
    await page.waitForTimeout(5000); // Wait for IRS alignment and stabilization
    await enterText(page, 'KJFK');
    await lsk(page, 'L2');
    await enterText(page, 'A12');
    await lsk(page, 'L3');
    await lsk(page, 'R6');

    await expectScreenText(page, 'RTE');
    await enterText(page, 'AA123');
    await lsk(page, 'R1');
    await enterText(page, 'KDCA');
    await lsk(page, 'L2');
    await press(page, 'NEXT');
    await enterText(page, 'KJFK DCT RBV DIXIE KDCA');
    await lsk(page, 'L1');
    await lsk(page, 'R3');
    await expectScreenText(page, 'RBV');
    // ND should show the waypoints
    await expect(page.getByTestId('nd-panel')).toContainText('RBV', { timeout: 10000 });
    await expectScreenText(page, 'LEGS');
    await expectScreenText(page, 'DIXIE');

    await press(page, 'DEP ARR');
    await enterText(page, 'MERIT4');
    await lsk(page, 'L2');
    await enterText(page, '04L');
    await lsk(page, 'L3');
    await press(page, 'NEXT');
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

    await expectScreenText(page, '130');
    await expectScreenText(page, '135');
    await expectScreenText(page, '140');
  });

  test('shows HOLD and multiple FIX overlays on the ND training display', async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto('/');
    await dismissWelcome(page);

    // Seed a route with RBV directly via store to ensure HOLD validation passes
    await page.evaluate(() => {
      const store = (window as any).useFMCStore;
      if (!store) return;
      store.setState({
        flightPlan: {
          origin: 'KJFK',
          destination: 'KDCA',
          flightNumber: '',
          route: 'KJFK DCT RBV KDCA',
          waypoints: [
            { ident: 'KJFK', discontinuity: false },
            { ident: 'RBV', discontinuity: false },
            { ident: 'KDCA', discontinuity: false },
          ],
        },
        isModified: false,
        execLit: false,
        currentPage: 'RTE',
      });
      // Set IRS to NAV in the AircraftStore so ND symbology renders
      const acStore = (window as any).useAircraftStore;
      if (acStore) {
        acStore.setState({
          position: { ...acStore.getState().position, irsState: 'NAV' },
        });
      }
    });
    await page.waitForTimeout(1000);

    // Ensure cockpit mode with ND visible (navigation layout)
    await page.evaluate(() => {
      const cockpit = (window as any).useCockpitLayoutStore?.getState();
      if (cockpit) cockpit.setCockpitMode(true);
    });
    await expect(page.getByTestId('layout-mode-navigation')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('layout-mode-navigation').click();

    await press(page, 'HOLD');
    await expectScreenText(page, 'HOLD');

    await enterText(page, 'RBV');
    await lsk(page, 'L1');

    await expect(page.getByTestId('scratchpad')).not.toContainText('INVALID');
    await expectScreenText(page, 'RBV');

    await press(page, 'EXEC');
    await expect(page.getByTestId('nd-hold-overlay')).toBeVisible();

    await pressFunction(page, 'FIX');
    await enterText(page, 'KJFK');
    await lsk(page, 'L1');
    await enterText(page, '180');
    await press(page, '/');
    await enterText(page, '20');
    await lsk(page, 'L2');
    await enterText(page, 'DIXIE');
    await lsk(page, 'R1');
    await enterText(page, '270');
    await press(page, '/');
    await enterText(page, '35');
    await lsk(page, 'R2');
    await expect(page.getByTestId('nd-fix-overlay')).toHaveCount(2);
  });

  test('runs Airbus INIT, F-PLN, DEP/ARR, and PERF TO entries', async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto('/');
    await page.locator('button:has-text("A320neo")').click();
    await dismissWelcome(page);

    await enterText(page, 'KJFK/KDCA');
    await lsk(page, 'R1');
    await lsk(page, 'L6'); // ALIGN IRS
    await page.waitForTimeout(5000); // Wait for IRS alignment and stabilization
    await enterText(page, 'AA123');
    await lsk(page, 'L2');
    await enterText(page, '45');
    await lsk(page, 'L3');
    await enterText(page, '350');
    await lsk(page, 'L4');
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
    await lsk(page, 'L2');
    await enterText(page, '140');
    await lsk(page, 'L3');
    await enterText(page, 'CONF2');
    await lsk(page, 'L5');
    await enterText(page, '55');
    await lsk(page, 'L6');

    await expectScreenText(page, '130');
    await expectScreenText(page, 'CONF2');
    await expectScreenText(page, '55°');
  });

  test('imports SimBrief plan from mocked API response', async ({ page }) => {
    await page.route('https://www.simbrief.com/api/xml.fetcher.php**', async (route) => {
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
    await expect(page.getByTestId('nd-panel')).toContainText('RBV');
  });

  test('keeps ND context available without covering CDU controls on iPad', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);

    // Enter cockpit mode so layout-mode-navigation is available
    await page.evaluate(() => {
      const cockpit = (window as any).useCockpitLayoutStore?.getState();
      if (cockpit) cockpit.setCockpitMode(true);
    });

    // Set iPad landscape viewport (avoids portrait orientation overlay)
    await page.setViewportSize({ width: 1024, height: 768 });

    await expect(page.getByTestId('layout-mode-navigation')).toBeVisible({ timeout: 10000 });

    // Switch to Navigation mode which shows both ND and CDU
    await page.getByTestId('layout-mode-navigation').click();

    const ndBox = await page.getByTestId('nd-panel').boundingBox();
    const cduBox = await page.getByTestId('cdu-panel').boundingBox();

    expect(ndBox).not.toBeNull();
    expect(cduBox).not.toBeNull();
    // Verify panels don't overlap (allow for bezel in both axes)
    const ndBottom = ndBox!.y + ndBox!.height;
    const ndRight = ndBox!.x + ndBox!.width;
    const cduTop = cduBox!.y;
    const cduLeft = cduBox!.x;
    // Either ND is above CDU (bottom of ND <= top of CDU + bezel)
    // or ND is left of CDU (right of ND <= left of CDU + bezel)
    const verticalOk = ndBottom <= cduTop + 40;
    const horizontalOk = ndRight <= cduLeft + 40;
    expect(verticalOk || horizontalOk).toBe(true);
  });

  test('renders nonblank Boeing and Airbus CDU screenshots', async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);

    // Screenshot Boeing
    const boeingScreen = page.locator('.bg-cdu-screen').first();
    const boeingBuffer = await boeingScreen.screenshot();
    expect(boeingBuffer.byteLength).toBeGreaterThan(5000);
    await expectScreenText(page, 'IDENT');

    // Reload to get welcome screen back for Airbus switch
    await page.goto('/');
    const airbusBtn = page.getByRole('button', { name: 'A320neo' }).first();
    await airbusBtn.click();

    // Ensure we switch to the Airbus shell
    await expect(page.locator('.airbus-mcdu-shell')).toBeVisible({ timeout: 15000 });

    // Wait for display to populate
    await expectScreenText(page, 'INIT');

    // Screenshot Airbus
    const airbusScreen = page.locator('.bg-cdu-screen').first();
    const airbusBuffer = await airbusScreen.screenshot();
    expect(airbusBuffer.byteLength).toBeGreaterThan(4000);
  });
});
