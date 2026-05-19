# iPad Cockpit Mode Deployment Guide

This document outlines the requirements and best practices for using RFMS as a cockpit-mounted trainer on iPad devices.

## Hardware Requirements

- **Device**: iPad (7th Gen or newer), iPad Air (3rd Gen or newer), or iPad Pro (any).
- **Mounting**: Stable RAM mount or similar beside the simulator primary displays.
- **Connectivity**: Local Wi-Fi (for MSFS/X-Plane bridge) or offline for standalone training.

## Software Configuration

- **Browser**: Safari (iOS 15+) or Chrome.
- **Installation**: Use "Add to Home Screen" to launch as a standalone PWA (removes browser chrome).
- **Orientation**: Locked to Landscape for multi-instrument deck.

## Cockpit Mode Checklist

- [ ] **Wake Lock**: Enabled (prevents screen from dimming during cruise).
- [ ] **Brightness**: Use the "NIGHT" or "DIM" presets for dark-room simulation to prevent eye strain and preserve realism.
- [ ] **Touch Targets**: All CDU/MCDU keys are min 42px. Use firm taps.
- [ ] **Zoom**: Accidental zooming is disabled via `touch-action: none`.

## Offline Usage

The trainer supports full offline functionality for:

- IDENT, POS INIT, RTE, LEGS, PERF pages.
- Navigation Display rendering.
- PFD basic instrumentation.
- All tutorial scenarios (Level 1-6).

_Note: SimBrief import requires an active internet connection._
