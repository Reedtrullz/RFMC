import { test, expect } from '@playwright/test';
import { dismissWelcome, expectScreenText, pressCdu as press } from '../helpers';

test.setTimeout(30000);

test('Boeing preflight flow @smoke', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);
  await expectScreenText(page, 'IDENT');
  await expectScreenText(page, '737-800');
  await press(page, 'RTE');
  await expectScreenText(page, 'RTE');
  await expectScreenText(page, 'ORIGIN');
});

test('Airbus mode switch @smoke', async ({ page }) => {
  await page.goto('/');
  await page.locator('button:has-text("A320neo")').click();
  await dismissWelcome(page);
  await expectScreenText(page, 'INIT');
});

test('Keyboard input @smoke', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);
  await press(page, '1');
  await press(page, '2');
  await press(page, '3');
  await expect(page.locator('[data-testid="scratchpad"]')).toContainText('123');
  await press(page, 'CLR');
  await expect(page.locator('[data-testid="scratchpad"]')).not.toContainText('123');
});
