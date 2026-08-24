import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectionStatus } from '../ConnectionStatus';
import { useAircraftStore } from '../../store/aircraftStore';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { useConnectionStore } from '../../store/connectionStore';

const connectSpy = vi.hoisted(() => vi.fn());
const disconnectSpy = vi.hoisted(() => vi.fn());
const sendSpy = vi.hoisted(() => vi.fn());
const saveServerUrlSpy = vi.hoisted(() => vi.fn());
const getServerUrlSpy = vi.hoisted(() => vi.fn(() => 'ws://localhost:8080'));

vi.mock('../../hooks/useWebSocket', () => ({
  getServerUrl: getServerUrlSpy,
  saveServerUrl: saveServerUrlSpy,
  useWebSocket: () => ({
    connect: connectSpy,
    disconnect: disconnectSpy,
    send: sendSpy,
    connectionStatus: 'DISCONNECTED',
  }),
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerUrlSpy.mockReturnValue('ws://localhost:8080');

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    useCockpitLayoutStore.setState({ cockpitMode: false, hiddenPanels: [] });
    useConnectionStore.setState({
      adapterHealth: null,
      connectedAircraft: null,
      connectedAircraftType: null,
      connectedCapabilities: null,
      connectionMode: 'STANDALONE',
      connectionStatus: 'DISCONNECTED',
      lastError: null,
      latency: 0,
      sessionStartTime: null,
      structuredCapabilities: null,
    });
    useAircraftStore.setState({ aircraft: 'BOEING_737', aircraftState: null });
  });

  it('trims and passes the entered server URL into the immediate connect call', () => {
    render(<ConnectionStatus />);
    fireEvent.click(screen.getByRole('button', { name: /disconnected/i }));

    const input = screen.getByLabelText('Server URL (WebSocket)');
    fireEvent.change(input, { target: { value: ' ws://192.168.0.42:9090 ' } });
    fireEvent.click(screen.getByRole('button', { name: /connect to msfs/i }));

    expect(saveServerUrlSpy).toHaveBeenCalledWith('ws://192.168.0.42:9090');
    expect(connectSpy).toHaveBeenCalledWith('ws://192.168.0.42:9090');
  });

  it('does not save or connect with an empty server URL', () => {
    render(<ConnectionStatus />);
    fireEvent.click(screen.getByRole('button', { name: /disconnected/i }));

    fireEvent.change(screen.getByLabelText('Server URL (WebSocket)'), { target: { value: '   ' } });
    const connectButton = screen.getByRole('button', { name: /connect to msfs/i });

    expect(connectButton).toBeDisabled();
    fireEvent.click(connectButton);
    expect(saveServerUrlSpy).not.toHaveBeenCalled();
    expect(connectSpy).not.toHaveBeenCalled();
  });
});
