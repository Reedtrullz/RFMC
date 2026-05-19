import React from 'react';

interface PfdAlertsProps {
  text?: string;
  level?: 'WARNING' | 'CAUTION';
}

export function PfdAlerts({ text, level }: PfdAlertsProps) {
  if (!text) return null;

  const isWindshear = text.toUpperCase() === 'WINDSHEAR';

  // High-fidelity avionics styling: thick black border around colored box
  const color = level === 'WARNING' || isWindshear ? '#ff0000' : '#ffcc00';
  const textColor = isWindshear ? '#ffffff' : color;
  const bgColor = isWindshear ? '#ff0000' : 'rgba(0, 0, 0, 0.85)';

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{
        border: `3px solid #000`, // Black outer border for contrast
        outline: `2px solid ${color}`, // Inner colored border
        backgroundColor: bgColor,
        padding: '6px 20px',
        borderRadius: '2px',
        boxShadow: '0 0 15px rgba(0,0,0,0.8)',
        animation: 'pfd-alert-blink 0.4s infinite alternate ease-in-out',
      }}
    >
      <span
        style={{
          color: textColor,
          fontSize: '22px',
          fontWeight: 900,
          fontFamily: 'var(--font-avionics)',
          letterSpacing: '1px',
        }}
      >
        {text.toUpperCase()}
      </span>

      <style>{`
        @keyframes pfd-alert-blink {
          from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          to { transform: translate(-50%, -50%) scale(1.05); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
