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
  
  const alerts = useFMCStore(s => s.alerts);
  
  const lastGpws = useRef(gpwsAlert);
  const lastTcas = useRef(tcasAlert);
  const lastApStatus = useRef(apStatus);
  const lastAlertCount = useRef(alerts.length);

  useEffect(() => {
    // Handle new alerts (Master Caution/Warning)
    if (alerts.length > lastAlertCount.current) {
      const newAlert = alerts[alerts.length - 1];
      if (newAlert.level === 'WARNING') {
        if (aircraft.includes('AIRBUS')) AuralAlertService.playContinuousChime(2);
        else AuralAlertService.playCavalryCharge(); // Boeing style warning
      } else if (newAlert.level === 'CAUTION') {
        if (aircraft.includes('AIRBUS')) AuralAlertService.playSingleChime();
        else AuralAlertService.playChime(); // Boeing style caution chime
      }
    }
    lastAlertCount.current = alerts.length;

    // Handle GPWS Alerts
    if (gpwsAlert !== lastGpws.current) {
      switch (gpwsAlert) {
        case 'PULL_UP':
          AuralAlertService.playPullUp();
          break;
        case 'TERRAIN':
          AuralAlertService.playTerrain();
          break;
        case 'SINK_RATE':
          AuralAlertService.playSinkRate();
          break;
        case 'DONT_SINK':
          AuralAlertService.playDontSink();
          break;
        case 'GLIDESLOPE':
          AuralAlertService.playGlideslope();
          break;
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
      if (aircraft.includes('AIRBUS')) {
        AuralAlertService.playCavalryCharge(); // In a real Airbus it's a rep-rep-rep, but we'll use Cavalry for Boeing-style or implement Airbus specific later
      } else {
        AuralAlertService.playCavalryCharge();
      }
    }
    lastApStatus.current = apStatus;

  }, [gpwsAlert, tcasAlert, apStatus, aircraft]);

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
