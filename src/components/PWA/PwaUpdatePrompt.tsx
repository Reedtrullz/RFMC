type PwaUpdatePromptProps = {
  offlineReady: boolean;
  needRefresh: boolean;
  onClose: () => void;
  onReload: () => void;
};

export function PwaUpdatePrompt({ offlineReady, needRefresh, onClose, onReload }: PwaUpdatePromptProps) {
  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex max-w-sm w-full flex-col gap-3 rounded-lg border border-cdu-cyan/40 bg-cdu-bezel/95 p-4 font-cdu text-xs text-cdu-text shadow-[0_8px_30px_rgb(0,0,0,0.8)] backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="status"
      aria-live="polite"
      data-testid="pwa-update-prompt"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cdu-cyan/10 border border-cdu-cyan/30 text-cdu-cyan">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-[10px] uppercase tracking-wider text-cdu-cyan/60">System Notification</p>
          <p className="text-cdu-text text-sm leading-relaxed font-black">
            {offlineReady
              ? 'App successfully configured for offline flight operations.'
              : 'New database update is available for VirtualCDU.'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
        <button
          type="button"
          className="rounded-full border border-cdu-text/30 hover:border-cdu-text/60 px-4 py-1.5 font-bold uppercase transition-all tracking-wider text-[10px] hover:bg-white/5"
          onClick={onClose}
        >
          Dismiss
        </button>
        {needRefresh && (
          <button
            type="button"
            className="rounded-full bg-cdu-cyan text-black px-5 py-1.5 font-black uppercase shadow-[0_0_12px_rgba(57,255,239,0.3)] hover:shadow-[0_0_16px_rgba(57,255,239,0.5)] transition-all tracking-wider text-[10px]"
            onClick={onReload}
          >
            Update Now
          </button>
        )}
      </div>
    </div>
  );
}
