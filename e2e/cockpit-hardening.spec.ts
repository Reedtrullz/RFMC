import { test, expect } from '@playwright/test';
import { dismissWelcome } from './helpers';

test.describe('Portrait cockpit touch sizing', () => {
  test.describe.configure({ retries: 0 });
  test.use({ viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true });

  test('CDU keys remain reachable at touch size after orientation changes @smoke', async ({ page }) => {
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
    const ndToggle = page.getByRole('button', { name: 'ND', exact: true });
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
    await headingKnob.dispatchEvent('mousedown', { button: 0 });
    await page.waitForTimeout(700);
    await headingKnob.dispatchEvent('mouseup');
    await expect(page.getByTestId('pfd-panel').getByText('HDG SEL 000')).toBeVisible();

    await headingKnob.click();
    await expect(page.getByTestId('pfd-panel').getByText('HDG MANAGED')).toBeVisible();
  });
});
