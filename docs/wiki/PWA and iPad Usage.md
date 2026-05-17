# PWA And iPad Usage

RFMC is designed to work as an installed browser app for cockpit-mounted practice.

Current PWA/iPad foundations include:

- Offline app shell support.
- Update prompt.
- Unit-tested offline-ready and update-available prompt states.
- Safe-area handling.
- Touch behavior tuned for mounted use.
- Wake-lock hook.
- Tablet layout baselines.
- Dismissible portrait orientation prompt with automated fallback-layout coverage.

Remaining hardening includes production-service-worker offline startup checks, mobile Safari coverage, and manual installed-device validation.
