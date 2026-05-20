import React from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { TrainingStep } from '@shared';

// Helper to resolve nested object path values (e.g. autopilot.truth.selectedHeading)
function getNestedValue(obj: any, path: string): any {
  let current = obj;
  const keys = path.split('.');
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

// Helper to check if a single validation condition is satisfied
function checkCondition(actual: any, expected: any, operator: string = '=='): boolean {
  switch (operator) {
    case '!=':
      return actual != expected;
    case '>':
      return Number(actual) > Number(expected);
    case '<':
      return Number(actual) < Number(expected);
    case 'includes':
      return Array.isArray(actual) && actual.includes(expected);
    default:
      return actual == expected;
  }
}

// Beautiful translation of raw state paths/values into polished, human-readable aviation checklist items
function formatConditionLabel(path: string, expected: any, operator: string = '=='): string {
  const prettyPath = (() => {
    switch (path) {
      case 'autopilot.boeing.speed':
      case 'autopilot.airbus.speed':
      case 'autopilot.truth.selectedSpeed':
        return 'Selected Speed';
      case 'autopilot.boeing.heading':
      case 'autopilot.airbus.heading':
      case 'autopilot.truth.selectedHeading':
        return 'Selected Heading';
      case 'autopilot.boeing.altitude':
      case 'autopilot.airbus.altitude':
      case 'autopilot.truth.selectedAltitude':
        return 'Selected Altitude';
      case 'autopilot.boeing.vs':
      case 'autopilot.airbus.vs':
      case 'autopilot.truth.selectedVs':
        return 'Vertical Speed';
      case 'autopilot.truth.lateralActive':
        return 'Active Lateral Mode';
      case 'autopilot.truth.lateralArmed':
        return 'Armed Lateral Mode';
      case 'autopilot.truth.verticalActive':
        return 'Active Vertical Mode';
      case 'autopilot.truth.verticalArmed':
        return 'Armed Vertical Mode';
      case 'autopilot.truth.flightDirector':
      case 'autopilot.truth.fdActive':
      case 'autopilot.truth.fdL':
      case 'autopilot.truth.fdR':
        return 'Flight Director';
      case 'autopilot.truth.autothrustActive':
      case 'autopilot.truth.athrActive':
        return 'Autothrust';
      case 'autopilot.truth.autopilotStatus':
        return 'Autopilot';
      case 'position.irsState':
        return 'IRS Alignment';
      case 'performance.zfw':
        return 'Zero Fuel Weight (ZFW)';
      case 'performance.v1':
        return 'V1 Decision Speed';
      case 'performance.vr':
        return 'VR Rotation Speed';
      case 'performance.v2':
        return 'V2 Safety Speed';
      case 'currentPage':
        return 'Active FMC Page';
      default:
        const base = path.split('.').pop() || path;
        return base.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    }
  })();

  const prettyExpected = (() => {
    if (typeof expected === 'boolean') {
      return expected ? 'ON' : 'OFF';
    }
    return String(expected);
  })();

  const prettyOperator = (() => {
    switch (operator) {
      case '!=':
        return 'should not be';
      case '>':
        return 'greater than';
      case '<':
        return 'less than';
      case 'includes':
        return 'containing';
      default:
        return 'to';
    }
  })();

  return `${prettyPath} ${prettyOperator} ${prettyExpected}`;
}

export function StepCard({ step }: { step: TrainingStep }) {
  const tutorialHint = useFMCStore((s) => s.tutorialHint);
  const storeState = useFMCStore();

  return (
    <div className="bg-cdu-bezel/95 backdrop-blur border border-cdu-cyan/30 rounded-lg p-4 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-cdu-cyan text-xs font-cdu uppercase tracking-wider">Current Task</span>
        <span className="text-cdu-text/40 text-[10px] font-cdu uppercase">{step.objective}</span>
      </div>

      <p className="text-cdu-text text-lg font-cdu leading-relaxed mb-4">{step.instruction}</p>

      {tutorialHint && (
        <div className="bg-cdu-amber/10 border border-cdu-amber/30 rounded p-2 mb-2">
          <p className="text-cdu-amber text-xs font-cdu">
            <span className="font-bold mr-1">HINT:</span>
            {tutorialHint}
          </p>
        </div>
      )}

      {/* Real-time State-Aware Checklist Overlay */}
      {step.stateValidation && step.stateValidation.length > 0 && (
        <div className="mt-4 border-t border-cdu-cyan/20 pt-3">
          <span className="text-[10px] font-cdu uppercase tracking-wider text-cdu-cyan/80 block mb-2">
            Verification Checklist
          </span>
          <div className="space-y-1.5">
            {step.stateValidation.map((validation, idx) => {
              const actualValue = getNestedValue(storeState, validation.path);
              const isSatisfied = checkCondition(actualValue, validation.expected, validation.operator);
              const label = formatConditionLabel(validation.path, validation.expected, validation.operator);

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 p-2 rounded transition-all duration-300 ${
                    isSatisfied
                      ? 'bg-cdu-green/5 border border-cdu-green/20'
                      : 'bg-cdu-text/5 border border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isSatisfied ? (
                      <svg
                        className="w-4 h-4 text-cdu-green drop-shadow-[0_0_4px_rgba(0,255,0,0.6)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-cdu-text/20 animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="9" strokeDasharray="4 4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow flex items-center justify-between text-xs font-cdu">
                    <span className={isSatisfied ? 'text-cdu-green font-medium' : 'text-cdu-text/70'}>{label}</span>
                    <span
                      className={`text-[10px] uppercase font-mono ${isSatisfied ? 'text-cdu-green/80' : 'text-cdu-text/30'}`}
                    >
                      {isSatisfied ? 'OK' : String(actualValue ?? 'PENDING')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 text-[10px] font-cdu text-cdu-text/60">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cdu-cyan animate-pulse" />
          <span>WAITING FOR ACTION</span>
        </div>
        {step.stateValidation && step.stateValidation.length > 0 && (
          <span className="text-[9px] uppercase bg-cdu-cyan/10 border border-cdu-cyan/20 px-1.5 py-0.5 rounded text-cdu-cyan font-semibold tracking-wide">
            Auto-Verify Active
          </span>
        )}
      </div>
    </div>
  );
}
