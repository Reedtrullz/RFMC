interface BezelScrewProps {
  className?: string;
  rotation?: number;
}

export function BezelScrew({ className = '', rotation = 0 }: BezelScrewProps) {
  return (
    <div 
      className={`bezel-screw ${className}`} 
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <div className="bezel-screw__slot" />
    </div>
  );
}
