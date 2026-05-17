type PwaUpdatePromptProps = {
  offlineReady: boolean;
  needRefresh: boolean;
  onClose: () => void;
  onReload: () => void;
};

export function PwaUpdatePrompt({
  offlineReady,
  needRefresh,
  onClose,
  onReload,
}: PwaUpdatePromptProps) {
  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 rounded-sm border border-cdu-cyan/30 bg-black/90 p-4 font-cdu text-xs text-cdu-text shadow-lg backdrop-blur-sm"
      role="status"
      aria-live="polite"
      data-testid="pwa-update-prompt"
    >
      <p className="text-cdu-cyan">
        {offlineReady ? 'App ready to work offline.' : 'New update available. Click to reload.'}
      </p>
      <div className="flex justify-end gap-2">
        {needRefresh && (
          <button
            type="button"
            className="rounded-sm bg-cdu-cyan px-3 py-1 font-semibold text-black"
            onClick={onReload}
          >
            RELOAD
          </button>
        )}
        <button
          type="button"
          className="rounded-sm border border-cdu-text/50 px-3 py-1"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
