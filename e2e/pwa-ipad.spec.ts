import { expect, test } from '@playwright/test';

test.describe('PWA and iPad hardening', () => {
  test('portrait cockpit shows dismissible orientation prompt and fallback layout', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await page.addInitScript(() => localStorage.setItem('virtualcdu.cockpitGuidanceDismissed', 'true'));
    await page.goto('/');
    await page.waitForFunction(() => (window as any).useFMCStore && (window as any).useCockpitLayoutStore);

    await page.evaluate(() => {
      (window as any).useFMCStore.getState().setMode('ACTIVE');
      (window as any).useFMCStore.getState().setDemoMode(true);
      (window as any).useCockpitLayoutStore.getState().setCockpitMode(true);
      (window as any).useCockpitLayoutStore.getState().setCockpitLayoutMode('full-deck');
    });

    const prompt = page.getByTestId('orientation-prompt');
    await expect(prompt).toBeVisible();
    await expect(prompt).toHaveAttribute('aria-modal', 'true');

    await prompt.getByRole('button', { name: 'Dismiss' }).click();
    await expect(prompt).toBeHidden();

    await expect(page.locator('.cockpit-stage--portrait')).toBeVisible();
    await expect(page.getByTestId('cdu-panel')).toBeVisible();

    const bodyOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(bodyOverflow).toBeLessThanOrEqual(2);
  });
});
