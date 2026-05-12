import { useFMCStore } from '../../store/useFMCStore';

export function FMA() {
  const aircraft = useFMCStore(s => s.aircraft);
  const autopilot = useFMCStore(s => s.autopilot);
  
  if (aircraft === 'BOEING_737') {
    const mcp = autopilot.boeing;
    
    const atMode = mcp.autothrottleArm ? (mcp.speedMode ? 'MCP SPD' : mcp.n1 ? 'N1' : 'ARM') : '';
    const rollMode = mcp.lnav ? 'LNAV' : mcp.hdgSel ? 'HDG SEL' : mcp.vorLoc ? 'VOR/LOC' : '';
    const pitchMode = mcp.vnav ? (mcp.altHold ? 'VNAV PTH' : 'VNAV SPD') : mcp.altHold ? 'ALT HOLD' : mcp.vs ? 'V/S' : mcp.lvlChg ? 'MCP SPD' : '';
    const status = (mcp.apA || mcp.apB) ? 'CMD' : (mcp.fdLeft || mcp.fdRight) ? 'FD' : '';

    return (
      <div className="flex w-full max-w-[400px] justify-between border-2 border-[#2a2d2d] bg-black p-2 font-mono text-sm font-bold uppercase shadow-inner">
        <div className="flex flex-col items-center flex-1 border-r border-[#2a2d2d]">
           <span className="text-[8px] text-[#666]">A/T</span>
           <span className="text-[#00ff44]">{atMode}</span>
        </div>
        <div className="flex flex-col items-center flex-1 border-r border-[#2a2d2d]">
           <span className="text-[8px] text-[#666]">ROLL</span>
           <span className="text-[#00ff44]">{rollMode}</span>
        </div>
        <div className="flex flex-col items-center flex-1 border-r border-[#2a2d2d]">
           <span className="text-[8px] text-[#666]">PITCH</span>
           <span className="text-[#00ff44]">{pitchMode}</span>
        </div>
        <div className="flex flex-col items-center flex-1">
           <span className="text-[8px] text-[#666]">STATUS</span>
           <span className="text-[#00ff44]">{status}</span>
        </div>
      </div>
    );
  }

  return null; // Airbus FMA later
}
