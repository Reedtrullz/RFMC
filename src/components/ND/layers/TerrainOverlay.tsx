import { NavigationDisplayModel, projectGeoPointToND } from '@shared';

interface TerrainOverlayProps {
  model: NavigationDisplayModel;
}

/**
 * Multi-octave pseudo-noise generator to create organic mountains, valleys, and ridges
 */
function getTerrainElevation(lat: number, lon: number): number {
  // Irrational frequencies to create high-fidelity natural terrain patterns
  const f1 = Math.sin(lat * 7.4 + 1.2) * Math.cos(lon * 6.8 - 0.4);
  const f2 = Math.cos(lat * 15.3 - 0.8) * Math.sin(lon * 13.9 + 0.3) * 0.5;
  const f3 = Math.sin(lat * 31.1 + 2.1) * Math.cos(lon * 27.4 - 1.1) * 0.25;

  // Normalize between 0 and 1
  const raw = (f1 + f2 + f3 + 1.75) / 3.5;

  // Accentuate peaks and valleys
  const elevationCoeff = Math.pow(raw, 2.2);

  // Elevation scale up to 13,500 feet
  return Math.round(elevationCoeff * 13500);
}

export function TerrainOverlay({ model }: TerrainOverlayProps) {
  // If terrain is not toggled on or nav source is unavailable, don't show terrain
  if (!model.overlays.terr || (model.irsState !== 'NAV' && model.navSource !== 'GPS')) return null;

  const isPlanMode = model.mode === 'PLAN' || model.mode === 'PLN';
  // Authentic avionics: Terrain overlay is inhibited in PLAN mode
  if (isPlanMode) return null;

  const aircraftLat = model.aircraftPosition.lat;
  const aircraftLon = model.aircraftPosition.lon;
  const currentAlt = model.aircraftAltitude;

  // Set up projection context
  const context = {
    aircraftPosition: model.aircraftPosition,
    heading: model.heading,
    rangeNm: model.range,
    mode: model.mode,
    isCentered: model.centered,
    style: model.style,
  };

  const cy = model.centered ? 50 : 84;

  // We generate a 22x22 grid of geographic coordinates within the displayed range
  const gridSteps = 22;
  const rangeNm = model.range;
  const stepNm = (rangeNm * 2.2) / gridSteps; // slightly larger than range for outer sweeps

  const latStep = stepNm / 60;
  const lonStep = stepNm / (60 * Math.cos((aircraftLat * Math.PI) / 180));

  const cells: React.ReactNode[] = [];

  for (let dy = -gridSteps / 2; dy <= gridSteps / 2; dy++) {
    for (let dx = -gridSteps / 2; dx <= gridSteps / 2; dx++) {
      const lat = aircraftLat + dy * latStep;
      const lon = aircraftLon + dx * lonStep;

      // Project geo-point to screen SVG coordinates [0, 100]
      const p = projectGeoPointToND({ lat, lon }, context);
      if (!p) continue;

      // Ensure points are strictly within the compass rose boundary (45 units radius)
      const distFromCenter = Math.sqrt((p.x - 50) ** 2 + (p.y - cy) ** 2);
      if (distFromCenter > 44.5) continue;

      // Generate local elevation
      const elevation = getTerrainElevation(lat, lon);

      // Sea level or extremely flat low plains: don't render cell (saves performance and looks clean)
      if (elevation < 600) continue;

      // Determine Honeywell-style EGPWS terrain threat coloring relative to aircraft altitude
      let fill = '#006600'; // Dim Green (Safe terrain)
      let opacity = 0.25;
      const heightDelta = elevation - currentAlt;

      if (heightDelta >= 2000) {
        // Red - Extreme threat (2000 ft or more above aircraft)
        fill = '#cc0000';
        opacity = 0.65;
      } else if (heightDelta >= 500 && heightDelta < 2000) {
        // High Amber/Red - High terrain near/above
        fill = '#e65c00';
        opacity = 0.55;
      } else if (heightDelta >= -1000 && heightDelta < 500) {
        // Amber - Warning (within 1000 ft below to 500 ft above)
        fill = '#e6b800';
        opacity = 0.45;
      } else if (heightDelta >= -2000 && heightDelta < -1000) {
        // Light Green - Caution (1000 ft to 2000 ft below)
        fill = '#00b300';
        opacity = 0.35;
      }

      // Render as a crisp Honeywell digital dotted pixel
      cells.push(
        <rect
          key={`terr-${dy}-${dx}`}
          x={p.x - 0.7}
          y={p.y - 0.7}
          width={1.3}
          height={1.3}
          fill={fill}
          opacity={opacity}
          rx={0.2}
          filter="url(#crt-bloom)"
        />,
      );
    }
  }

  return (
    <g data-testid="nd-terrain-overlay" pointerEvents="none">
      {cells}
    </g>
  );
}
