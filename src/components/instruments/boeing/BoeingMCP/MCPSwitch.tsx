import { useCallback } from 'react';
import { MCPAnnunciator } from './MCPAnnunciator';
import { tactile } from '../../../../utils/tactile';

interface MCPSwitchProps {
  label: string;
  active: boolean;
  onPress: () => void;
  showAnnunciator?: boolean;
  small?: boolean;
  highlighted?: boolean;
}

export function MCPSwitch({
  label,
  active,
  onPress,
  showAnnunciator = true,
  small = false,
  highlighted,
}: MCPSwitchProps) {
  const handleClick = useCallback(() => {
    tactile.feedback();
    onPress();
  }, [onPress]);

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative group">
        {/* Outer Bezel (Deep Recess) */}
        <div className="absolute -inset-1 rounded-sm bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />

        <button
          onClick={handleClick}
          className={`relative flex items-center justify-center rounded-[1px] border-b-[3px] border-black/60 bg-[#2d3030] text-center font-cdu text-white shadow-xl transition-all hover:bg-[#3d4040] active:translate-y-[2px] active:border-b-0 ${
            small ? 'h-11 w-16 text-[9px]' : 'h-14 w-20 text-[10px]'
          } ${highlighted ? 'highlighted-boeing' : ''}`}
        >
          {/* Physical Texture */}
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-black/20 mix-blend-overlay" />

          {/* Inner Shadow / Lighting */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[1px] border border-white/5" />

          <span className="relative z-10 uppercase tracking-tight leading-tight px-1 drop-shadow-sm">{label}</span>
        </button>
      </div>

      {showAnnunciator && (
        <div className="relative px-2 py-0.5 rounded-sm bg-black/60 shadow-inner">
          <MCPAnnunciator active={active} />
        </div>
      )}
    </div>
  );
}
