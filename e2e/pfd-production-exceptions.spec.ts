import { chromium, expect, test, type Browser, type BrowserContext, type Request } from '@playwright/test';
import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import type { Duplex } from 'node:stream';
import {
  captureCache,
  cachePath,
  fetchAssetsInPage,
  hashDirectory,
  monitorCaseOutput,
  requiredAssetPaths,
  runGuardProbe,
  sourceHashes,
  startProductionGuard,
  type CacheEntry,
  type ProductionGuard,
} from './helpers/productionFixture';

test.use({ trace: 'off' });
test.setTimeout(120_000);
test.describe.configure({ mode: 'default', retries: 0 });

type StepResult = { name: string; ok: boolean; startedAt: number; endedAt: number; error?: string };
type ConsoleSignal = { type: string; text: string };
type RequestSignal = { method: string; url: string; resourceType: string; at: number; phase: string };
type FailedSignal = { url: string; failure: string };

const AIRCRAFT = [
  { type: 'BOEING_737', label: /737 NG FMC/, pfd: 'boeing-pfd', tape: 'boeing-speed-tape', other: 'airbus-pfd' },
  { type: 'AIRBUS_A320', label: /A320neo MCDU/, pfd: 'airbus-pfd', tape: 'airbus-speed-tape', other: 'boeing-pfd' },
] as const;
const LAYOUTS = ['standalone', 'cockpit'] as const;
const VIEWPORTS = [
  { name: '1280x900-desktop', width: 1280, height: 900, mobile: false },
  { name: '393x851-touch', width: 393, height: 851, mobile: true },
] as const;

let helperCloseProbe: Awaited<ReturnType<ProductionGuard['close']>> | null = null;
test.beforeAll(async () => {
  const guard = await startProductionGuard(path.join(process.cwd(), 'dist'));
  let client: Duplex | undefined;
  let closing: ReturnType<ProductionGuard['close']> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    client = await new Promise<Duplex>((resolve, reject) => {
      const request = httpRequest(guard.origin + '/ws', {
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
          'Sec-WebSocket-Version': '13',
        },
      });
      request.on('upgrade', (_response, socket) => resolve(socket));
      request.on('response', (response) => {
        response.resume();
        reject(new Error('Lifecycle upgrade rejected: ' + response.statusCode));
      });
      request.on('error', reject);
      request.setTimeout(3000, () => request.destroy(new Error('Lifecycle upgrade timed out')));
      request.end();
    });
    closing = guard.close();
    helperCloseProbe = await Promise.race([
      closing,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Lifecycle close exceeded 5 seconds')), 5000);
      }),
    ]);
    expect(helperCloseProbe.closedSockets).toBeGreaterThan(0);
    expect(helperCloseProbe.serverClosed).toBe(true);
    expect(helperCloseProbe.sockets).toBe(0);
    expect(helperCloseProbe.socketEvents.filter((event) => event.event === 'close')).toHaveLength(
      helperCloseProbe.socketEvents.filter((event) => event.event === 'open').length,
    );
  } finally {
    clearTimeout(timer);
    client?.destroy();
    if (!closing) await guard.close();
  }
});

