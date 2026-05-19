interface BezelScrewProps {
  className?: string;
  rotation?: number;
  style?: React.CSSProperties;
}

export function BezelScrew({ className = '', rotation = 0, style = {} }: BezelScrewProps) {
  return (
    <div
      className={`bezel-screw ${className}`}
      style={{ ...style, transform: style.transform || `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <div className="bezel-screw__slot" />
    </div>
  );
}
