import { useEffect, useRef } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { AuralAlertService } from '../services/AuralAlertService';

/**
 * Hook to manage aural alerts based on FMC/PFD state changes.
 * Ensures alerts are played only once per trigger.
 */
export function useAuralAlerts() {
  const gpwsAlert = useFMCStore(s => s.gpwsAlert);
  const tcasAlert = useFMCStore(s => s.tcasAlert);
  const aircraft = useFMCStore(s => s.aircraft);
  const apStatus = useFMCStore(s => s.autopilot.truth.autopilotStatus);
  const fma = useFMCStore(s => s.autopilot.truth.fma);
  
  const alerts = useFMCStore(s => s.alerts);
  
  const lastGpws = useRef(gpwsAlert);
  const lastTcas = useRef(tcasAlert);
  const lastApStatus = useRef(apStatus);
  const lastProcessedAlertId = useRef<string | null>(null);
  const lastFma = useRef(JSON.stringify(fma));

  useEffect(() => {
    const isAirbus = aircraft.includes('AIRBUS');

    // Handle new alerts (Master Caution/Warning)
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      if (latestAlert.id !== lastProcessedAlertId.current) {
        if (latestAlert.level === 'WARNING') {
          if (isAirbus) AuralAlertService.playAirbusWarning(2);
          else AuralAlertService.playBoeingWarning();
        } else if (latestAlert.level === 'CAUTION') {
          if (isAirbus) AuralAlertService.playAirbusCaution();
          else AuralAlertService.playBoeingCaution();
        }
        lastProcessedAlertId.current = latestAlert.id;
      }
    } else {
      lastProcessedAlertId.current = null;
    }

    // Handle FMA Changes (Airbus Triple Click)
    const currentFmaStr = JSON.stringify(fma);
    if (isAirbus && currentFmaStr !== lastFma.current) {
      // Only play if it's a significant mode change, not just values
      AuralAlertService.playAirbusTripleClick();
      lastFma.current = currentFmaStr;
    }

    // Handle GPWS Alerts
    if (gpwsAlert !== lastGpws.current) {
      switch (gpwsAlert) {
        case 'PULL_UP': AuralAlertService.playPullUp(); break;
        case 'TERRAIN': AuralAlertService.playTerrain(); break;
        case 'SINK_RATE': AuralAlertService.playSinkRate(); break;
        case 'DONT_SINK': AuralAlertService.playDontSink(); break;
        case 'GLIDESLOPE': AuralAlertService.playGlideslope(); break;
      }
      lastGpws.current = gpwsAlert;
    }

    // Handle TCAS Alerts
    if (tcasAlert && !lastTcas.current) {
      AuralAlertService.playTraffic();
    }
    lastTcas.current = tcasAlert;

    // Handle Autopilot Disconnect
    if (lastApStatus.current !== 'OFF' && apStatus === 'OFF') {
      AuralAlertService.playBoeingWarning(); // Cavalry charge is used for both for now, or specifically Boeing
    }
    lastApStatus.current = apStatus;

  }, [gpwsAlert, tcasAlert, apStatus, aircraft, alerts, fma]);

  // Global user interaction listener to resume audio context
  useEffect(() => {
    const resume = () => {
      // @ts-ignore - access private context to resume
      if (AuralAlertService.context?.state === 'suspended') {
        // @ts-ignore
        AuralAlertService.context.resume();
      }
    };
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    return () => {
      window.removeEventListener('click', resume);
      window.removeEventListener('keydown', resume);
    };
  }, []);
}