for (const aircraft of AIRCRAFT) {
  for (const layout of LAYOUTS) {
    for (const viewport of VIEWPORTS) {
      const name = `${aircraft.type.split('_')[0].toLowerCase()}-${layout}-${viewport.name}`;
      test(`${name} warm/offline production PFD @smoke`, async ({}, testInfo) => {
        const root = process.cwd();
        const distDir = path.join(root, 'dist');
        const manifest = hashDirectory(distDir);
        const sourcesBefore = sourceHashes(root);
        expect(manifest['index.html'], 'production dist must be built before this spec').toBeTruthy();

        let browser: Browser | null = null;
        let browserLaunchAttempted = false;
        let primaryError: unknown;
        let guard: ProductionGuard | undefined;
        let cleanup: Awaited<ReturnType<ProductionGuard['close']>> | null = null;
        const contexts: BrowserContext[] = [];
        const steps: StepResult[] = [];
        const consoleSignals: ConsoleSignal[] = [];
        const pageErrors: string[] = [];
        const requestSignals: RequestSignal[] = [];
        const failedRequests: FailedSignal[] = [];
        const responseSignals: { url: string; status: number }[] = [];
        const authored = { received: [] as string[], sent: [] as string[] };
        const inFlight = new Set<Request>();
        let currentPhase = 'setup';
        const runtimeDir = testInfo.outputPath('production-runtime');
        expect(existsSync(runtimeDir), 'runtime directory must be newly owned by this case').toBe(false);
        mkdirSync(runtimeDir, { recursive: true });
        const monitor = monitorCaseOutput(testInfo.outputDir, async () => {
          if (browser) await browser.close();
        });
        const evidence: Record<string, unknown> = {
          cohort: {
            aircraft: aircraft.type,
            layout,
            viewport: viewport.name,
            width: viewport.width,
            height: viewport.height,
            mobile: viewport.mobile,
          },
          distDir,
          manifest,
          sourcesBefore,
          authored,
          helperCloseProbe,
          fixture: {
            origin: 'own ephemeral 127.0.0.1 static dist server',
            websocket:
              'exact own-origin routeWebSocket only; sim.connected aircraftType BOEING_737 retained as adverse metadata',
          },
        };
        const step = async (stepName: string, run: () => Promise<void>) => {
          currentPhase = stepName;
          const startedAt = Date.now();
          try {
            await run();
            steps.push({ name: stepName, ok: true, startedAt, endedAt: Date.now() });
          } catch (error) {
            steps.push({
              name: stepName,
              ok: false,
              startedAt,
              endedAt: Date.now(),
              error: String(error).slice(0, 1000),
            });
            throw error;
          }
        };

        try {
          guard = await startProductionGuard(distDir);
          const server = guard;
          browserLaunchAttempted = true;
          const context = await chromium.launchPersistentContext(path.join(runtimeDir, 'profile'), {
            headless: true,
            proxy: { server: server.origin, bypass: '<-loopback>' },
            downloadsPath: path.join(runtimeDir, 'downloads'),
            tracesDir: path.join(runtimeDir, 'traces'),
            viewport: { width: viewport.width, height: viewport.height },
            isMobile: viewport.mobile,
            hasTouch: viewport.mobile,
            serviceWorkers: 'allow',
            args: [
              '--disable-background-networking',
              '--disable-sync',
              '--disable-quic',
              '--no-pings',
              '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
              '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
              '--disk-cache-size=1048576',
              '--media-cache-size=1048576',
            ],
          });
          contexts.push(context);
          context.on('request', (request) => {
            if (new URL(request.url()).origin === server.origin && request.resourceType() !== 'websocket') {
              inFlight.add(request);
            }
          });
          context.on('requestfinished', (request) => inFlight.delete(request));
          context.on('requestfailed', (request) => inFlight.delete(request));
          browser = context.browser();
          expect(browser, 'persistent Chromium must expose its owned browser').not.toBeNull();
          const probePage = await context.newPage();
          await step('guard denies foreign HTTP/HTTPS/loopback/WebSocket and allows own origin', async () => {
            evidence.guard = await runGuardProbe(server, probePage);
          });
          await probePage.close();
          await context.addInitScript((url) => {
            localStorage.setItem('cdu-server-url', url);
          }, server.wsUrl);
          const page = await context.newPage();
          page.setDefaultTimeout(15000);
          page.on('console', (message) => consoleSignals.push({ type: message.type(), text: message.text() }));
          page.on('pageerror', (error) => pageErrors.push(String(error)));
          page.on('response', (response) => responseSignals.push({ url: response.url(), status: response.status() }));
          page.on('request', (request) =>
            requestSignals.push({
              method: request.method(),
              url: request.url(),
              resourceType: request.resourceType(),
              at: Date.now(),
              phase: currentPhase,
            }),
          );
          page.on('requestfailed', (request) =>
            failedRequests.push({ url: request.url(), failure: request.failure()?.errorText ?? '' }),
          );
          await page.routeWebSocket(
            (url) => url.href === server.wsUrl,
            (route) => {
              route.onMessage((message) => {
                const text = typeof message === 'string' ? message : message.toString('utf8');
                authored.received.push(text);
                let parsed: { type?: string } = {};
                try {
                  parsed = JSON.parse(text) as { type?: string };
                } catch {
                  // Malformed fixture traffic stays recorded instead of being treated as a product error.
                  return;
                }
                if (parsed.type === 'sim.connect') {
                  authored.sent.push('sim.connected:BOEING_737');
                  route.send(
                    JSON.stringify({
                      type: 'sim.connected',
                      aircraft: 'Fixture',
                      aircraftType: 'BOEING_737',
                      capabilities: [],
                    }),
                  );
                }
              });
            },
          );

          const orientationPrompt = page.getByTestId('orientation-prompt');
          const dismissPwaPrompt = async () => {
            const prompt = page.getByTestId('pwa-update-prompt');
            await prompt.waitFor({ state: 'visible', timeout: 3000 }).catch(() => undefined);
            if (await prompt.isVisible().catch(() => false)) {
              await prompt.getByRole('button', { name: 'Dismiss', exact: true }).click();
              await expect(prompt).toBeHidden();
            }
          };
          const dismissOrientation = async () => {
            if (viewport.height <= viewport.width) return;
            await orientationPrompt.waitFor({ state: 'visible', timeout: 2000 }).catch(() => undefined);
            if (await orientationPrompt.isVisible().catch(() => false)) {
              await orientationPrompt.getByRole('button', { name: 'Dismiss', exact: true }).click();
              await expect(orientationPrompt).toBeHidden();
            }
          };
          const enterApp = async (selectAircraft: boolean) => {
            const skip = page.getByRole('button', { name: /Skip Demo/ });
            await expect(skip).toBeVisible({ timeout: 20000 });
            await dismissOrientation();
            if (selectAircraft) {
              await page.getByRole('button', { name: aircraft.label }).click();
              evidence.selectedViaWelcome = aircraft.type;
            }
            await skip.click();
            await expect(skip).toBeHidden();
          };
          const selectLayout = async () => {
            if (layout === 'cockpit') {
              await expect(page.getByTestId('cockpit-panel-toolbar')).toBeVisible();
              await dismissOrientation();
              await page.getByTestId('layout-mode-full-deck').click();
              await dismissOrientation();
              await expect(page.getByTestId('layout-mode-full-deck')).toHaveClass(/bg-cdu-cyan/);
              return;
            }
            const exit = page.getByRole('button', { name: 'Exit cockpit mode' });
            const enter = page.getByRole('button', { name: 'Enter Cockpit' });
            await expect
              .poll(async () => (await exit.count()) + (await enter.count()), { timeout: 10000 })
              .toBeGreaterThan(0);
            if ((await exit.count()) > 0) await exit.click();
            await expect(enter).toBeVisible();
            await expect(page.getByTestId('cockpit-panel-toolbar')).toHaveCount(0);
          };
          const assertInstrument = async () => {
            await expect(page.getByTestId('pfd-panel')).toBeVisible({ timeout: 20000 });
            await expect(page.getByTestId(aircraft.pfd)).toBeVisible();
            await expect(page.getByTestId(aircraft.tape)).toBeVisible();
            await expect(page.getByTestId(aircraft.other)).toHaveCount(0);
            await expect(page.getByTestId(aircraft.pfd)).toContainText('IAS');
            await expect(page.getByTestId('cdu-panel')).toBeVisible();
            if (layout === 'cockpit') {
              await expect(page.getByTestId('nd-panel')).toBeVisible();
            }
            await expect(page.getByTestId('scratchpad').first()).toHaveAttribute('aria-label', /^Scratchpad:/);
            await expect
              .poll(async () => ((await page.getByTestId('main-cdu-display-text').textContent()) ?? '').trim().length, {
                timeout: 15000,
              })
              .toBeGreaterThan(0);
            await expect(page.getByText('PFD ERROR')).toHaveCount(0);
          };
          const connectSim = async () => {
            await dismissPwaPrompt();
            if (layout === 'cockpit') {
              const toggle = page.getByRole('button', { name: 'Toggle Connection panel', exact: true });
              await expect(toggle).toBeVisible();
              if ((await toggle.getAttribute('aria-pressed')) === 'false') await toggle.click();
              await expect(toggle).toHaveAttribute('aria-pressed', 'true');
            }
            const status = page
              .getByRole('button', { name: /^(DISCONNECTED|CONNECTING|CONNECTED|ERROR)(\s|$)/ })
              .first();
            await expect(status).toBeVisible();
            await status.click();
            const heading = page.getByRole('heading', { name: 'MSFS Connection Diagnostics' });
            await expect(heading).toBeVisible();
            const panel = heading.locator('xpath=..');
            await panel.getByRole('button', { name: /CONNECT TO MSFS/ }).click();
            await expect(status).toContainText('CONNECTED', { timeout: 15000 });
            await panel.getByRole('button', { name: /CLOSE/ }).click();
            expect(authored.received.map((message) => JSON.parse(message) as unknown)).toContainEqual({
              type: 'sim.connect',
            });
            expect(authored.sent).toContain('sim.connected:BOEING_737');
          };
          const assertCduInput = async () => {
            await dismissPwaPrompt();
            if (layout === 'cockpit' && viewport.mobile) {
              const label = aircraft.type === 'AIRBUS_A320' ? 'MCDU' : 'CDU';
              await page.getByRole('button', { name: `Focus ${label}`, exact: true }).click();
              await expect(page.getByRole('dialog', { name: 'CDU focus mode', exact: true })).toBeVisible();
            }
            const variant = aircraft.type === 'AIRBUS_A320' ? 'airbus' : 'boeing';
            const scratchpad = page.getByTestId('scratchpad').first();
            await page.getByTestId(`key-${variant}-Q`).click();
            await expect(scratchpad).toHaveAttribute('aria-label', 'Scratchpad: Q');
            await page.getByTestId(`key-${variant}-A`).click();
            await expect(scratchpad).toHaveAttribute('aria-label', 'Scratchpad: QA');
            await page.getByTestId(`key-${variant}-CLR`).click();
            await expect(scratchpad).toHaveAttribute('aria-label', 'Scratchpad: Q');
            await page.getByTestId(`key-${variant}-CLR`).click();
            await expect(scratchpad).not.toHaveAttribute('aria-label', /Scratchpad: Q/);
            if (layout === 'cockpit' && viewport.mobile) {
              await page
                .getByRole('dialog', { name: 'CDU focus mode', exact: true })
                .getByRole('button', { name: 'Back', exact: true })
                .click();
              await assertInstrument();
            }
          };
          const waitForPrecache = async () => {
            await expect
              .poll(() => page.evaluate(() => navigator.serviceWorker.ready.then((ready) => Boolean(ready.active))), {
                timeout: 20000,
              })
              .toBe(true);
            const required = requiredAssetPaths(manifest);
            let entries: CacheEntry[] = [];
            let missing = required;
            for (let attempt = 0; attempt < 40 && missing.length > 0; attempt++) {
              entries = await captureCache(page);
              const cached = new Map(entries.map((entry) => [cachePath(entry.url), entry] as const));
              missing = required.filter((target) => {
                const entry = cached.get(target);
                const expected = manifest[target.slice(1)];
                return !entry || !expected || entry.sha !== expected.sha256 || entry.bytes !== expected.bytes;
              });
              if (missing.length > 0) await page.waitForTimeout(500);
            }
            const mismatched = entries.filter((entry) => {
              const expected = manifest[cachePath(entry.url).slice(1)];
              if (!expected) return false;
              return entry.sha !== expected.sha256 || entry.bytes !== expected.bytes;
            });
            evidence.cache = { required: required.length, captured: entries.length, missing, mismatched, entries };
            expect(missing).toEqual([]);
            expect(mismatched).toEqual([]);
          };

          await step('cold load with real welcome aircraft selection', async () => {
            const response = await page.goto(server.origin);
            expect(response?.status()).toBe(200);
            expect(await page.evaluate(() => 'useAircraftStore' in window)).toBe(false);
            await enterApp(true);
            await selectLayout();
          });
          await step('cold PFD variant, layout and nonempty CDU', assertInstrument);
          await step('cold real CDU input and clear', assertCduInput);
          await step('synthetic sim.connected fixture through own-origin routeWebSocket', connectSim);
          await step('classify existing Issue58 manifest screenshot failures', async () => {
            const webmanifest = JSON.parse(readFileSync(path.join(distDir, 'manifest.json'), 'utf8')) as {
              screenshots: { src: string }[];
            };
            const screenshotPaths = webmanifest.screenshots.map((entry) => entry.src);
            expect(screenshotPaths.slice().sort()).toEqual([
              '/images/screenshot-cdu.png',
              '/images/screenshot-cockpit.png',
            ]);
            const screenshots = await fetchAssetsInPage(page, screenshotPaths);
            evidence.manifestScreenshots = { issue: 58, classification: 'existing missing assets', screenshots };
            expect(screenshots).toHaveLength(2);
            for (const screenshot of screenshots) {
              expect('error' in screenshot).toBe(false);
              if ('status' in screenshot) expect(screenshot.status).toBe(404);
            }
          });
          await step('current dist precache parity', waitForPrecache);
          await step('warm reload controlled by service worker', async () => {
            await page.reload();
            await enterApp(false);
            await selectLayout();
            await assertInstrument();
            await assertCduInput();
            await expect
              .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 15000 })
              .toBe(true);
            evidence.warmReloadControlled = true;
          });
          await step('settle warm service-worker and HTTP work before the offline boundary', async () => {
            await page.waitForLoadState('networkidle');
            await page.evaluate(async () => {
              const registration = await navigator.serviceWorker.ready;
              await registration.update();
            });
            await expect.poll(() => inFlight.size, { timeout: 10000 }).toBe(0);
            evidence.offlineBoundary = {
              at: Date.now(),
              serverRequests: server.requests.length,
              inFlightRequests: [...inFlight].map((request) => request.url()),
            };
          });
          await step('offline cached reload', async () => {
            const serverHitsBefore = server.requests.length;
            // The native offline probe still received SW update requests; close its owned origin as well.
            const offlineNetwork = await server.close();
            evidence.offlineNetwork = offlineNetwork;
            expect(offlineNetwork.serverClosed).toBe(true);
            expect(offlineNetwork.sockets).toBe(0);
            expect(server.requests.length).toBe(serverHitsBefore);
            await context.setOffline(true);
            await page.reload();
            await enterApp(false);
            await selectLayout();
            await assertInstrument();
            await assertCduInput();
            await expect
              .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 15000 })
              .toBe(true);
            const assets = await fetchAssetsInPage(page, [...requiredAssetPaths(manifest), '/']);
            const failed = assets.filter((asset) => {
              if ('error' in asset) return true;
              const expected = manifest[asset.path === '/' ? 'index.html' : asset.path.slice(1)];
              if (!expected) return true;
              return asset.status !== 200 || asset.sha !== expected.sha256 || asset.bytes !== expected.bytes;
            });
            evidence.offline = {
              serverHitsBefore,
              serverHitsAfter: server.requests.length,
              assetCount: assets.length,
              assets,
              failed,
            };
            expect(failed).toEqual([]);
            expect(server.requests.length).toBe(serverHitsBefore);
          });
          await step('no uncaught or boundary PFD exception', async () => {
            expect(pageErrors).toEqual([]);
            expect(consoleSignals.filter((entry) => entry.type === 'error' && /TypeError/.test(entry.text))).toEqual(
              [],
            );
            expect(
              consoleSignals.filter(
                (entry) => entry.type === 'error' && /PFD ERROR|The above error occurred/.test(entry.text),
              ),
            ).toEqual([]);
          });
          await step('dist and source unchanged', async () => {
            expect(hashDirectory(distDir)).toEqual(manifest);
            expect(sourceHashes(root)).toEqual(sourcesBefore);
          });
        } catch (error) {
          primaryError = error;
          throw error;
        } finally {
          const cleanupErrors: Error[] = [];
          const closeOwned = async (label: string, close: () => Promise<unknown>) => {
            let timer: ReturnType<typeof setTimeout> | undefined;
            try {
              await Promise.race([
                close(),
                new Promise((_, reject) => {
                  timer = setTimeout(() => reject(new Error(`${label} cleanup exceeded 5 seconds`)), 5000);
                }),
              ]);
            } catch (error) {
              cleanupErrors.push(new Error(label, { cause: error }));
            } finally {
              clearTimeout(timer);
            }
          };
          for (const context of contexts) {
            await closeOwned('context', () => context.close());
          }
          const ownedBrowser = browser;
          if (ownedBrowser?.isConnected()) await closeOwned('browser', () => ownedBrowser.close());
          if (guard) {
            await closeOwned('guard', async () => {
              cleanup = await guard.close();
            });
          }
          let distUnchanged = false;
          let sourcesUnchanged = false;
          try {
            distUnchanged = JSON.stringify(hashDirectory(distDir)) === JSON.stringify(manifest);
          } catch {
            distUnchanged = false;
          }
          try {
            sourcesUnchanged = JSON.stringify(sourceHashes(root)) === JSON.stringify(sourcesBefore);
          } catch {
            sourcesUnchanged = false;
          }
          evidence.console = consoleSignals;
          evidence.pageErrors = pageErrors;
          evidence.requests = requestSignals;
          evidence.failedRequests = failedRequests;
          evidence.responses = responseSignals;
          evidence.steps = steps;
          evidence.cleanup = cleanup;
          evidence.distUnchanged = distUnchanged;
          evidence.sourcesUnchanged = sourcesUnchanged;
          evidence.serverRequests = guard?.requests.length ?? 0;
          evidence.serverRequestDetails = guard?.requests;
          const browserClosed = browser ? !browser.isConnected() : !browserLaunchAttempted;
          evidence.browserClosed = browserClosed;
          if (!browserClosed) cleanupErrors.push(new Error('Owned browser closure is unproven'));
          if (!cleanup?.serverClosed || cleanup.sockets !== 0) cleanupErrors.push(new Error('Guard handles remain'));
          if (!distUnchanged || !sourcesUnchanged) cleanupErrors.push(new Error('Source or dist changed'));
          const budget = monitor.stop();
          evidence.outputBudget = budget;
          cleanupErrors.push(...budget.failures.map((failure) => new Error(failure)));
          if (browserClosed) {
            try {
              rmSync(runtimeDir, { recursive: true, force: true });
            } catch (error) {
              cleanupErrors.push(new Error('Owned runtime removal', { cause: error }));
            }
          }
          evidence.runtimeRemoved = !existsSync(runtimeDir);
          if (existsSync(runtimeDir)) cleanupErrors.push(new Error('Owned runtime remains'));
          evidence.primaryError = primaryError ? String(primaryError) : null;
          evidence.cleanupErrors = cleanupErrors.map((error) => `${error.message}: ${String(error.cause ?? '')}`);
          const body = JSON.stringify(evidence, null, 2);
          if (Buffer.byteLength(body) > 1024 * 1024) {
            cleanupErrors.push(new Error('Evidence exceeds 1 MiB; full attachment refused'));
          } else {
            await closeOwned('evidence attachment', () =>
              testInfo.attach('pfd-production-result.json', { body, contentType: 'application/json' }),
            );
          }
          if (cleanupErrors.length > 0) {
            throw new AggregateError(
              primaryError ? [primaryError, ...cleanupErrors] : cleanupErrors,
              'Production fixture cleanup, boundedness or final invariants failed',
            );
          }
        }
      });
    }
  }
}
