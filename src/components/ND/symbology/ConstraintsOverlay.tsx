import React from 'react';
import { NavigationDisplayModel } from '@shared';

interface ConstraintsOverlayProps {
  model: NavigationDisplayModel;
}

export function ConstraintsOverlay({ model }: ConstraintsOverlayProps) {
  if (!model.overlays.cstr) return null;

  const points = [...model.activeRoutePoints, ...model.pendingRoutePoints];

  return (
    <g data-testid="constraints-overlay">
      {points.map((point) => {
        if (!point.visible || (!point.altitudeLabel && !point.speedLabel)) return null;

        return (
          <g key={`cstr-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {/* Constraint Magenta Circle */}
            <circle r="1.5" stroke="#ff00ff" fill="none" strokeWidth="0.5" />

            {/* Labels */}
            <g transform="translate(2 -2)" fontSize="2.5" fill="#ff00ff" fontWeight="bold">
              {point.altitudeLabel && <text y="0">{point.altitudeLabel}</text>}
              {point.speedLabel && <text y="3">{point.speedLabel}</text>}
            </g>
          </g>
        );
      })}
    </g>
  );
}
