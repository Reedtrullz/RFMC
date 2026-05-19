interface ScrewHeadProps {
  className?: string;
}

export function ScrewHead({ className }: ScrewHeadProps) {
  return (
    <div
      className={`h-3 w-3 rounded-full bg-[#1a1c1c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center ${className}`}
    >
      {/* Screw slot */}
      <div className="h-0.5 w-2 bg-black/40 rotate-45" />
    </div>
  );
}
