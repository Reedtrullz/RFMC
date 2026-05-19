import { useEffect, useRef } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { useAircraftStore } from '../store/aircraftStore';
import { useAutopilotStore } from '../store/autopilotStore';
import { AuralAlertService } from '../services/AuralAlertService';

/**
 * Hook to manage aural alerts based on FMC/PFD state changes.
 * Ensures alerts are played only once per trigger.
 */
export function useAuralAlerts() {
  const gpwsAlert = useFMCStore((s) => s.gpwsAlert);
  const tcasAlert = useFMCStore((s) => s.tcasAlert);
  const aircraft = useAircraftStore((s) => s.aircraft);
  const autopilotTruth = useAutopilotStore((s) => s.truth);
  const { lateralActive, verticalActive, thrustActive, autopilotStatus } = autopilotTruth;

  const alerts = useFMCStore((s) => s.alerts);

  const lastGpws = useRef(gpwsAlert);
  const lastTcas = useRef(tcasAlert);
  const lastApStatus = useRef(autopilotStatus);
  const lastProcessedAlertId = useRef<string | null>(null);
  const lastLateralActive = useRef(lateralActive);
  const lastVerticalActive = useRef(verticalActive);
  const lastThrustActive = useRef(thrustActive);

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
    if (
      isAirbus &&
      (lateralActive !== lastLateralActive.current ||
        verticalActive !== lastVerticalActive.current ||
        thrustActive !== lastThrustActive.current)
    ) {
      // Only play if it's a significant mode change, not just values
      AuralAlertService.playAirbusTripleClick();
      lastLateralActive.current = lateralActive;
      lastVerticalActive.current = verticalActive;
      lastThrustActive.current = thrustActive;
    }

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
        case 'TOO_LOW_GEAR':
          AuralAlertService.playTooLowGear();
          break;
        case 'TOO_LOW_FLAPS':
          AuralAlertService.playTooLowFlaps();
          break;
        case 'WINDSHEAR':
          AuralAlertService.playWindshear();
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
    if (lastApStatus.current !== 'OFF' && autopilotStatus === 'OFF') {
      AuralAlertService.playBoeingWarning(); // Cavalry charge is used for both for now, or specifically Boeing
    }
    lastApStatus.current = autopilotStatus;
  }, [gpwsAlert, tcasAlert, autopilotStatus, aircraft, alerts, lateralActive, verticalActive, thrustActive]);

  // Global user interaction listener to resume audio context
  useEffect(() => {
    const handleInteraction = () => {
      AuralAlertService.init();
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);
}
