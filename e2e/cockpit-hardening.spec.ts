import { test, expect } from '@playwright/test';
import { dismissWelcome } from './helpers';

test.describe('Portrait cockpit touch sizing', () => {
  test.use({ viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true });

  test('CDU keys remain reachable at touch size after orientation changes', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cdu-cockpit-mode', JSON.stringify(true));
      localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true');
    });
    await page.goto('/');
    const prompt = page.getByTestId('orientation-prompt');
    if (await prompt.isVisible()) {
      await prompt.getByRole('button', { name: 'Dismiss', exact: true }).click();
    }
    await page.getByRole('button', { name: /Skip Demo/ }).click();
    const a = page.getByTestId('key-boeing-A');
    await expect(a).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await a.focus();
    await expect(a).toBeFocused();
    await page.keyboard.press('a');
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', 'Scratchpad: A');

    const b = page.getByTestId('key-boeing-B');
    await expect
      .poll(async () => {
        const bounds = await b.boundingBox();
        return !!bounds && bounds.width >= 44 && bounds.height >= 44;
      })
      .toBe(true);
    await b.tap();
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', 'Scratchpad: AB');
    await page.getByTestId('key-function-RTE').tap();
    await expect(page.getByTestId('main-cdu-display-text')).toContainText(/RTE|ROUTE/);
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', /^Scratchpad:\s*$/);
    await page.keyboard.press('c');
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', 'Scratchpad: C');

    await page.setViewportSize({ width: 851, height: 393 });
    await expect(page.locator('.cockpit-stage--portrait')).toHaveCount(0);
    await expect(page.getByTestId('key-boeing-A')).toBeVisible();
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', 'Scratchpad: C');
    await page.setViewportSize({ width: 393, height: 851 });
    await expect(prompt).toBeVisible();
    await prompt.getByRole('button', { name: 'Dismiss', exact: true }).tap();
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', 'Scratchpad: C');
    await expect
      .poll(async () => {
        const bounds = await b.boundingBox();
        return !!bounds && bounds.width >= 44 && bounds.height >= 44;
      })
      .toBe(true);
    await b.tap();
    await expect(page.getByTestId('scratchpad')).toHaveAttribute('aria-label', 'Scratchpad: CB');
  });
});

