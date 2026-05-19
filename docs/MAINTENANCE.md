# VirtualCDU Maintenance & Operations Guide

This document outlines the operational tasks required to maintain, update, and deploy VirtualCDU.

## Deployment

VirtualCDU is deployed to the production VPS using Ansible and Docker.

### Manual Deployment

1. Ensure your SSH key is authorized on the target VPS.
2. Run the playbook:
   ```bash
   ansible-playbook -i inventory/hosts.yml ansible-playbook.yml
   ```

### Automated Deployment (CI/CD)

Pushing to the `main` branch triggers a GitHub Action that:

1. Runs unit and E2E tests.
2. Builds the Docker image.
3. Deploys the image to the VPS via Ansible.

## Docker Management

The application runs as a single Docker container containing both the Vite static build and the Node.js bridge server.

- **Status**: `docker ps | grep virtual-cdu`
- **Logs**: `docker logs -f virtual-cdu`
- **Restart**: `docker restart virtual-cdu`

## Infrastructure & Networking

- **Caddy**: Acts as a reverse proxy and provides automatic TLS (HTTPS).
- **Domain**: `fmc.reidar.tech`
- **Ports**:
  - Host `:8082` maps to Container `:8080`.
  - Container `:8080` serves both HTTP (frontend) and WebSocket (bridge).

## Navdata Updates

VirtualCDU uses a custom "ARINC-Lite" JSON schema for navigation data.

1. **Location**: `shared/src/fmc/navdata/`
2. **Format**: Defined in `docs/NAVDATA_SCHEMA.md`.
3. **Update Procedure**:
   - Add new airports/waypoints to the JSON files.
   - Run `npm run test` to ensure the route parser still functions.
   - Deploy via the standard CI/CD pipeline.

## Monitoring

- **Heartbeat**: The bridge server has a 5-second heartbeat mechanism.
- **Frontend Diagnostics**: Access the "Connection Status" panel in the app to view real-time latency and server uptime.
- **Visual Regression**: Run `npm run capture:baseline` periodically to ensure UI updates haven't introduced regressions.

## Troubleshooting

### Connection Failures

- Verify the bridge server is running: `docker logs virtual-cdu`.
- Check WebSocket connectivity: Use browser devtools to monitor the `ws://` connection.
- PMDG Integration: Ensure `node-simconnect` is correctly configured on the Windows machine running the bridge (if using local bridge).

### PWA / Caching Issues

- If the app doesn't update, use the "Update" prompt in the UI or manually clear the service worker cache in the browser.
