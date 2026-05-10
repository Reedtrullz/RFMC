# VirtualCDU — Boeing 737 NG FMC Trainer

A web-based Boeing 737 NG Flight Management Computer (FMC) / Control Display Unit (CDU) simulator with MSFS 2020 integration. Works on desktop and iPad — offline, no install required.

**[https://fmc.reidar.tech](https://fmc.reidar.tech)**

## What is this?

VirtualCDU is a fully functional simulation of a Boeing 737 FMC — the computer pilots use to enter flight plans, manage performance data, and navigate the aircraft. It looks and behaves like the real unit in the cockpit.

Use it to:
- **Learn** 737 FMC procedures without a simulator
- **Practice** preflight flows (IDENT → POS INIT → RTE → DEP/ARR → PERF → THRUST → TAKEOFF)
- **Train** with guided tutorials that explain the WHAT, WHY, and HOW of every entry
- **Connect** to Microsoft Flight Simulator 2020 for live CDU sync (PMDG 737, FBW A320, Working Title CJ4)

## Features

| Feature | Description |
|---------|-------------|
| **12 FMC pages** | IDENT, POS INIT, RTE, DEP/ARR, PERF INIT, THRUST LIM, TAKEOFF REF, LEGS, PROGRESS, HOLD, FIX, MENU |
| **Guided tutorials** | 3 scenarios (Full Preflight, Takeoff Config, In-Flight Review) with pulsing button highlights and aviation-accurate explanations |
| **Touch-optimized** | 44px touch targets, ripple feedback, iOS safe areas, PWA installable — works as a mounted cockpit display |
| **ICAO route parser** | Parses real route strings: `KJFK DCT RBV J42 LENDY8 KDCA` |
| **SimBrief import** | Parse SimBrief XML/JSON flight plans |
| **MSFS integration** | WebSocket bridge server + generic aircraft adapter (PMDG 737 included) |
| **Responsive** | Desktop, iPad landscape/portrait, phone |
| **Offline PWA** | Service worker, add to home screen, fullscreen kiosk mode |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express, WebSocket (ws), tsx |
| **Shared** | TypeScript types, FMC state machine page functions |
| **Deploy** | Docker, Ansible, Caddy, GitHub Actions |

## Architecture

```
┌──────────┐   SimConnect    ┌──────────────┐   WebSocket    ┌──────────────┐
│  MSFS    │ ◄──────────────► │  Node.js     │ ◄────────────► │  React App   │
│  2020    │   (Named Pipe)  │  Bridge      │   JSON/ws://   │  (Browser)   │
└──────────┘                 └──────────────┘                └──────────────┘
```

- **Frontend-authoritative** (standalone): FMC state lives in Zustand, pages computed locally. Works offline.
- **Backend-authoritative** (connected): Server owns FMC state, sends DisplayData via WebSocket. Thin client relays input.

## Project Structure

```
RFMS/
├── shared/                  # Shared types and FMC logic
│   └── src/
│       ├── types/           # FMCState, DisplayData, WebSocket types
│       └── fmc/             # Page functions, parsers, nav data, tutorials
├── src/                     # React frontend
│   ├── components/CDU/      # Display, Keypad, LSK, Scratchpad, Bezel
│   ├── components/          # ConnectionStatus, DemoWelcome, TutorialOverlay
│   ├── hooks/               # useTouchFeedback, useWebSocket, useKioskMode, useSound
│   └── store/               # Zustand FMC state machine
├── server/                  # Node.js backend
│   └── src/
│       ├── aircraft-adapters/ # IAircraftAdapter + PMDG737Adapter
│       ├── fmc-engine.ts    # Backend FMC state machine
│       └── index.ts         # Express + WebSocket server
├── inventory/               # Ansible inventory
│   └── hosts.yml            # VPS target
├── ansible-playbook.yml     # Docker-based deployment playbook
├── Dockerfile               # Multi-stage build (Vite + Node.js)
└── .github/workflows/       # CI/CD
```

## Getting Started

### Local Development

```bash
git clone https://github.com/Reedtrullz/RFMC.git
cd RFMC
npm install
npm run dev          # Vite dev server on :5173
```

In a separate terminal:
```bash
npm run server       # WebSocket bridge on :8080
```

### Production Build

```bash
npm run build        # Vite builds to dist/
```

### Docker

```bash
docker build -t virtual-cdu .
docker run -d --name virtual-cdu -p 8080:8080 virtual-cdu
```

## Deployment

### Manual Deploy

```bash
ansible-playbook -i inventory/hosts.yml ansible-playbook.yml
```

### Automatic Deploy (GitHub Actions)

Push to `main` triggers the workflow. Requires these GitHub secrets:

| Secret | Value |
|--------|-------|
| `SSH_PRIVATE_KEY` | Contents of `~/.ssh/id_rsa_racknerd` |
| `SSH_KNOWN_HOSTS` | `ssh-keyscan 198.23.137.16` |

### Architecture on VPS

```
Internet → Caddy (:443) → localhost:8082 → Docker (virtual-cdu:8080)
                              ↑
                          TLS auto-renew
```

## FMC Pages Reference

| Page | Purpose | Key Data |
|------|---------|----------|
| **IDENT** | Verify aircraft config | Model, engine rating, nav database version |
| **POS INIT** | Initialize IRS position | REF AIRPORT, GATE |
| **RTE** | Define flight plan | ORIGIN, DEST, FLT NO, route string |
| **DEP/ARR** | Select terminal procedures | SID, runway, STAR, approach |
| **PERF INIT** | Enter weight/economics | CRZ ALT, COST INDEX, ZFW, RESERVES |
| **THRUST LIM** | Select takeoff thrust | TO, TO 1, TO 2, assumed temp |
| **TAKEOFF REF** | Critical takeoff data | V1/VR/V2, trim, OAT, wind, QNH |
| **LEGS** | Review waypoint-by-waypoint | Altitude/speed constraints, discontinuities |
| **PROGRESS** | Enroute monitoring | DTG, ETA, fuel, wind, TAS |
| **HOLD** | Create holding patterns | Fix, inbound course, leg time |
| **FIX** | Reference waypoint info | Radial/distance, abeam points |
| **MENU** | System selection | A/C identification, ATC, maintenance |

## Tutorial Scenarios

1. **Full Preflight (KJFK → KDCA)** — 25-step walkthrough from cold cockpit to takeoff-ready. Covers IDENT, POS INIT, RTE pages 1 & 2, DEP/ARR, PERF INIT, THRUST LIM, TAKEOFF REF, and EXEC.
2. **Takeoff Configuration** — Enter V-speeds, trim, OAT, wind, and runway on the TAKEOFF REF page. Explains the safety significance of V1 (decision speed), VR (rotation), and V2 (takeoff safety).
3. **In-Flight Review** — Review PROGRESS, check LEGS, select STAR and approach for arrival. Covers real pilot workflow during descent preparation.

## License

MIT
