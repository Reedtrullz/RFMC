import { NavigationDisplayModel, projectGeoPointToND } from '@shared';
import europeBorders from './europe-borders.json';

interface CoastlineOverlayProps {
  model: NavigationDisplayModel;
}

interface GeoPoint {
  lat: number;
  lon: number;
}

export function CoastlineOverlay({ model }: CoastlineOverlayProps) {
  // Coastlines are base map elements, always visible as a subtle reference when IRS is in NAV (or GPS)
  if (model.irsState !== 'NAV' && model.navSource !== 'GPS') return null;

  const cy = model.centered ? 50 : 84;

  const context = {
    aircraftPosition: model.aircraftPosition,
    heading: model.heading,
    rangeNm: model.range,
    mode: model.mode,
    isCentered: model.centered,
    style: model.style,
  };

  // Pre-calculate spatial bounding box for rapid culling
  // 1 degree latitude = 60 nm
  // Add a 1.5x margin because the ND range is measured from the center to the top edge
  const maxLatDist = (model.range / 60) * 1.5;
  const maxLonDist = maxLatDist / Math.max(0.1, Math.cos((model.aircraftPosition.lat * Math.PI) / 180));

  const centerLat = model.aircraftPosition.lat;
  const centerLon = model.aircraftPosition.lon;

  const isPointInBounds = (lat: number, lon: number) => {
    return Math.abs(lat - centerLat) <= maxLatDist && Math.abs(lon - centerLon) <= maxLonDist;
  };

  const paths: string[] = [];

  for (let i = 0; i < europeBorders.length; i++) {
    const ring = europeBorders[i];

    // Quick bounding box check: Does this ring have ANY point in the bounding box?
    let visible = false;
    // We check every 5th point for the bounding box test to speed it up
    for (let j = 0; j < ring.length; j += 5) {
      if (isPointInBounds(ring[j][0], ring[j][1])) {
        visible = true;
        break;
      }
    }

    // Also check the very last point just in case
    if (!visible && isPointInBounds(ring[ring.length - 1][0], ring[ring.length - 1][1])) {
      visible = true;
    }

    if (!visible) continue;

    let d = '';
    let drawing = false;

    for (let j = 0; j < ring.length; j++) {
      const p = projectGeoPointToND({ lat: ring[j][0], lon: ring[j][1] }, context);

      if (p) {
        // Distance from compass center check
        const distFromCenter = Math.sqrt((p.x - 50) ** 2 + (p.y - cy) ** 2);

        // ND bounds is a radius of 50
        if (distFromCenter > 50) {
          drawing = false;
          continue;
        }

        if (!drawing) {
          d += ` M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          drawing = true;
        } else {
          d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        }
      } else {
        drawing = false;
      }
    }

    if (d) {
      paths.push(d);
    }
  }

  if (paths.length === 0) return null;

  // Realistic dim blue-gray colors typical of modern Honeywell and Thales ND vector charts
  const strokeColor = model.style === 'boeing' ? '#2d5b75' : '#457491';

  return (
    <g data-testid="nd-coastline-overlay" pointerEvents="none">
      <path
        d={paths.join(' ')}
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.5"
        opacity={model.style === 'boeing' ? '0.35' : '0.45'}
        filter="url(#crt-bloom)"
      />
    </g>
  );
}
