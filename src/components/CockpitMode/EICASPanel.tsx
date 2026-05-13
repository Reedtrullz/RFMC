import { useFMCStore } from '../../store/useFMCStore';

export function EICASPanel() {
  const alerts = useFMCStore(s => s.alerts);
  const cockpitMode = useFMCStore(s => s.cockpitMode);
  
  if (!cockpitMode) return null;

  // Only show Warning, Caution, and Advisory levels
  const displayAlerts = alerts.filter(a => a.level !== 'STATUS').slice(0, 10);

  if (displayAlerts.length === 0) return null;

  return (
    <div className="fixed top-[45%] left-1/2 -translate-x-1/2 w-[300px] pointer-events-none z-50">
      <div className="flex flex-col items-center space-y-1">
        {displayAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`px-4 py-1 rounded text-[11px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 ${getAlertStyles(alert.level)}`}
          >
            {alert.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function getAlertStyles(level: string) {
  switch (level) {
    case 'WARNING': return 'bg-red-600 text-white shadow-lg shadow-red-900/50';
    case 'CAUTION': return 'bg-amber-500 text-black shadow-lg shadow-amber-900/50';
    case 'ADVISORY': return 'bg-transparent text-white border border-white/20 backdrop-blur-sm';
    default: return 'text-white';
  }
}
