import type { ReactNode } from 'react';

interface PanelLabelProps {
  children: ReactNode;
  tone?: 'white' | 'amber' | 'green';
  className?: string;
}

export function PanelLabel({ children, tone = 'white', className = '' }: PanelLabelProps) {
  return <span className={`panel-label panel-label--${tone} ${className}`}>{children}</span>;
}
