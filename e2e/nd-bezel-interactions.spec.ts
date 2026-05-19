import { test, expect } from '@playwright/test';
import { dismissWelcome } from './helpers';

test.describe('Navigation Display Bezel Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visual/nd/boeing-map');
    await dismissWelcome(page);
    await page.evaluate(() => {
      const pfd = document.querySelector('[data-testid="pfd-panel"]');
      if (pfd) (pfd as HTMLElement).style.display = 'none';
    });
    await expect(page.getByTestId('nd-panel')).toBeVisible();
  });

  test('visual elements render and overlay buttons toggle overlays successfully', async ({ page }) => {
    const overlays = ['wpt', 'arpt', 'sta', 'data', 'pos', 'terr', 'wxr', 'tfc'];
    for (const key of overlays) {
      const btn = page.getByTestId(`nd-overlay-btn-${key}`);
      await expect(btn).toBeVisible();
    }

    const ctrBtn = page.getByTestId('nd-center-btn');
    await expect(ctrBtn).toBeVisible();

    const rangeKnob = page.getByTestId('nd-range-knob');
    await expect(rangeKnob).toBeVisible();

    const wptBtn = page.getByTestId('nd-overlay-btn-wpt');
    let isWptActive = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.overlays.wpt);
    expect(isWptActive).toBe(true);

    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="nd-overlay-btn-wpt"]') as HTMLButtonElement;
      if (btn) btn.click();
    });
    isWptActive = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.overlays.wpt);
    expect(isWptActive).toBe(false);

    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="nd-overlay-btn-wpt"]') as HTMLButtonElement;
      if (btn) btn.click();
    });
    isWptActive = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.overlays.wpt);
    expect(isWptActive).toBe(true);

    let isCentered = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.centered);
    expect(isCentered).toBeFalsy();

    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="nd-center-btn"]') as HTMLButtonElement;
      if (btn) btn.click();
    });
    isCentered = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.centered);
    expect(isCentered).toBe(true);

    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="nd-center-btn"]') as HTMLButtonElement;
      if (btn) btn.click();
    });
    isCentered = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.centered);
    expect(isCentered).toBeFalsy();
  });

  test('range knob increments and decrements the range step-by-step and rotates visually', async ({ page }) => {
    const rangeKnob = page.getByTestId('nd-range-knob');
    const pointer = page.getByTestId('nd-range-knob-pointer');

    let currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(40);

    let style = (await pointer.getAttribute('style')) || '';
    expect(style).toContain('rotate(-19.28');

    await rangeKnob.click({ button: 'right', force: true });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(80);

    style = (await pointer.getAttribute('style')) || '';
    expect(style).toContain('rotate(19.28');

    await rangeKnob.click({ button: 'right', force: true });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(160);

    style = (await pointer.getAttribute('style')) || '';
    expect(style).toContain('rotate(57.85');

    await rangeKnob.click({ button: 'left', force: true });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(80);

    await rangeKnob.click({ button: 'left', force: true });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(40);

    await rangeKnob.click({ button: 'left', force: true });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(20);

    style = (await pointer.getAttribute('style')) || '';
    expect(style).toContain('rotate(-57.85');
  });

  test('range knob handles wheel events and suppresses context menus', async ({ page }) => {
    const rangeKnob = page.getByTestId('nd-range-knob');

    let currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(40);

    await rangeKnob.dispatchEvent('wheel', { deltaY: -100 });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(80);

    await rangeKnob.dispatchEvent('wheel', { deltaY: 100 });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(40);

    await rangeKnob.dispatchEvent('wheel', { deltaY: 100 });
    currentRange = await page.evaluate(() => (window as any).useFMCStore.getState().efisL.range);
    expect(currentRange).toBe(20);

    const defaultPrevented = await page.evaluate(() => {
      const knob = document.querySelector('[data-testid="nd-range-knob"]');
      if (!knob) return false;
      const event = new MouseEvent('contextmenu', { cancelable: true, bubbles: true });
      knob.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(defaultPrevented).toBe(true);
  });
});
