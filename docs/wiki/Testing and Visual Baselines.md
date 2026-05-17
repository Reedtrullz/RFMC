# Testing And Visual Baselines

Core commands:

```bash
npm run typecheck:all
npm test -- --run
npm run build
npm run test:e2e:ci
npm run check:status-docs
```

Visual commands:

```bash
npm run test:e2e:visual
npm run test:visual -- --project=desktop-chromium
npx playwright test e2e/visual/cockpit-highres.spec.ts --project=desktop-3456x2234
npx playwright test e2e/visual/cockpit-highres.spec.ts --project=retina-1728x1117-dsf2
npm run capture:baseline
npm run measure:visual
```

Current results live only in `docs/STATUS.md`.
