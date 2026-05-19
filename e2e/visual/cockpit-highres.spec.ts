import { expect, test } from '@playwright/test';
import {
  expectFocusedPanelCentered,
  expectMainPanelsHealthy,
  focusPanel,
  prepareCockpit,
  screenshot,
  setCockpitMode,
  switchAircraft,
  type CockpitAircraft,
  type CockpitPanelId,
} from '../helpers/cockpitLayout';

const HIGH_RES_PROJECTS = new Set(['desktop-3456x2234', 'retina-1728x1117-dsf2']);

const modes: Array<{
  mode: string;
  panels: CockpitPanelId[];
}> = [
  { mode: 'fmc-focus', panels: ['cdu'] },
  { mode: 'navigation', panels: ['nd', 'cdu'] },
  { mode: 'automation', panels: ['autoflight', 'pfd', 'nd'] },
  { mode: 'approach', panels: ['autoflight', 'pfd', 'nd'] },
  { mode: 'full-deck', panels: ['autoflight', 'pfd', 'nd', 'cdu'] },
];

const focusPanels: CockpitPanelId[] = ['cdu', 'nd', 'pfd', 'autoflight'];

test.describe('High-resolution cockpit visual baselines', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      !HIGH_RES_PROJECTS.has(testInfo.project.name),
      'High-resolution baselines only run in explicit high-res projects.',
    );
  });

  for (const aircraft of ['boeing', 'airbus'] as CockpitAircraft[]) {
    for (const { mode, panels } of modes) {
      test(`${aircraft} ${mode} high-resolution layout @Visual Regression`, async ({ page }) => {
        await prepareCockpit(page);
        await switchAircraft(page, aircraft);
        await setCockpitMode(page, mode);

        await expectMainPanelsHealthy(page, panels);
        await screenshot(page.locator('.cockpit-grid'), `highres-${aircraft}-${mode}.png`);
      });
    }

    for (const panel of focusPanels) {
      test(`${aircraft} focused ${panel} high-resolution layout @Visual Regression`, async ({ page }) => {
        await prepareCockpit(page);
        await switchAircraft(page, aircraft);
        await setCockpitMode(page, panel === 'cdu' ? 'fmc-focus' : panel === 'nd' ? 'navigation' : 'automation');
        await focusPanel(page, panel);

        await expect(page.getByRole('dialog', { name: /focus mode/i })).toBeVisible();
        await expectFocusedPanelCentered(page, panel);
        await screenshot(page.getByTestId(`focused-${panel}-panel`), `highres-focused-${aircraft}-${panel}.png`);
      });
    }
  }
});