test.describe('Cockpit Hardening & Automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcome(page);

    // Ensure we are in cockpit mode
    const enterButton = page.getByRole('button', { name: 'Enter Cockpit' });
    try {
      await enterButton.waitFor({ state: 'visible', timeout: 5000 });
      await enterButton.click();
    } catch (e) {}

    await expect(page.getByTestId('cockpit-panel-toolbar')).toBeVisible({ timeout: 10000 });
  });

  test('Panel Toolbar toggles visibility', async ({ page }) => {
    // Switch to Navigation layout first
    // Switch to Navigation layout first (Route Verification)
    await page.getByTestId('layout-mode-navigation').click();

    // Check if ND is visible initially
    await expect(page.getByTestId('nd-panel')).toBeVisible({ timeout: 10000 });

    // Toggle ND via toolbar
    const ndToggle = page.getByRole('button', { name: 'Toggle ND panel', exact: true });
    await ndToggle.click();

    // ND should be hidden
    await expect(page.getByTestId('nd-panel')).not.toBeVisible();

    // Toggle back
    await ndToggle.click();
    await expect(page.getByTestId('nd-panel')).toBeVisible();
  });

  test('Focus mode via Esc key', async ({ page }) => {
    const focusButton = page.getByLabel('Focus CDU').first();
    await focusButton.click();

    // Check if focus overlay is present
    await expect(page.locator('.focus-overlay')).toBeVisible();

    // Press Esc to exit focus
    await page.keyboard.press('Escape');
    await expect(page.locator('.focus-overlay')).not.toBeVisible();
  });

  test('Boeing MCP Interaction', async ({ page }) => {
    // Switch to Automation layout
    // Switch to Automation layout (MCP/FCU Mode Training)
    await page.getByTestId('layout-mode-automation').click();

    await expect(page.getByTestId('autoflight-panel')).toBeVisible();

    // Verify Rotary Knob interaction
    const altitudeKnob = page.getByTestId('mcp-altitude-knob').first();
    await altitudeKnob.focus();
    await page.keyboard.press('ArrowUp');
    // Success if no crash and element was focused
  });

  test('Boeing MCP heading and mode changes reach the PFD FMA', async ({ page }) => {
    await page.getByTestId('layout-mode-automation').click();
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();

    await page.getByTestId('mcp-heading-knob').dispatchEvent('wheel', { deltaY: -100 });
    await page.getByRole('button', { name: 'HDG SEL', exact: true }).click();

    await expect(page.getByTestId('pfd-panel').getByText('HDG SEL', { exact: true })).toBeVisible();
    await expect(page.getByTestId('pfd-panel').getByText('HDG SEL 001')).toBeVisible();
  });

  test('Airbus FCU Managed Mode dots', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).useAircraftStore.getState().setAircraft('AIRBUS_A320');
      (window as any).useFMCStore.setState({ mode: 'ACTIVE' });
      (window as any).useCockpitLayoutStore.getState().setCockpitLayoutMode('automation');
    });
    await expect(page.getByTestId('autoflight-panel')).toBeVisible();
    await expect(page.getByTestId('pfd-panel')).toBeVisible();

    const headingKnob = page.getByTestId('push-pull-heading');
    await headingKnob.getByRole('button', { name: 'PULL', exact: true }).click();
    await expect(page.getByTestId('pfd-panel').getByText('HDG SEL 000')).toBeVisible();

    await headingKnob.getByRole('button', { name: 'PUSH', exact: true }).click();
    await expect(page.getByTestId('pfd-panel').getByText('HDG MANAGED')).toBeVisible();
  });
});

// Standalone (non-cockpit) CDU: every key must be at least 44 CSS px and reachable by wheel scrolling.
// Expected key counts come from source: Boeing 69 (BoeingKeypadArea + LSK columns);
// Airbus 72 = 12 LSK + 12 function + BRT/DIM + 4 arrows + 12 number + 25 alpha + Z,/,SP,OVFY,CLR.
const standaloneCdu = [
  { aircraft: 'BOEING_737', keys: 69 },
  { aircraft: 'AIRBUS_A320', keys: 72 },
] as const;
const standaloneViewports = [
  { name: 'touch 393x851', viewport: { width: 393, height: 851 }, touch: true },
  { name: 'desktop 1280x900', viewport: { width: 1280, height: 900 }, touch: false },
];

