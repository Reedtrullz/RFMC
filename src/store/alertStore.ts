import { create } from 'zustand';
import type { FlightDeckAlert, FmcMessage, MessageSeverity, AcarsMessage } from '@shared';

export interface AcarsUplink extends AcarsMessage {
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AlertState {
  alerts: FlightDeckAlert[];
  scratchpadMessages: FmcMessage[];
  gpwsAlert: string;
  tcasAlert: boolean;
  atsu: {
    messages: AcarsMessage[];
    pendingUplink: AcarsUplink | null;
  };
}

export interface AlertActions {
  addMessage: (text: string, severity: MessageSeverity, aircraft: 'boeing' | 'airbus', type?: 1 | 2) => void;
  clearActiveMessage: () => void;
  clearAlert: (id: string) => void;
  receiveAtsuMessage: (from: string, text: string) => void;
  setGpwsAlert: (alert: string) => void;
  setTcasAlert: (active: boolean) => void;
}

export type AlertStore = AlertState & AlertActions;

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  scratchpadMessages: [],
  gpwsAlert: 'NONE',
  tcasAlert: false,
  atsu: {
    messages: [],
    pendingUplink: null,
  },

  addMessage: (text: string, severity: MessageSeverity, aircraft: 'boeing' | 'airbus', type?: 1 | 2) => {
    const newMessage: FmcMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      severity,
      timestamp: Date.now(),
      aircraft,
      type,
    };
    set((state) => ({
      scratchpadMessages: [newMessage, ...state.scratchpadMessages],
    }));
  },

  clearActiveMessage: () => {
    set((state) => ({
      scratchpadMessages: state.scratchpadMessages.slice(1),
    }));
  },

  clearAlert: (id: string) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    }));
  },

  receiveAtsuMessage: (from: string, text: string) => {
    const msg: AcarsMessage = {
      id: Math.random().toString(36).substr(2, 9),
      from,
      text,
      timestamp: Date.now(),
      read: false,
      type: 'AOC',
    };
    set((state) => ({
      atsu: {
        ...state.atsu,
        messages: [msg, ...state.atsu.messages],
      },
    }));
  },

  setGpwsAlert: (alert: string) => set({ gpwsAlert: alert }),
  setTcasAlert: (active: boolean) => set({ tcasAlert: active }),
}));
