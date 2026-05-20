import { useState, useEffect, useRef } from 'react';
import { useAircraftStore } from '../../store/aircraftStore';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { useAutopilotStore } from '../../store/autopilotStore';
import { useFMCStore } from '../../store/useFMCStore';
import { getCockpitChecklists, type CockpitChecklistItem } from '../../checklists';
import { useDraggable } from '../../hooks/useDraggable';
import { useSound } from '../../hooks/useSound';

interface AudioVisualizerProps {
  muted: boolean;
  volume: number;
}

function AudioVisualizer({ muted, volume }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Draw background CRT style diagnostic grid line
      ctx.strokeStyle = 'rgba(42, 45, 45, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Horizontal minor ticks
      ctx.beginPath();
      for (let x = 15; x < width; x += 15) {
        ctx.moveTo(x, height / 2 - 2);
        ctx.lineTo(x, height / 2 + 2);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 1.5;

      if (muted) {
        // Muted amber subtle heartbeat flatline
        ctx.strokeStyle = '#ff9f0a';
        ctx.shadowColor = '#ff9f0a';
        ctx.shadowBlur = 4;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.08 + phase) * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Glowing cyan/green dynamic multi-harmonic scrolling wave
        const maxAmp = height / 2.8;
        const amp = (volume / 100) * maxAmp;
        ctx.strokeStyle = '#39ff14';
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 6;

        for (let x = 0; x < width; x++) {
          const wave1 = Math.sin(x * 0.06 - phase * 1.6) * 1.0;
          const wave2 = Math.sin(x * 0.14 + phase * 2.8) * 0.35;
          const wave3 = Math.sin(x * 0.03 - phase * 0.9) * 0.15;
          // Smooth fade envelope at the edges
          const envelope = Math.sin((x / width) * Math.PI);
          const y = height / 2 + (wave1 + wave2 + wave3) * amp * envelope;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      phase += 0.04;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [muted, volume]);

  return (
    <div className="relative w-full h-9 bg-black/80 rounded border border-[#2a2d2d] overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <span className="absolute top-1 left-2 text-[6px] font-mono text-white/30 uppercase tracking-widest select-none">
        Acoustic Monitor
      </span>
      <span className="absolute top-1 right-2 text-[6px] font-mono text-cdu-exec uppercase tracking-widest select-none flex items-center gap-1">
        <span className={`w-1 h-1 rounded-full ${muted ? 'bg-[#ff9f0a]' : 'bg-[#39ff14] animate-pulse'}`} />
        {muted ? 'SUSPENDED' : 'ACTIVE'}
      </span>
    </div>
  );
}

export function SettingsPanel() {
  const isHidden = useCockpitLayoutStore((s) => s.hiddenPanels.includes('settings'));
  const cockpitMode = useCockpitLayoutStore((s) => s.cockpitMode);
  const brightness = useCockpitLayoutStore((s) => s.brightness);
  const setBrightness = useCockpitLayoutStore((s) => s.setBrightness);

  const soundMuted = useCockpitLayoutStore((s) => s.soundMuted);
  const soundVolume = useCockpitLayoutStore((s) => s.soundVolume);
  const setSoundMuted = useCockpitLayoutStore((s) => s.setSoundMuted);
  const setSoundVolume = useCockpitLayoutStore((s) => s.setSoundVolume);

  const signsOn = useAircraftStore((s) => s.signsOn);
  const windowsLocked = useAircraftStore((s) => s.windowsLocked);
  const toggleSigns = useAircraftStore((s) => s.toggleSigns);
  const toggleWindows = useAircraftStore((s) => s.toggleWindows);

  const { position, dragHandlers, isDragging } = useDraggable();
  const { play } = useSound();

  if (cockpitMode && isHidden) return null;

  const handleToggleSigns = () => {
    toggleSigns();
    play('chime');
  };

  return (
    <div
      className={`fixed top-24 right-6 w-64 bg-[#121414] rounded border-2 border-[#2a2d2d] p-0 shadow-2xl z-30 pointer-events-auto animate-in fade-in zoom-in duration-200 ${isDragging ? 'scale-[1.01] border-cdu-cyan/40' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out, scale 0.2s ease-out',
      }}
    >
      <div
        className="cursor-grab active:cursor-grabbing bg-[#1a1c1c] border-b-2 border-[#2a2d2d] px-3 py-2 flex items-center justify-between"
        {...dragHandlers}
      >
        <h3 className="text-[10px] font-cdu text-cdu-cyan uppercase tracking-widest font-bold select-none flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cdu-cyan animate-pulse" />
          System Maintenance
        </h3>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="p-4 space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] font-cdu text-white/40 uppercase tracking-tighter">Panel Intensity</label>
            <span className="text-[10px] font-mono text-cdu-cyan">{brightness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full h-1.5 bg-black/60 rounded-full appearance-none accent-cdu-cyan cursor-pointer"
          />
        </div>

        <div className="pt-2 border-t border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-cdu text-white/40 uppercase tracking-tighter">Acoustic Console</label>
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className={`px-2 py-0.5 border text-[8px] font-cdu uppercase tracking-tighter transition-all rounded ${soundMuted ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.2)]' : 'border-cdu-cyan/30 bg-cdu-cyan/10 text-cdu-cyan shadow-[0_0_6px_rgba(0,255,255,0.2)]'}`}
            >
              {soundMuted ? 'Muted' : 'Audible'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/35 w-6 uppercase text-right select-none">VOL</span>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseInt(e.target.value))}
              disabled={soundMuted}
              className="flex-1 h-1.5 bg-black/60 rounded-full appearance-none accent-[#39ff14] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <span className="text-[9px] font-mono text-[#39ff14] w-8 text-right select-none transition-colors disabled:text-white/20">
              {soundMuted ? '---' : `${soundVolume}%`}
            </span>
          </div>

          <AudioVisualizer muted={soundMuted} volume={soundVolume} />
        </div>

        <div className="pt-2 border-t border-white/5">
          <label className="text-[9px] font-cdu text-white/40 uppercase tracking-tighter mb-3 block">
            Environmental Override
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleToggleSigns}
              className={`py-2 px-1 border-2 text-[8px] font-cdu uppercase transition-all flex flex-col items-center gap-1 ${signsOn ? 'bg-cdu-exec/10 border-cdu-exec text-cdu-exec shadow-[0_0_8px_rgba(57,255,20,0.2)]' : 'bg-black/40 border-[#2a2d2d] text-white/20'}`}
            >
              Signs
              <span className="text-[10px] font-bold">{signsOn ? 'ARMED' : 'OFF'}</span>
            </button>
            <button
              onClick={toggleWindows}
              className={`py-2 px-1 border-2 text-[8px] font-cdu uppercase transition-all flex flex-col items-center gap-1 ${windowsLocked ? 'bg-cdu-cyan/10 border-cdu-cyan text-cdu-cyan shadow-[0_0_8px_rgba(0,255,255,0.2)]' : 'bg-black/40 border-[#2a2d2d] text-white/20'}`}
            >
              Windows
              <span className="text-[10px] font-bold">{windowsLocked ? 'SECURED' : 'OPEN'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 bg-black/20 -mx-4 px-4 py-3">
          <p className="text-[8px] font-cdu text-white/30 uppercase leading-tight tracking-tighter italic">
            Reference diagnostic port active. All manual overrides logged to flight data recorder.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChecklistPanel() {
  const isHidden = useCockpitLayoutStore((s) => s.hiddenPanels.includes('checklist'));
  const cockpitMode = useCockpitLayoutStore((s) => s.cockpitMode);

  const aircraft = useAircraftStore((s) => s.aircraft);
  const signsOn = useAircraftStore((s) => s.signsOn);
  const windowsLocked = useAircraftStore((s) => s.windowsLocked);

  const mcp = useAutopilotStore((s) => s.boeing);
  const highlightControl = useFMCStore((s) => s.highlightControl);

  const [sectionIndex, setSectionIndex] = useState(0);
  const { position, dragHandlers, isDragging } = useDraggable();

  if (cockpitMode && isHidden) return null;

  const checklists = getCockpitChecklists(aircraft);
  const section = checklists[sectionIndex % checklists.length] ?? checklists[0];

  const items = section.items.map((item) => {
    let completed = item.completed;
    if (item.id === 'passenger-signs') completed = signsOn;
    if (item.id === 'windows') completed = windowsLocked;
    if (item.relatedControl === 'LNAV') completed = mcp.lnav;
    if (item.relatedControl === 'VNAV') completed = mcp.vnav;
    if (item.relatedControl === 'AT_ARM') completed = mcp.autothrottleArm;

    return { ...item, completed };
  });

  const nextSection = () => setSectionIndex((index) => (index + 1) % checklists.length);

  return (
    <div
      className={`fixed top-24 left-6 w-80 bg-[#fdfdfd] rounded border-l-8 border-l-[#2c3e50] border-y border-r border-black/10 p-5 shadow-2xl z-30 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-300 ${isDragging ? 'scale-[1.01] shadow-black/20' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out, scale 0.2s ease-out',
      }}
    >
      <div
        className="cursor-grab active:cursor-grabbing flex items-center justify-between mb-5 pb-3 border-b-2 border-black/5 select-none"
        {...dragHandlers}
      >
        <div>
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none">{section.title}</h3>
          <p className="text-[8px] text-gray-400 uppercase mt-1 font-bold">Standard Operating Procedure</p>
        </div>
        <span className="text-[9px] font-black bg-[#2c3e50] text-white px-2 py-0.5 rounded-sm">{section.badge}</span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onHighlight={item.relatedControl ? () => highlightControl(item.relatedControl!) : undefined}
          />
        ))}
      </div>

      <div className="mt-8 pt-4 border-t-2 border-black/5 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-gray-400 uppercase">Sequence</span>
          <span className="text-[10px] font-black text-gray-900">
            {(sectionIndex % checklists.length) + 1} OF {checklists.length}
          </span>
        </div>
        <button
          type="button"
          className="text-[10px] font-black bg-cdu-cyan text-black px-4 py-1.5 rounded-sm uppercase hover:bg-cdu-cyan/80 transition-colors shadow-sm active:translate-y-0.5"
          onClick={nextSection}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

function ChecklistItem({ item, onHighlight }: { item: CockpitChecklistItem; onHighlight?: () => void }) {
  return (
    <button
      type="button"
      onClick={onHighlight}
      className={`flex w-full items-center justify-between group text-left ${item.completed ? 'opacity-30' : ''} ${onHighlight ? 'cursor-pointer' : 'cursor-default'}`}
      disabled={!onHighlight}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-sm border-2 ${item.completed ? 'bg-cdu-exec border-cdu-exec shadow-[0_0_4px_rgba(57,255,20,0.4)]' : 'border-gray-300'}`}
        />
        <span className="text-[10px] font-black text-gray-700 tracking-tighter">{item.label}</span>
      </div>
      <div className="flex-1 border-b border-gray-100 mx-2 mb-1" />
      <span
        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm ${item.completed ? 'bg-gray-100 text-gray-400' : 'bg-gray-800 text-white'}`}
      >
        {item.expected}
      </span>
    </button>
  );
}
