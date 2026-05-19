import { NavigationDisplayModel, projectGeoPointToND, NDProjectionContext } from '@shared';
import { useFMCStore } from '../../../store/useFMCStore';

interface DebriefOverlayProps {
  model: NavigationDisplayModel;
}

export function DebriefOverlay({ model }: DebriefOverlayProps) {
  const history = useFMCStore((s) => s.flightPathHistory);
  const debriefMode = useFMCStore((s) => s.debriefMode);

  if (!debriefMode || history.length < 2) return null;

  const state = useFMCStore.getState();
  const aircraftState = state.aircraftState;
  if (!aircraftState) return null;

  const projectionContext: NDProjectionContext = {
    style: model.style,
    mode: model.mode,
    rangeNm: model.range,
    heading: model.heading,
    isCentered: model.centered,
    aircraftPosition: { lat: aircraftState.lat, lon: aircraftState.lon },
    planCenter: { lat: aircraftState.lat, lon: aircraftState.lon },
  };

  const points = history
    .map((pos) => {
      return projectGeoPointToND({ lat: pos.lat, lon: pos.lon }, projectionContext);
    })
    .filter((p) => p !== null && p.visible);

  if (points.length < 2) return null;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p!.x} ${p!.y}`).join(' ');

  return (
    <g data-testid="nd-debrief-overlay">
      {/* Historical Track */}
      <path d={pathD} fill="none" stroke="#ffffff" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.5" />

      {/* Error Markers (Example: where ANP > RNP occurred) */}
      {history.map((pos, i) => {
        if (i % 30 !== 0) return null; // Only check every 30s
        // In a real system, we'd store specific events
        const p = projectGeoPointToND({ lat: pos.lat, lon: pos.lon }, projectionContext);
        if (!p || !p.visible) return null;

        return <circle key={`debrief-${i}`} cx={p.x} cy={p.y} r="0.8" fill="white" opacity="0.3" />;
      })}
    </g>
  );
}
