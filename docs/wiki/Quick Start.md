# Quick Start

Install and run:

```bash
corepack enable   # once; provides the pnpm version pinned in package.json
pnpm install
pnpm run dev
```

Start the optional bridge server in another terminal:

```bash
pnpm run server
```

Validation commands:

```bash
pnpm run typecheck:all
pnpm test --run
pnpm run build
pnpm run test:e2e:ci
pnpm run check:status-docs
```

Use `docs/STATUS.md` for the current verified baseline. Use `docs/KNOWN_LIMITATIONS.md` before making public or release claims.