for (const { name, viewport, touch } of standaloneViewports) {
  test.describe(`Standalone CDU keys at ${name}`, () => {
    test.use({ viewport, isMobile: touch, hasTouch: touch });

    for (const { aircraft, keys } of standaloneCdu) {
      test(`${aircraft} keys are 44px and reachable by wheel scroll`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.addInitScript(() => {
          localStorage.setItem('cdu-cockpit-mode', JSON.stringify(false));
          localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true');
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const prompt = page.getByTestId('orientation-prompt');
        if (await prompt.isVisible()) {
          await prompt.getByRole('button', { name: 'Dismiss', exact: true }).click();
        }
        // Production builds register a service worker and show a fixed offline-ready notification that can cover keys.
        // Dismiss it through its own Dismiss button; the dev server has no registration, so nothing is awaited there.
        const pwa = page.getByTestId('pwa-update-prompt');
        let pwaDismissed = 0;
        const dismissPwa = async () => {
          if (!(await pwa.isVisible())) return;
          const dismiss = pwa.getByRole('button', { name: 'Dismiss', exact: true });
          await (touch ? dismiss.tap() : dismiss.click());
          await expect(pwa).toBeHidden();
          pwaDismissed++;
        };
        const registered = await page.evaluate(async () => !!(await navigator.serviceWorker?.getRegistration()));
        if (registered) {
          await page.evaluate(() => navigator.serviceWorker.ready);
          await expect(pwa).toContainText('offline flight operations');
        }
        await dismissPwa();
        await dismissWelcome(page);
        await page.evaluate((a) => {
          (window as any).useAircraftStore.getState().setAircraft(a);
          (window as any).useFMCStore.setState({ mode: 'ACTIVE' }); // switching aircraft re-opens the welcome modal
        }, aircraft);
        await page.evaluate(() => document.fonts.ready);

        const panel = page.getByTestId('cdu-panel');
        await expect(panel).toBeVisible();
        const buttons = panel.locator('button:not([data-testid="hardware-realism-controls"] button)');
        await expect(buttons).toHaveCount(keys);

        const measure = (index: number) =>
          buttons.nth(index).evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const pr = document.querySelector('[data-testid="cdu-panel"]')!.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const hit = document.elementFromPoint(x, y);
            return {
              label: el.getAttribute('aria-label') ?? el.textContent ?? '',
              width: rect.width,
              height: rect.height,
              inside:
                x > Math.max(pr.left, 0) &&
                x < Math.min(pr.right, innerWidth) &&
                y > Math.max(pr.top, 0) &&
                y < Math.min(pr.bottom, innerHeight) &&
                !!hit &&
                el.contains(hit),
              dx: x - (pr.left + pr.width / 2),
              dy: y - (pr.top + pr.height / 2),
            };
          });

        const undersized: string[] = [];
        const unreachable: string[] = [];
        const box = (await panel.boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        for (let i = 0; i < keys; i++) {
          await dismissPwa(); // a notification arriving mid-flow is dismissed like a user would
          let m = await measure(i);
          if (m.width < 44 || m.height < 44) {
            undersized.push(`#${i} ${m.label} ${m.width.toFixed(1)}x${m.height.toFixed(1)}`);
          }
          for (let step = 0; step < 40 && !m.inside; step++) {
            const before = `${m.dx}/${m.dy}`;
            await page.mouse.wheel(Math.round(m.dx), Math.round(m.dy));
            await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
            m = await measure(i);
            if (`${m.dx}/${m.dy}` === before) break; // nothing scrolled: the key is out of reach
          }
          if (!m.inside) unreachable.push(`#${i} ${m.label}`);
        }
        expect(undersized.length, `keys below 44 CSS px: ${undersized.slice(0, 4).join('; ')}`).toBe(0);
        expect(unreachable.length, `keys not reachable by wheel scroll: ${unreachable.slice(0, 4).join('; ')}`).toBe(0);
        // Scrolled to the end with real wheel input, no control inside the visible CDU area may sit under a floating control.
        await dismissPwa();
        const endBox = (await panel.boundingBox())!;
        await page.mouse.move(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2);
        for (let step = 0; step < 20; step++) {
          const top = await panel.evaluate((el) => el.scrollTop);
          await page.mouse.wheel(0, 400);
          await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
          if ((await panel.evaluate((el) => el.scrollTop)) === top) break;
        }
        await dismissPwa();
        const covered = await panel.locator('button').evaluateAll((els) => {
          const pr = document.querySelector('[data-testid="cdu-panel"]')!.getBoundingClientRect();
          return els.flatMap((el) => {
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            if (x < pr.left || x > pr.right || y < pr.top || y > Math.min(pr.bottom, innerHeight)) return [];
            const hit = document.elementFromPoint(x, y);
            if (hit && el.contains(hit)) return [];
            const label = el.getAttribute('aria-label') ?? el.textContent ?? '';
            return [
              `${label} under ${hit?.closest('[class*="fixed"]')?.textContent?.trim().slice(0, 40) ?? hit?.tagName}`,
            ];
          });
        });
        expect(
          covered,
          'controls inside the visible CDU area covered by floating controls after scrolling to the end',
        ).toEqual([]);
        test
          .info()
          .annotations.push({ type: 'pwa', description: `registered=${registered} dismissed=${pwaDismissed}` });
      });
    }
  });
}
