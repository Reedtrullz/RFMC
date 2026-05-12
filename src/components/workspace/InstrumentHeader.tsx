import type { PanelId } from './panelTypes';
import { panelLabels } from './panelTypes';

interface InstrumentHeaderProps {
  panelId: PanelId;
  pinned: boolean;
  onFocus: (panelId: PanelId) => void;
  onHide: (panelId: PanelId) => void;
  onTogglePin: (panelId: PanelId) => void;
}

export function InstrumentHeader({
  panelId,
  pinned,
  onFocus,
  onHide,
  onTogglePin,
}: InstrumentHeaderProps) {
  const label = panelLabels[panelId];

  return (
    <div className="instrument-header">
      <span className="instrument-header__label">{label}</span>
      <button type="button" onClick={() => onFocus(panelId)} aria-label={`Focus ${label}`}>
        Focus
      </button>
      <button type="button" onClick={() => onHide(panelId)} aria-label={`Hide ${label}`}>
        Hide
      </button>
      <button
        type="button"
        onClick={() => onTogglePin(panelId)}
        aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
        aria-pressed={pinned}
      >
        {pinned ? 'Pinned' : 'Pin'}
      </button>
    </div>
  );
}
