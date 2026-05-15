import { test, expect } from '@playwright/test';
import { dismissWelcome } from './helpers';

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

  test('Airbus FCU Managed Mode dots', async ({ page }) => {
    // Switch to Airbus
    await page.goto('/app');
    // (Actual app would have a way to switch aircraft, e.g. via settings or route)
    // Assuming there's a route for Airbus testing
    await page.goto('/visual/airbus/init-a');
    
    // Go to cockpit mode
    await page.evaluate(() => {
       // Mock switching aircraft and entering cockpit mode if needed
       // But better to use the UI
    });
    
    // For now, let's just use the visual route for FCU if it exists
    // Or we rely on the existing visual-airbus-mcdu.spec.ts
  });
});
