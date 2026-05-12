import { NDHoldOverlay } from '@shared';

interface HoldOverlayProps {
  hold: NDHoldOverlay | null;
}

export function HoldOverlay({ hold }: HoldOverlayProps) {
  if (!hold || !hold.visible) return null;

  // Simplistic race-track visualization for the ND
  // Real holds are complex arcs, but for now we draw a dashed box/pill
  const { x, y } = hold;

  return (
    <g data-testid="nd-hold-overlay" transform={`translate(${x} ${y})`} opacity="0.8">
      <rect
        x="-6" y="-3" width="12" height="6" rx="3"
        fill="none"
        stroke="#ff00ff"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <text y="10" textAnchor="middle" fill="#ff00ff" fontSize="2.4" fontWeight="bold">HOLD</text>
    </g>
  );
}
