import type { PanelId } from './panelTypes';
import { panelLabels } from './panelTypes';

interface PanelTrayProps {
  hiddenPanels: PanelId[];
  onShow: (panelId: PanelId) => void;
}

export function PanelTray({ hiddenPanels, onShow }: PanelTrayProps) {
  if (hiddenPanels.length === 0) return null;

  return (
    <div className="panel-tray" aria-label="Hidden panels">
      {hiddenPanels.map((panelId) => (
        <button key={panelId} type="button" onClick={() => onShow(panelId)}>
          Show {panelLabels[panelId]}
        </button>
      ))}
    </div>
  );
}
