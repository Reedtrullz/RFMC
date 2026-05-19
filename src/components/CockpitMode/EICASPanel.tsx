import { useFMCStore } from '../../store/useFMCStore';
import { useDraggable } from '../../hooks/useDraggable';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';

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

  const n1_1 = targetN1;
  const n1_2 = targetN1 + 0.1;

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
              <EICSDial value={n1_1} maxVal={110} label="L N1" color="#10b981" limit={98} />
              <EICSDial value={n1_2} maxVal={110} label="R N1" color="#10b981" limit={98} />
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
              <EICSDial value={egt_1} maxVal={1000} label="L EGT" color="#f59e0b" limit={820} />
              <EICSDial value={egt_2} maxVal={1000} label="R EGT" color="#f59e0b" limit={820} />
            </div>
          </div>

          {/* Secondary Digital Indications */}
          <div className="bg-black/40 border border-zinc-900 rounded p-2 text-xs space-y-1.5 font-bold">
            {/* N2 Digital readout */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase">N2 %</span>
              <div className="flex gap-4">
                <span className="text-zinc-300">{n2_1}</span>
                <span className="text-zinc-300">{n2_2}</span>
              </div>
            </div>

            {/* Fuel Flow Digital readout */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase">FF LBS/H</span>
              <div className="flex gap-4">
                <span className="text-cdu-cyan">{ff_1}</span>
                <span className="text-cdu-cyan">{ff_2}</span>
              </div>
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
