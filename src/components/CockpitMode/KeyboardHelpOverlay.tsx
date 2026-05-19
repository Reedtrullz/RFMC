import React from 'react';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';

export const KeyboardHelpOverlay: React.FC = () => {
  const show = useCockpitLayoutStore((s) => s.showKeyboardHelp);
  const toggle = useCockpitLayoutStore((s) => s.toggleKeyboardHelp);

  React.useEffect(() => {
    if (!show) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, toggle]);

  if (!show) return null;

  const shortcuts = [
    { key: '?', action: 'Toggle this help' },
    { key: 'A–Z, 0–9', action: 'CDU/MCDU Keypad' },
    { key: 'F1–F6', action: 'Left LSK 1–6' },
    { key: 'F7–F12', action: 'Right LSK 1–6' },
    { key: 'Shift + F1–F6', action: 'Alternate right LSK 1–6' },
    { key: 'Enter', action: 'EXEC key' },
    { key: 'Backspace', action: 'CLR key' },
    { key: 'Delete', action: 'DEL key' },
    { key: 'PageUp / ↑', action: 'PREV PAGE' },
    { key: 'PageDown / ↓', action: 'NEXT PAGE' },
    { key: '.', action: 'DOT' },
    { key: '/', action: 'SLASH' },
    { key: '+ or -', action: 'PLUS/MINUS' },
    { key: 'Space', action: 'SPACE' },
  ];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={toggle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-[#1a1c1c] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-4">
          <h3 id="keyboard-help-title" className="font-cdu text-sm font-bold uppercase tracking-widest text-cdu-cyan">
            Keyboard Shortcuts
          </h3>
          <button onClick={toggle} className="text-white/40 hover:text-white transition-colors">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-y-3">
            {shortcuts.map((s, idx) => (
              <React.Fragment key={`shortcut-${idx}`}>
                <div className="flex items-center">
                  <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/80">
                    {s.key}
                  </span>
                </div>
                <div className="flex items-center font-cdu text-[11px] uppercase tracking-tight text-white/60">
                  {s.action}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 bg-black/10 px-6 py-4 text-center">
          <p className="font-cdu text-[9px] uppercase tracking-tighter text-white/30">
            Physical keyboard input is routed to the active CDU/MCDU
          </p>
        </div>
      </div>
    </div>
  );
};
