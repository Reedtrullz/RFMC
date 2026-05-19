import { NavigationDisplayModel, getRnpRadiusScreen } from '@shared';

interface RnpContainmentOverlayProps {
  model: NavigationDisplayModel;
}

export function RnpContainmentOverlay({ model }: RnpContainmentOverlayProps) {
  // Only show if in a high-precision mode or RNP is low (< 1.0)
  if (model.rnpNm > 1.0) return null;

  const cy = model.centered ? 50 : 84;
  const radius = getRnpRadiusScreen(model.rnpNm, model.range);
  const anpRadius = getRnpRadiusScreen(model.anpNm, model.range);

  return (
    <g data-testid="nd-rnp-containment">
      {/* RNP Boundary Circle (Dashed White) */}
      <circle
        cx="50"
        cy={cy}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="0.2"
        strokeDasharray="1 1"
        opacity="0.3"
      />

      {/* ANP Current Position Confidence (Solid White) */}
      <circle
        cx="50"
        cy={cy}
        r={anpRadius}
        fill="white"
        fillOpacity="0.05"
        stroke="white"
        strokeWidth="0.3"
        opacity="0.6"
      />

      {/* RNP Limit Markers on Track */}
      <g transform={`translate(50 ${cy})`}>
        <line x1={-radius} y1="-2" x2={-radius} y2="2" stroke="white" strokeWidth="0.5" />
        <line x1={radius} y1="-2" x2={radius} y2="2" stroke="white" strokeWidth="0.5" />
      </g>
    </g>
  );
}
