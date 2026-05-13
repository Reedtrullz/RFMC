import React from 'react';

interface PfdAlertsProps {
  text?: string;
  level?: 'WARNING' | 'CAUTION';
}

export function PfdAlerts({ text, level }: PfdAlertsProps) {
  if (!text) return null;

  const color = level === 'WARNING' ? '#ff0000' : '#ffcc00';
  const bgColor = level === 'WARNING' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 204, 0, 0.2)';

  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{
        border: `2px solid ${color}`,
        backgroundColor: bgColor,
        padding: '8px 16px',
        borderRadius: '4px',
        animation: 'blink 0.5s infinite alternate'
      }}
    >
      <span style={{ color, fontSize: '18px', fontWeight: 'bold' }}>
        {text}
      </span>
      
      <style>{`
        @keyframes blink {
          from { opacity: 1; }
          to { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
