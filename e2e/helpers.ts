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
  } catch {
    // Modal already dismissed or not present
  }
  
  // Ensure the trainer is at least in the DOM and visible
  await expect(page.getByTestId('autopilot-trainer')).toBeVisible({ timeout: 10000 });
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
  await page.getByRole('button', { name: label, exact: true }).first().click();
  // Small delay to let the scratchpad update
  await page.waitForTimeout(50);
}

/**
 * Helper for Line Select Keys (L1-L6, R1-R6)
 */
export async function lsk(page: Page, id: string) {
  // The aria-label is "LSK L1", "LSK R1", etc.
  await page.getByRole('button', { name: `LSK ${id.toUpperCase()}`, exact: true }).click();
}

/**
 * Enters multiple characters into the CDU scratchpad.
 * Extremely robust: waits for the scratchpad to update after each key press.
 */
export async function enterText(page: Page, text: string) {
  const display = page.locator('.cdu-display-container pre.sr-only').first();
  
  for (const char of text) {
    const before = await display.textContent() || '';

    if (char === ' ') {
      await pressCdu(page, 'SP');
    } else if (char === '/') {
      await pressCdu(page, '/');
    } else if (char === '.') {
      await pressCdu(page, '.');
    } else {
      await pressCdu(page, char);
    }

    // Wait for the scratchpad to reflect the change
    // We expect the text content to change (either appended or cleared/error)
    await expect(async () => {
      const after = await display.textContent() || '';
      if (after === before) throw new Error('Scratchpad did not update');
    }).toPass({ timeout: 2000, intervals: [100] });
  }
}
