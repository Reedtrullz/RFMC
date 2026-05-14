import { expect, type Page } from '@playwright/test';

/**
 * Dismisses the welcome/demo modal if it's present.
 */
export async function dismissWelcome(page: Page) {
  // Wait for the app to be somewhat loaded
  await page.waitForLoadState('domcontentloaded');
  
  const skipButton = page.locator('button:has-text("Skip Demo")');
  try {
    // Wait for the modal to potentially appear
    await skipButton.waitFor({ state: 'visible', timeout: 2000 });
    await skipButton.click();
    // Ensure it's gone
    await expect(skipButton).toBeHidden({ timeout: 5000 });
    
    // Explicitly set demoMode via the exposed store to ensure fast IRS alignment and other simulation logic
    await page.evaluate(() => {
      if ((window as any).useFMCStore) {
        (window as any).useFMCStore.getState().setDemoMode(true);
      }
    });
  } catch {
    // Modal already dismissed or not present, but ensure demoMode is still set
    await page.evaluate(() => {
      if ((window as any).useFMCStore) {
        (window as any).useFMCStore.getState().setDemoMode(true);
      }
    });
  }
  
  // Ensure the trainer is at least in the DOM and visible
  await expect(page.getByTestId('autoflight-panel')).toBeVisible({ timeout: 10000 });
}

/**
 * Asserts that the CDU display grid contains specific text.
 * This avoids ambiguity with hidden accessibility elements.
 */
export async function expectScreenText(page: Page, text: string) {
  // Use the sr-only pre tag which contains the plain text representation of the grid
  const display = page.locator('.cdu-display-container pre.sr-only').first();
  await expect(display).toContainText(text);
}

/**
 * Presses a CDU function key or alphanumeric key.
 */
export async function pressCdu(page: Page, label: string) {
  // Try variant-based data-testids (more specific)
  const variants = ['function', 'boeing', 'airbus', 'exec', 'lsk'];
  for (const variant of variants) {
    const btn = page.getByTestId(`key-${variant}-${label}`).first();
    if (await btn.count()) {
      await btn.dispatchEvent('click');
      await page.waitForTimeout(250);
      return;
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
  const testIdButton = page.getByTestId(`key-${id.toUpperCase()}`).first();
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
  // Target the hidden pre tag which contains the single source of truth for the grid text
  const scratchpad = page.locator('[data-testid="scratchpad"] pre.sr-only');

  let expected = '';

  for (const char of text) {
    const key =
      char === ' ' ? 'SP' :
      char === '/' ? '/' :
      char === '.' ? '.' :
      char;

    const target = expected + char;

    await expect(async () => {
      const current = (await scratchpad.textContent() || '').replace(/\s/g, '');
      if (current.includes(target.replace(/\s/g, ''))) return;

      await pressCdu(page, key);

      const after = (await scratchpad.textContent() || '').replace(/\s/g, '');
      if (!after.includes(target.replace(/\s/g, ''))) {
        console.log(`[enterText] char="${char}" target="${target}" got="${after}"`);
        throw new Error(`Scratchpad did not reflect "${char}". Got "${after}", expected to include "${target}"`);
      }
    }).toPass({ timeout: 4000, intervals: [500] });

    expected += char;
  }
}
