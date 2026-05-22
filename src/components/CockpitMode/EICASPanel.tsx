import { useFMCStore } from '../../store/useFMCStore';
import { useDraggable } from '../../hooks/useDraggable';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { InstrumentBezel } from '../instruments/common/InstrumentBezel';
import { ScreenGlass } from '../instruments/common/ScreenGlass';

// Circular SVG dial component mimicking Boeing 737 NG Engine Indicating System (EIS) primary instruments.
// Renders a 270-degree clockwise sweeping needle with limit tick marks and central readouts.
function EICSDial({
  value,
  maxVal,
  label,
  color,
  limit,
}: {
  value: number;
  maxVal: number;
  label: string;
  color: string;
  limit: number;
}) {
  const center = 50;
  const radius = 35;
  const startAngle = 135;
  const sweepAngle = 270;

  // Linear scale to radians
  const percentage = Math.min(1.0, Math.max(0.0, value / maxVal));
  const angleDeg = startAngle + percentage * sweepAngle;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Needle end coordinate
  const needleLen = 28;
  const pointerX = center + needleLen * Math.cos(angleRad);
  const pointerY = center + needleLen * Math.sin(angleRad);

  // Limit tick mark coordinate
  const limitPercent = limit / maxVal;
  const limitAngleRad = ((startAngle + limitPercent * sweepAngle) * Math.PI) / 180;
  const limitX1 = center + (radius - 3) * Math.cos(limitAngleRad);
  const limitY1 = center + (radius - 3) * Math.sin(limitAngleRad);
  const limitX2 = center + (radius + 2) * Math.cos(limitAngleRad);
  const limitY2 = center + (radius + 2) * Math.sin(limitAngleRad);

  // Background circular track points (approximate start and end)
  const xStart = center + radius * Math.cos((startAngle * Math.PI) / 180);
  const yStart = center + radius * Math.sin((startAngle * Math.PI) / 180);
  const xEnd = center + radius * Math.cos(((startAngle + sweepAngle) * Math.PI) / 180);
  const yEnd = center + radius * Math.sin(((startAngle + sweepAngle) * Math.PI) / 180);

  const isExceeded = value > limit;

  return (
    <div className="flex flex-col items-center w-24">
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        {/* Grey background scale arc */}
        <path
          d={`M ${xStart} ${yStart} A ${radius} ${radius} 0 1 1 ${xEnd} ${yEnd}`}
          fill="none"
          stroke="#27272a"
          strokeWidth="3"
        />

        {/* Red exceeding limit tick mark */}
        <line x1={limitX1} y1={limitY1} x2={limitX2} y2={limitY2} stroke="#ef4444" strokeWidth="3" />

        {/* Dynamic needle pointer */}
        <line
          x1={center}
          y1={center}
          x2={pointerX}
          y2={pointerY}
          stroke={isExceeded ? '#ef4444' : color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center pivot point */}
        <circle cx={center} cy={center} r="4" fill="#52525b" />

        {/* Value readout overlay inside the dial */}
        <text
          x={center}
          y={center + 20}
          textAnchor="middle"
          fill={isExceeded ? '#ef4444' : '#ffffff'}
          className="text-[12px] font-black font-mono tracking-tighter"
        >
          {value.toFixed(0)}
        </text>
      </svg>
      <span className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">{label}</span>
    </div>
  );
}

function useEngineData() {
  const aircraftState = useFMCStore((s) => s.aircraftState);
  const vs = aircraftState?.verticalSpeedFpm ?? 0;

  let targetN1 = 64.5;
  if (vs < -100) {
    targetN1 = Math.max(32.0, 64.5 + vs / 150);
  } else if (vs > 100) {
    targetN1 = Math.min(95.5, 74.0 + vs / 100);
  }

  return {
    n1_1: targetN1,
    n1_2: targetN1 + 0.1,
    egt_1: Math.round(360 + (targetN1 - 32.0) * 7.2),
    egt_2: Math.round(360 + (targetN1 - 32.0) * 7.2) - 2,
    n2_1: (59.0 + (targetN1 - 32.0) * 0.61).toFixed(1),
    n2_2: (59.0 + (targetN1 - 32.0) * 0.61 + 0.1).toFixed(1),
    ff_1: Math.round(800 + (targetN1 - 32.0) * 50.8),
    ff_2: Math.round(800 + (targetN1 - 32.0) * 50.8) - 10,
  };
}

