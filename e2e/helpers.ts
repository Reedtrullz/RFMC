import { expect, type Page } from '@playwright/test';

/**
 * Dismisses the welcome/demo modal if it's present.
 */
export async function dismissWelcome(page: Page) {
  // Wait for the app to be somewhat loaded
  await page.waitForLoadState('domcontentloaded');
  
  const skipButton = page.locator('button:has-text("Skip Demo")');
  // Ensure the store is attached to window before evaluating
  await page.waitForFunction(() => (window as any).useFMCStore !== undefined, { timeout: 10000 });
  
  try {
    // Wait for the modal to potentially appear
    await skipButton.waitFor({ state: 'visible', timeout: 3000 });
    await skipButton.click();
    // Ensure it's gone
    await expect(skipButton).toBeHidden({ timeout: 5000 });
    
    // Explicitly set demoMode via the exposed store to ensure fast IRS alignment and other simulation logic
    await page.evaluate(() => {
      if ((window as any).useFMCStore) {
        (window as any).useFMCStore.getState().setMode('ACTIVE');
        (window as any).useFMCStore.getState().setDemoMode(true);
      }
    });
  } catch {
    // Modal already dismissed or not present, but ensure demoMode is still set
    await page.evaluate(() => {
      if ((window as any).useFMCStore) {
        (window as any).useFMCStore.getState().setMode('ACTIVE');
        (window as any).useFMCStore.getState().setDemoMode(true);
      }
    });
  }
  
  // Ensure the trainer is at least in the DOM and visible
  // We use cdu-panel as it exists in both legacy and all Cockpit Mode layouts
  await expect(page.getByTestId('cdu-panel')).toBeVisible({ timeout: 15000 });

  // Optional: If we are in Cockpit Mode, we might want to ensure a specific layout
  // for legacy tests that expect certain panels to be visible.
  const fullDeckBtn = page.getByRole('button', { name: 'Flight Deck Scan' });
  try {
    if (await fullDeckBtn.isVisible()) {
      await fullDeckBtn.click();
      // Wait for any of the main panels to be visible to confirm layout change
      await page.waitForSelector('[data-testid$="-panel"]', { state: 'visible', timeout: 5000 });
    }
  } catch (e) {
    // Layout switch failed or button disappeared, continue anyway
  }
}

/**
 * Asserts that the CDU display grid contains specific text.
 * This avoids ambiguity with hidden accessibility elements.
 */
export async function expectScreenText(page: Page, text: string) {
  // Try the new dedicated sr-only text tag first
  let display = page.getByTestId('main-cdu-display-text').first();
  if (await display.count() === 0) {
    // Fallback to the generic one
    display = page.locator('.cdu-display-container pre.sr-only').first();
  }
  
  // Use a longer timeout for the FMS to initialize and render the text
  await expect(display).toContainText(text, { timeout: 30000 });
}

/**
 * Presses a CDU function key or alphanumeric key.
 */
export async function pressCdu(page: Page, label: string) {
  // Try variant-based data-testids (more specific)
  const variants = ['function', 'boeing', 'airbus', 'exec', 'lsk'];
  const labelsToTry = [label, label.replace(/_/g, ' ')];
  
  for (const variant of variants) {
    for (const l of labelsToTry) {
      const btn = page.getByTestId(`key-${variant}-${l}`).first();
      if (await btn.count()) {
        await btn.dispatchEvent('click');
        await page.waitForTimeout(250);
        return;
      }
    }
  }

  // Fallback for legacy testid format or generic matching
  const fallback = page.locator(`[data-testid^="key-"][data-testid$="-${label}"]`).first();
  if (await fallback.count()) {
    await fallback.dispatchEvent('click');
    await page.waitForTimeout(250);
    return;
  }

  const candidates =
    label === '/' ? ['/', 'SLASH'] :
    label === '.' ? ['.', 'DOT'] :
    label === ' ' ? ['SP', 'SPACE'] :
    [label];

  for (const name of candidates) {
    const button = page.getByRole('button', { name, exact: true }).first();
    if (await button.count()) {
      await button.dispatchEvent('click');
      // Delay to let the scratchpad update and FMS process
      await page.waitForTimeout(250);
      return;
    }
  }

  throw new Error(`No CDU button found for "${label}"`);
}

/**
 * Helper for Line Select Keys (L1-L6, R1-R6)
 */
export async function lsk(page: Page, id: string) {
  // Try data-testid first
  const testIdButton = page.getByTestId(`key-lsk-${id.toUpperCase()}`).first();
  if (await testIdButton.count()) {
    await testIdButton.dispatchEvent('click');
    await page.waitForTimeout(500);
    return;
  }

  // Fallback to name
  const button = page.getByRole('button', { name: `LSK ${id.toUpperCase()}`, exact: true }).first();
  if (await button.count()) {
    await button.dispatchEvent('click');
    // Delay after LSK as it often triggers page changes or state updates
    await page.waitForTimeout(500);
    return;
  }

  throw new Error(`No LSK button found for "${id}"`);
}

/**
 * Enters multiple characters into the CDU scratchpad.
 * Extremely robust: retries the key press if the scratchpad doesn't update.
 */
export async function enterText(page: Page, text: string) {
  let expected = '';

  for (const char of text) {
    const key =
      char === ' ' ? 'SP' :
      char === '/' ? '/' :
      char === '.' ? '.' :
      char;

    await expect(async () => {
      const current = await page.evaluate(() => (window as any).useFMCStore?.getState().scratchpad || '');
      if (current.includes(expected + char)) return;

      await pressCdu(page, key);

      const after = await page.evaluate(() => (window as any).useFMCStore?.getState().scratchpad || '');
      if (!after.includes(expected + char)) {
        throw new Error(`Scratchpad did not reflect "${char}". Got "${after}", expected to include "${expected + char}"`);
      }
    }).toPass({ timeout: 4000, intervals: [500] });

    expected += char;
  }
}
