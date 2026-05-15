import { create } from 'zustand';
import type { 
  PageType, RouteData, FlightPlan, CDUKey, LSKId, 
  DisplayData, FlightPhase, FlightPlanWaypoint,
  AltitudeConstraint, SpeedConstraint
} from '@shared';
import { SCRATCHPAD_MAX, getPageRenderer, getAirbusPageRenderer } from '@shared';

export type ScratchpadMessageSeverity = 'advisory' | 'important' | 'data-entry' | 'navigation';

export interface ScratchpadMessage {
  text: string;
  aircraft: 'boeing' | 'airbus';
  severity: ScratchpadMessageSeverity;
  type?: 1 | 2;
  clearBehavior: 'clr-once' | 'clr-hold' | 'auto';
}

export interface FMCState {
  currentPage: PageType;
  pageHistory: PageType[];
  scratchpad: string;
  scratchpadError: string | null;
  scratchpadMessages: ScratchpadMessage[];
  
  route: RouteData;
  flightPlan: FlightPlan;
  pendingRoute: RouteData | null;
  pendingFlightPlan: FlightPlan | null;
  isModified: boolean;
  
  flightPhase: FlightPhase;
  
  legsPageIndex: number;
  legsPageCount: number;
  depArrSubPage: 'DEP' | 'ARR';
  rteSubPage: number;
  takeoffRefPageIndex: number;
  posPageIndex: number;
  
  hold: { fix: string; inboundCourse: number; legTime: number; legDist: number; direction: 'L' | 'R' };
  holdPending: any | null;
  fixEntries: { refFix: string; radial: number; distance: number }[];
}

export interface FMCActions {
  setPage: (page: PageType) => void;
  goBack: () => void;
  pressKey: (key: CDUKey, aircraft: 'BOEING_737' | 'AIRBUS_A320') => void;
  pressLSK: (side: 'L' | 'R', index: number, aircraft: 'BOEING_737' | 'AIRBUS_A320') => void;
  clearScratchpad: () => void;
  pressEXEC: () => void;
  addScratchpadMessage: (msg: ScratchpadMessage) => void;
  clearActiveMessage: () => void;
  setFlightPhase: (phase: FlightPhase) => void;
}

export type FMCStore = FMCState & FMCActions;

const defaultRoute: RouteData = { origin: '', destination: '', flightNumber: '', routeString: '', companyRoute: '', sid: null, star: null, approach: null, coRoute: '', runway: '' };
const defaultFlightPlan: FlightPlan = { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] };

export const useFMCStore = create<FMCStore>((set, get) => ({
  currentPage: 'IDENT',
  pageHistory: [],
  scratchpad: '',
  scratchpadError: null,
  scratchpadMessages: [],
  
  route: defaultRoute,
  flightPlan: defaultFlightPlan,
  pendingRoute: null,
  pendingFlightPlan: null,
  isModified: false,
  
  flightPhase: 'PREFLIGHT',
  
  legsPageIndex: 0,
  legsPageCount: 1,
  depArrSubPage: 'DEP',
  rteSubPage: 0,
  takeoffRefPageIndex: 0,
  posPageIndex: 0,
  
  hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' },
  holdPending: null,
  fixEntries: [{ refFix: '', radial: 0, distance: 0 }, { refFix: '', radial: 0, distance: 0 }],

  setPage: (page: PageType) => {
    const { currentPage, pageHistory } = get();
    set({
      currentPage: page,
      pageHistory: [...pageHistory, currentPage],
      scratchpad: '',
      scratchpadError: null,
    });
  },

  goBack: () => {
    const { pageHistory } = get();
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
      set({
        currentPage: prev,
        pageHistory: pageHistory.slice(0, -1),
        scratchpad: '',
        scratchpadError: null,
      });
    }
  },

  pressKey: (key, aircraft) => {
    const { scratchpad, currentPage } = get();
    
    // Alphanumeric input
    if (key.length === 1 || ['DOT', 'SLASH', 'PLUS_MINUS', 'SPACE'].includes(key)) {
      if (scratchpad.length < SCRATCHPAD_MAX) {
        const charMap: Record<string, string> = { DOT: '.', PLUS_MINUS: '+/-', SLASH: '/', SPACE: ' ' };
        const char = charMap[key] || key;
        set({ scratchpad: scratchpad + char, scratchpadError: null });
      }
      return;
    }

    if (key === 'CLR') {
      if (scratchpad.length > 0) {
        set({ scratchpad: scratchpad.slice(0, -1), scratchpadError: null });
      } else {
        get().clearActiveMessage();
      }
      return;
    }

    // Logic for other keys (EXEC, NEXT_PAGE, etc.) would go here
    // This is a simplified version for the new store structure
  },

  pressLSK: (side, index, aircraft) => {
    // LSK logic would go here, utilizing the page renderers
  },

  clearScratchpad: () => set({ scratchpad: '', scratchpadError: null }),

  pressEXEC: () => {
    const { isModified, pendingRoute, pendingFlightPlan } = get();
    if (isModified && (pendingRoute || pendingFlightPlan)) {
      set({
        route: pendingRoute || get().route,
        flightPlan: pendingFlightPlan || get().flightPlan,
        isModified: false,
        pendingRoute: null,
        pendingFlightPlan: null,
      });
    }
  },

  addScratchpadMessage: (msg) => set(state => ({ scratchpadMessages: [msg, ...state.scratchpadMessages] })),
  
  clearActiveMessage: () => set(state => ({ scratchpadMessages: state.scratchpadMessages.slice(1) })),

  setFlightPhase: (phase) => set({ flightPhase: phase }),
}));
