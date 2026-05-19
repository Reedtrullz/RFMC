interface PushPullKnobProps {
  value: number;
  onRotate: (delta: number) => void;
  onPush: () => void;
  onPull: () => void;
  isManaged?: boolean;
}

export function PushPullKnob({ value, onRotate, onPush, onPull, isManaged }: PushPullKnobProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16">
        {/* The base knob */}
        <div
          className="absolute inset-2 cursor-ns-resize rounded-full bg-[#2a2a2a] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)]"
          onWheel={(e) => onRotate(e.deltaY < 0 ? 1 : -1)}
        >
          {/* Ridges */}
          <div className="absolute inset-1 rounded-full border-2 border-dotted border-white/5" />
        </div>

        {/* The push/pull cap */}
        <div
          className={`absolute inset-4 flex items-center justify-center rounded-full bg-[#3a3a3a] shadow-lg transition-transform duration-200 cursor-pointer ${isManaged ? 'translate-z-0' : 'translate-z-4 scale-110'}`}
          onClick={(e) => {
            // Simple logic: left click pull, right click push?
            // Or just toggle for now.
            if (isManaged) onPull();
            else onPush();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            onPush();
          }}
        >
          <div className="h-2 w-2 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onPush} className="text-[8px] text-white/40 hover:text-white">
          PUSH
        </button>
        <button onClick={onPull} className="text-[8px] text-white/40 hover:text-white">
          PULL
        </button>
      </div>
    </div>
  );
}
