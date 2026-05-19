import React from 'react';
import { useOrientation } from '../../hooks/useOrientation';

export function OrientationPrompt() {
  const orientation = useOrientation();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (orientation === 'landscape') setDismissed(false);
  }, [orientation]);

  if (orientation === 'landscape' || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orientation-prompt-title"
      data-testid="orientation-prompt"
    >
      <div className="w-20 h-20 mb-6 border-4 border-cdu-cyan rounded-2xl flex items-center justify-center animate-bounce">
        <svg className="w-12 h-12 text-cdu-cyan rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 id="orientation-prompt-title" className="text-2xl font-cdu text-cdu-text uppercase mb-2">
        Landscape Recommended
      </h2>
      <p className="text-cdu-text/60 font-cdu text-sm max-w-xs leading-relaxed">
        For the best cockpit experience and accurate instrument layout, please rotate your device.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="mt-8 px-6 py-2 border border-cdu-cyan/30 text-cdu-cyan rounded-full font-cdu text-xs uppercase hover:bg-cdu-cyan/10 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
