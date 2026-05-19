import { expect, type Page } from '@playwright/test';

/**
 * Dismisses the welcome/demo modal if it's present.
 */
export async function dismissWelcome(page: Page) {
  // Wait for the app to be fully loaded and network to be idle
  await page.waitForLoadState('networkidle');

  const skipButton = page.locator('button:has-text("Skip Demo")');
  // Ensure the store is attached to window before evaluating
  await page.waitForFunction(() => (window as any).useFMCStore !== undefined, { timeout: 10000 });

  try {
    // Wait for the modal to potentially appear
    await skipButton.waitFor({ state: 'visible', timeout: 3000 });
    await skipButton.click();
    // Ensure it's gone
    await expect(skipButton).toBeHidden({ timeout: 5000 });
  } catch {
    // Modal already dismissed or not present
  }

  // Explicitly set demoMode via the exposed store to ensure fast IRS alignment and other simulation logic
  // We wait for the store to be attached to window before evaluating
  try {
    await page.waitForTimeout(500);
    await page.waitForFunction(() => (window as any).useFMCStore !== undefined, { timeout: 20000 });
    await page.evaluate(() => {
      const fmc = (window as any).useFMCStore?.getState();
      if (fmc) {
        fmc.setMode('ACTIVE');
        fmc.setDemoMode(true);
        localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true');
      }
    });
  } catch (e) {
    // Ignore evaluation errors or timeouts during stabilization
    console.warn('[E2E Helper] dismissWelcome: store initialization timed out or failed');
  }

  // Ensure the trainer is at least in the DOM and visible
  // We use cdu-panel as it exists in both legacy and all Cockpit Mode layouts
  // We wait for it to be visible after the modal is gone, but we don't hard-fail here
  // as some tests might have different layout timings
  try {
    await expect(page.getByTestId('cdu-panel')).toBeVisible({ timeout: 10000 });
  } catch (e) {
    console.warn('[E2E Helper] dismissWelcome: cdu-panel not visible within timeout, continuing...');
  }

  // Only switch to full-deck if we are already confirmed in cockpit mode AND the toolbar is
  // accessible. This avoids racing with tests that enter cockpit mode themselves, and prevents
  // nd-panel timeout in fmc-focus mode (where nd is intentionally hidden).
  //
  // Wrapped in try/catch: an earlier timeout in this function must not cascade into an
  // unhandled rejection that aborts the entire test run.
  let isCockpitReady = false;
  try {
    isCockpitReady = await page.evaluate(() => {
      return (window as any).useCockpitLayoutStore?.getState().cockpitMode === true;
    });
  } catch {
    isCockpitReady = false;
  }

  if (isCockpitReady) {
    const toolbar = page.getByTestId('cockpit-panel-toolbar');
    const toolbarVisible = await toolbar.isVisible().catch(() => false);
    if (toolbarVisible) {
      await ensureTrainingMode(page, 'full-deck');
    }
  }
}

/**
 * Ensures the specified training mode is active.
 */
export async function ensureTrainingMode(page: Page, mode: string) {
  const isCockpit = await page.evaluate(() => {
    return (window as any).useCockpitLayoutStore?.getState().cockpitMode === true;
  });

  if (!isCockpit) return;

  const selector = page.getByTestId(`layout-mode-${mode}`);
  try {
    await selector.waitFor({ state: 'visible', timeout: 5000 });

    // Check current state
    const currentMode = await page.evaluate(() => {
      return (window as any).useCockpitLayoutStore?.getState().cockpitLayoutMode;
    });

    if (currentMode !== mode) {
      await selector.click();
      // Wait for state sync
      await page.waitForFunction(
        (m) => {
          return (window as any).useCockpitLayoutStore?.getState().cockpitLayoutMode === m;
        },
        mode,
        { timeout: 5000 },
      );
    }

    // Wait for core instruments of this mode to be visible.
    // cdu-panel is required for both full-deck and navigation modes.
    if (mode === 'full-deck' || mode === 'navigation') {
      await expect(page.getByTestId('cdu-panel')).toBeVisible({ timeout: 10000 });
    }
    // nd-panel is only asserted for navigation and automation modes where it is a
    // minimumRequiredPanel. In full-deck mode the nd may still be animating in and
    // we don't want to hard-fail legacy tests that only need the CDU.
    if (mode === 'navigation' || mode === 'automation') {
      await expect(page.getByTestId('nd-panel')).toBeVisible({ timeout: 10000 });
    }
  } catch (e) {
    console.warn(`[E2E Helper] Failed to ensure training mode ${mode}:`, e.message);
  }
}

/**
 * Asserts that the CDU display grid contains specific text.
 * This avoids ambiguity with hidden accessibility elements.
 */
export async function expectScreenText(page: Page, text: string) {
  // Try the new dedicated sr-only text tag first
  let display = page.getByTestId('main-cdu-display-text').first();
  if ((await display.count()) === 0) {
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
    label === '/' ? ['/', 'SLASH'] : label === '.' ? ['.', 'DOT'] : label === ' ' ? ['SP', 'SPACE'] : [label];

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
    const key = char === ' ' ? 'SP' : char === '/' ? '/' : char === '.' ? '.' : char;

    await expect(async () => {
      const current = await page.evaluate(() => (window as any).useFMCStore?.getState().scratchpad || '');
      if (current.includes(expected + char)) return;

      await pressCdu(page, key);

      const after = await page.evaluate(() => (window as any).useFMCStore?.getState().scratchpad || '');
      if (!after.includes(expected + char)) {
        throw new Error(
          `Scratchpad did not reflect "${char}". Got "${after}", expected to include "${expected + char}"`,
        );
      }
    }).toPass({ timeout: 4000, intervals: [500] });

    expected += char;
  }
}
