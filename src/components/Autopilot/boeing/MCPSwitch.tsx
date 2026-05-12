import { MCPAnnunciator } from './MCPAnnunciator';

interface MCPSwitchProps {
  label: string;
  active: boolean;
  onPress: () => void;
  showAnnunciator?: boolean;
  small?: boolean;
}

export function MCPSwitch({ label, active, onPress, showAnnunciator = true, small = false }: MCPSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onPress}
        className={`relative flex items-center justify-center rounded-sm border-b-4 border-[#1a1a1a] bg-[#3a3d3d] text-center font-bold text-white shadow-lg transition-all hover:bg-[#4a4d4d] active:translate-y-1 active:border-b-0 ${
          small ? 'h-10 w-16 text-[10px]' : 'h-12 w-20 text-[11px]'
        }`}
      >
        <span className="uppercase tracking-tighter leading-tight px-1">{label}</span>
        
        {/* Button texture */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      </button>
      
      {showAnnunciator && <MCPAnnunciator active={active} />}
    </div>
  );
}
