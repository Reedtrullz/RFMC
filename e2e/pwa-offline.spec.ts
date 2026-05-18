import { test, expect } from '@playwright/test';

test.describe('PWA Offline Operations', () => {
  test('should remain fully functional and interactive when network is lost', async ({ context, page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const fmc = (window as any).useFMCStore?.getState();
      if (fmc) {
        fmc.setMode('ACTIVE');
        fmc.setDemoMode(true);
      }
    });

    await context.setOffline(true);

    await page.evaluate(() => {
      window.useFMCStore.getState().pressKey('A');
      window.useFMCStore.getState().pressKey('B');
    });

    const cdu = page.getByTestId('cdu-panel');
    await expect(cdu).toBeVisible();

    await expect(page.getByTestId('cdu-display-grid-text')).toContainText('AB');
  });
});
