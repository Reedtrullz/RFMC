interface MSGLightProps {
  active?: boolean;
}

export function MSGLight({ active }: MSGLightProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`
          w-2 h-2 rounded-full
          ${active === undefined || active
            ? 'bg-cdu-amber animate-blink'
            : 'bg-cdu-amber/30'
          }
        `}
        style={{ boxShadow: '0 0 4px rgba(255,176,0,0.6)' }}
      />
      <span className="text-[9px] font-cdu text-cdu-amber/60 uppercase tracking-wider">MSG</span>
    </div>
  );
}