export function EICASInstrument() {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const isBoeing = aircraft === 'BOEING_737';
  const data = useEngineData();
  const gearDown = useAircraftStore((s) => s.aircraftState?.gearDown ?? false);
  const flapsPosition = useAircraftStore((s) => s.aircraftState?.flapsPosition ?? 0);
  const alerts = useFMCStore((s) => s.alerts);
  const displayAlerts = alerts.filter((a) => a.level !== 'STATUS').slice(0, 10);

  return (
    <div className="h-full w-full" data-testid="eicas-instrument">
      <InstrumentBezel variant={isBoeing ? 'boeing-eicas' : 'airbus-ecam'} className="h-full w-full">
        <ScreenGlass className="h-full w-full flex flex-col items-center justify-center p-2 bg-black">
          <div className="flex flex-col w-[300px] gap-6 transform scale-110">
            {/* N1 Dials Row */}
            <div>
              <div className="flex justify-between items-center text-xs text-zinc-400 font-bold uppercase tracking-wide px-2">
                <span>ENG 1</span>
                <span className="text-emerald-400">N1 %</span>
                <span>ENG 2</span>
              </div>
              <div className="flex justify-between mt-2">
                <EICSDial value={data.n1_1} maxVal={110} label="L N1" color="#10b981" limit={98} />
                <EICSDial value={data.n1_2} maxVal={110} label="R N1" color="#10b981" limit={98} />
              </div>
            </div>

            {/* EGT Dials Row */}
            <div>
              <div className="flex justify-between items-center text-xs text-zinc-400 font-bold uppercase tracking-wide px-2">
                <span>ENG 1</span>
                <span className="text-amber-500">EGT °C</span>
                <span>ENG 2</span>
              </div>
              <div className="flex justify-between mt-2">
                <EICSDial value={data.egt_1} maxVal={1000} label="L EGT" color="#f59e0b" limit={820} />
                <EICSDial value={data.egt_2} maxVal={1000} label="R EGT" color="#f59e0b" limit={820} />
              </div>
            </div>

            {/* Secondary Displays (N2, FF, Gear, Flaps) */}
            <div className="flex w-full gap-4 mt-2">
              {/* N2 and FF */}
              <div className="flex-1 bg-[#0f0f11] border border-zinc-800 rounded-md p-3 text-[13px] space-y-3 font-bold">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 uppercase">N2 %</span>
                  <div className="flex gap-4">
                    <span className="text-zinc-300">{data.n2_1}</span>
                    <span className="text-zinc-300">{data.n2_2}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 uppercase">FF LBS/H</span>
                  <div className="flex gap-4">
                    <span className="text-cdu-cyan">{data.ff_1}</span>
                    <span className="text-cdu-cyan">{data.ff_2}</span>
                  </div>
                </div>
              </div>

              {/* Configuration (Gear & Flaps) */}
              <div className="flex-1 bg-[#0f0f11] border border-zinc-800 rounded-md p-2 flex flex-col justify-around items-center">
                {/* Gear Indicator */}
                <div className="flex flex-col items-center mt-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">GEAR</span>
                  {gearDown ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-5 h-5 border-2 border-[#00ff44] bg-[#00ff44]/30 rounded-[3px] shadow-[0_0_8px_#00ff44] flex items-center justify-center text-[#00ff44] text-[8px] font-black">
                        N
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-5 h-5 border-2 border-[#00ff44] bg-[#00ff44]/30 rounded-[3px] shadow-[0_0_8px_#00ff44] flex items-center justify-center text-[#00ff44] text-[8px] font-black">
                          L
                        </div>
                        <div className="w-5 h-5 border-2 border-[#00ff44] bg-[#00ff44]/30 rounded-[3px] shadow-[0_0_8px_#00ff44] flex items-center justify-center text-[#00ff44] text-[8px] font-black">
                          R
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-sm font-bold tracking-widest mt-2 mb-2">UP</span>
                  )}
                </div>

                {/* Flaps Indicator */}
                <div className="flex items-baseline gap-2 mt-2 w-full justify-center border-t border-zinc-800/50 pt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">FLAPS</span>
                  <span className={`text-xl font-black ${flapsPosition > 0 ? 'text-[#00ff44]' : 'text-cdu-cyan'}`}>
                    {flapsPosition > 0 ? flapsPosition : 'UP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instrument-level Alerts */}
            {displayAlerts.length > 0 && (
              <div className="mt-4 flex flex-col items-center space-y-1">
                {displayAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-wider ${getAlertStyles(alert.level)}`}
                  >
                    {alert.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScreenGlass>
      </InstrumentBezel>
    </div>
  );
}

export function EICASPanel() {
  const alerts = useFMCStore((s) => s.alerts);
  const cockpitMode = useFMCStore((s) => s.cockpitMode);
  // Only show the floating HUD if EICAS is NOT in the layout, but the user hasn't explicitly hidden it either.
  // Actually, let's only show it if it's explicitly allowed. But wait, if they have an EICAS instrument, we don't need the floating one.
  const isHidden = useCockpitLayoutStore((s) => s.hiddenPanels.includes('eicas'));
  const layoutMode = useCockpitLayoutStore((s) => s.cockpitLayoutMode);

  // If the layout includes EICAS natively, we don't need the floating one.
  const gridHasEicas = layoutMode === 'full-deck' || (layoutMode === 'free-practice' && !isHidden);

  const { position, dragHandlers, isDragging } = useDraggable();
  const data = useEngineData();

  if (!cockpitMode) return null;

  // 1. Crew Alerting System (CAS) Overlay
  const displayAlerts = alerts.filter((a) => a.level !== 'STATUS').slice(0, 10);

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
      {!gridHasEicas && !isHidden && (
        <div
          className={`fixed bottom-4 right-4 z-40 bg-zinc-950/95 border rounded-lg p-3 text-white font-mono w-[260px] shadow-2xl backdrop-blur-md pointer-events-auto transition-transform ${isDragging ? 'scale-[1.01] border-cdu-cyan' : 'border-zinc-800'}`}
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
            <span className="text-cdu-cyan font-bold">EIS</span>
          </div>

          <div className="space-y-3">
            {/* N1 Dials Row */}
            <div>
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wide px-1">
                <span>ENG 1</span>
                <span className="text-emerald-400">N1 %</span>
                <span>ENG 2</span>
              </div>
              <div className="flex justify-between mt-1">
                <EICSDial value={data.n1_1} maxVal={110} label="L N1" color="#10b981" limit={98} />
                <EICSDial value={data.n1_2} maxVal={110} label="R N1" color="#10b981" limit={98} />
              </div>
            </div>

            {/* EGT Dials Row */}
            <div>
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wide px-1">
                <span>ENG 1</span>
                <span className="text-amber-500">EGT °C</span>
                <span>ENG 2</span>
              </div>
              <div className="flex justify-between mt-1">
                <EICSDial value={data.egt_1} maxVal={1000} label="L EGT" color="#f59e0b" limit={820} />
                <EICSDial value={data.egt_2} maxVal={1000} label="R EGT" color="#f59e0b" limit={820} />
              </div>
            </div>

            {/* Secondary Digital Indications */}
            <div className="bg-black/40 border border-zinc-900 rounded p-2 text-xs space-y-1.5 font-bold">
              {/* N2 Digital readout */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase">N2 %</span>
                <div className="flex gap-4">
                  <span className="text-zinc-300">{data.n2_1}</span>
                  <span className="text-zinc-300">{data.n2_2}</span>
                </div>
              </div>

              {/* Fuel Flow Digital readout */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase">FF LBS/H</span>
                <div className="flex gap-4">
                  <span className="text-cdu-cyan">{data.ff_1}</span>
                  <span className="text-cdu-cyan">{data.ff_2}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
