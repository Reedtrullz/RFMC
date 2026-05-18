import { test, expect } from '@playwright/test';

test.describe('Training Scenarios E2E', () => {
  test('should display step cards and overlays when lesson is active', async ({ page }) => {
    await page.goto('/');

    const prompt = page.getByTestId('orientation-prompt');
    try {
      if (await prompt.isVisible()) {
        await prompt.getByRole('button', { name: 'Dismiss' }).click();
      }
    } catch (e) {}

    await page.evaluate(() => {
      window.useFMCStore.getState().startTraining('b737-mcp-basics');
    });

    await expect(page.locator('text=Current Task')).toBeVisible();
    await expect(page.locator('text=Abort Training')).toBeVisible();

    await page.click('text=Abort Training');
    await expect(page.locator('text=Current Task')).not.toBeVisible();
  });
});
