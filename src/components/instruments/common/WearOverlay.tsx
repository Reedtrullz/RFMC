interface WearOverlayProps {
  className?: string;
}

export function WearOverlay({ className = '' }: WearOverlayProps) {
  return <div className={`machine-wear-overlay ${className}`} aria-hidden="true" />;
}
