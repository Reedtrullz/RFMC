import { useFMCStore } from '../../store/useFMCStore';
import { useDraggable } from '../../hooks/useDraggable';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';

export function EICASPanel() {
  const alerts = useFMCStore((s) => s.alerts);
  const cockpitMode = useFMCStore((s) => s.cockpitMode);
  const aircraftState = useFMCStore((s) => s.aircraftState);
  const isHidden = useCockpitLayoutStore((s) => s.hiddenPanels.includes('eicas'));

  const { position, dragHandlers, isDragging } = useDraggable();

  if (!cockpitMode || isHidden) return null;

  // 1. Crew Alerting System (CAS) Overlay
  const displayAlerts = alerts.filter((a) => a.level !== 'STATUS').slice(0, 10);

  // 2. Primary Engine Indications (EICAS Engine Display)
  const vs = aircraftState?.verticalSpeedFpm ?? 0;

  // Dynamic N1 calculations (B737 idle 32%, cruise ~65-75%, climb/takeoff ~90-96%)
  let targetN1 = 64.5;
  if (vs < -100) {
    targetN1 = Math.max(32.0, 64.5 + vs / 150);
  } else if (vs > 100) {
    targetN1 = Math.min(95.5, 74.0 + vs / 100);
  }

  const n1_1 = targetN1.toFixed(1);
  const n1_2 = (targetN1 + 0.1).toFixed(1);

  // EGT (approx 360°C at idle, 820°C max)
  const egt_1 = Math.round(360 + (targetN1 - 32.0) * 7.2);
  const egt_2 = egt_1 - 2;

  // N2 (idle 59%, max 98%)
  const n2_1 = (59.0 + (targetN1 - 32.0) * 0.61).toFixed(1);
  const n2_2 = (59.0 + (targetN1 - 32.0) * 0.61 + 0.1).toFixed(1);

  // Fuel Flow (lbs/hr per engine: 800 idle, ~4000 max)
  const ff_1 = Math.round(800 + (targetN1 - 32.0) * 50.8);
  const ff_2 = ff_1 - 10;

  return (
    <>
      {/* Alerts Overlay Panel */}
      {displayAlerts.length > 0 && (
        <div className="fixed top-[45%] left-1/2 -translate-x-1/2 w-[300px] pointer-events-none z-50">
          <div className="flex flex-col items-center space-y-1">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-4 py-1 rounded text-[11px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 ${getAlertStyles(alert.level)}`}
              >
                {alert.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Engine EICAS Panel (Floating HUD Card) */}
      <div
        className={`fixed bottom-4 right-4 z-40 bg-zinc-950/95 border rounded-lg p-3 text-white font-mono w-[240px] shadow-2xl backdrop-blur-md pointer-events-auto transition-transform ${isDragging ? 'scale-[1.01] border-cdu-cyan' : 'border-zinc-800'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out, scale 0.2s ease-out',
        }}
        data-testid="eicas-primary-engine"
      >
        <div
          className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-800 pb-1 mb-2 flex justify-between cursor-grab active:cursor-grabbing"
          {...dragHandlers}
          title="Drag to reposition panel"
        >
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-zinc-600 select-none mr-0.5">⠿</span>
            <span>Engine Primary</span>
          </div>
          <span className="text-cdu-cyan font-bold">EICAS</span>
        </div>

        <div className="space-y-2 text-xs">
          {/* N1 Indicator */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>ENG 1</span>
              <span className="font-bold text-emerald-400">N1 %</span>
              <span>ENG 2</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-zinc-900">
              <span className="text-emerald-400">{n1_1}</span>
              <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-emerald-500 absolute left-0 top-0 transition-all duration-500"
                  style={{ width: `${Math.min(100, (targetN1 / 100) * 100)}%` }}
                />
              </div>
              <span className="text-emerald-400">{n1_2}</span>
            </div>
          </div>

          {/* EGT Indicator */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>ENG 1</span>
              <span className="font-bold text-amber-500">EGT °C</span>
              <span>ENG 2</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-zinc-900">
              <span>{egt_1}</span>
              <span className="text-[10px] text-zinc-600 font-normal">─</span>
              <span>{egt_2}</span>
            </div>
          </div>

          {/* N2 Indicator */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>ENG 1</span>
              <span className="font-bold text-zinc-400">N2 %</span>
              <span>ENG 2</span>
            </div>
            <div className="flex justify-between text-zinc-300 bg-black/40 px-2 py-0.5 rounded border border-zinc-900">
              <span>{n2_1}</span>
              <span className="text-[10px] text-zinc-700 font-normal">─</span>
              <span>{n2_2}</span>
            </div>
          </div>

          {/* Fuel Flow Indicator */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>ENG 1</span>
              <span className="font-bold text-cdu-cyan">FF LBS/H</span>
              <span>ENG 2</span>
            </div>
            <div className="flex justify-between text-cdu-cyan bg-black/40 px-2 py-0.5 rounded border border-zinc-900">
              <span>{ff_1}</span>
              <span className="text-[10px] text-zinc-600 font-normal">─</span>
              <span>{ff_2}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getAlertStyles(level: string) {
  switch (level) {
    case 'WARNING':
      return 'bg-red-600 text-white shadow-lg shadow-red-900/50';
    case 'CAUTION':
      return 'bg-amber-500 text-black shadow-lg shadow-amber-900/50';
    case 'ADVISORY':
      return 'bg-transparent text-white border border-white/20 backdrop-blur-sm';
    default:
      return 'text-white';
  }
}
