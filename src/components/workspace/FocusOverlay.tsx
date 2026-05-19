import type { ReactNode } from 'react';
import type { PanelId } from './panelTypes';
import { panelLabels } from './panelTypes';

interface FocusOverlayProps {
  panelId: PanelId;
  children: ReactNode;
  onClose: () => void;
}

export function FocusOverlay({ panelId, children, onClose }: FocusOverlayProps) {
  return (
    <div className="focus-overlay" role="dialog" aria-label={`${panelLabels[panelId]} focus mode`}>
      <div className="focus-overlay__bar">
        <span>{panelLabels[panelId]} Focus</span>
        <button type="button" onClick={onClose} autoFocus>
          Back
        </button>
      </div>
      <div className="focus-overlay__stage">{children}</div>
    </div>
  );
}
