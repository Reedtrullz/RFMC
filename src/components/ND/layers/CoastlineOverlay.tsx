import { NavigationDisplayModel, projectGeoPointToND } from '@shared';

interface CoastlineOverlayProps {
  model: NavigationDisplayModel;
}

interface GeoPoint {
  lat: number;
  lon: number;
}

// ── High-Fidelity Western Europe Coastline Vectors ───────────────────────────
// These paths trace the coastlines along the EHAM-EGLL flight corridor
const GREAT_BRITAIN_COAST: GeoPoint[] = [
  { lat: 54.5, lon: -0.8 },
  { lat: 54.1, lon: -0.2 },
  { lat: 53.8, lon: -0.1 },
  { lat: 53.5, lon: 0.1 },
  { lat: 53.1, lon: 0.2 },
  { lat: 52.9, lon: 0.5 },
  { lat: 52.8, lon: 0.2 },
  { lat: 52.9, lon: 1.2 },
  { lat: 52.6, lon: 1.7 },
  { lat: 52.2, lon: 1.6 },
  { lat: 51.9, lon: 1.3 },
  { lat: 51.7, lon: 1.0 },
  { lat: 51.5, lon: 0.8 },
  { lat: 51.4, lon: 0.6 },
  { lat: 51.4, lon: 1.4 },
  { lat: 51.1, lon: 1.3 },
  { lat: 50.9, lon: 0.9 },
  { lat: 50.7, lon: 0.3 },
  { lat: 50.8, lon: -0.5 },
  { lat: 50.8, lon: -1.0 },
  { lat: 50.6, lon: -1.2 },
  { lat: 50.6, lon: -2.4 },
  { lat: 50.5, lon: -3.0 },
  { lat: 50.2, lon: -3.5 },
  { lat: 50.2, lon: -4.8 },
  { lat: 50.1, lon: -5.7 },
];

const CONTINENTAL_COAST: GeoPoint[] = [
  { lat: 53.5, lon: 6.5 },
  { lat: 53.3, lon: 5.0 },
  { lat: 52.9, lon: 4.7 },
  { lat: 52.4, lon: 4.5 }, // Near EHAM
  { lat: 52.1, lon: 4.2 },
  { lat: 51.9, lon: 4.0 },
  { lat: 51.6, lon: 3.7 },
  { lat: 51.4, lon: 3.4 },
  { lat: 51.3, lon: 3.2 }, // Belgium
  { lat: 51.2, lon: 2.9 },
  { lat: 51.0, lon: 2.5 },
  { lat: 50.9, lon: 1.8 }, // France (Calais)
  { lat: 50.5, lon: 1.6 },
  { lat: 50.0, lon: 1.1 },
  { lat: 49.8, lon: 0.2 },
];

// ── Realistic Country Borders ────────────────────────────────────────────────
const BELGIUM_NETHERLANDS_BORDER: GeoPoint[] = [
  { lat: 51.3, lon: 3.4 },
  { lat: 51.2, lon: 4.0 },
  { lat: 51.4, lon: 4.8 },
  { lat: 51.1, lon: 5.7 },
  { lat: 50.8, lon: 6.0 },
];

const FRANCE_BELGIUM_BORDER: GeoPoint[] = [
  { lat: 51.0, lon: 2.5 },
  { lat: 50.8, lon: 2.7 },
  { lat: 50.3, lon: 4.1 },
  { lat: 50.0, lon: 4.8 },
];

export function CoastlineOverlay({ model }: CoastlineOverlayProps) {
  // Coastlines are base map elements, always visible as a subtle reference when IRS is in NAV (or GPS)
  if (model.irsState !== 'NAV' && model.navSource !== 'GPS') return null;

  const isPlanMode = model.mode === 'PLAN' || model.mode === 'PLN';
  const cy = model.centered ? 50 : 84;

  const context = {
    aircraftPosition: model.aircraftPosition,
    heading: model.heading,
    rangeNm: model.range,
    mode: model.mode,
    isCentered: model.centered,
    style: model.style,
  };

  // Helper to project a geo path into SVG points and compile an SVG path string
  const renderPath = (points: GeoPoint[], isDashed: boolean, strokeColor: string) => {
    let d = '';
    let drawing = false;

    for (let i = 0; i < points.length; i++) {
      const p = projectGeoPointToND(points[i], context);
      if (p) {
        // Ensure points are strictly within or close to the compass boundary for clean clipping
        const distFromCenter = Math.sqrt((p.x - 50) ** 2 + (p.y - cy) ** 2);
        if (distFromCenter > 50) {
          drawing = false;
          continue;
        }

        if (!drawing) {
          d += ` M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
          drawing = true;
        } else {
          d += ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
        }
      } else {
        drawing = false;
      }
    }

    if (!d) return null;

    return (
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.4"
        strokeDasharray={isDashed ? '1,2' : undefined}
        opacity="0.35"
        filter="url(#crt-bloom)"
      />
    );
  };

  // Realistic dim blue-gray colors typical of modern Honeywell and Thales ND vector charts
  const coastlineColor = '#1e3f52';
  const borderColor = '#2d5b75';

  return (
    <g data-testid="nd-coastline-overlay" pointerEvents="none">
      {/* Coastlines */}
      {renderPath(GREAT_BRITAIN_COAST, false, coastlineColor)}
      {renderPath(CONTINENTAL_COAST, false, coastlineColor)}

      {/* Country Borders */}
      {renderPath(BELGIUM_NETHERLANDS_BORDER, true, borderColor)}
      {renderPath(FRANCE_BELGIUM_BORDER, true, borderColor)}
    </g>
  );
}
