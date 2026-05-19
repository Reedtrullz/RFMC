import type { PanelId } from './panelTypes';
import { panelLabels } from './panelTypes';
import { useAircraftStore } from '../../store/aircraftStore';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';

interface InstrumentHeaderProps {
  panelId: PanelId;
  pinned: boolean;
  zoom?: number;
  onFocus: (panelId: PanelId) => void;
  onHide: (panelId: PanelId) => void;
  onTogglePin: (panelId: PanelId) => void;
  onZoomIn?: (panelId: PanelId) => void;
  onZoomOut?: (panelId: PanelId) => void;
  onZoomReset?: (panelId: PanelId) => void;
}

export function InstrumentHeader({
  panelId,
  pinned,
  zoom,
  onFocus,
  onHide,
  onTogglePin,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: InstrumentHeaderProps) {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const layoutMode = useCockpitLayoutStore((s) => s.cockpitLayoutMode);
  const togglePanelPinned = useCockpitLayoutStore((s) => s.togglePanelPinned);
  const pinnedPanels = useCockpitLayoutStore((s) => s.pinnedPanels);
  let label = panelLabels[panelId];
  if (panelId === 'autoflight') {
    label = aircraft === 'AIRBUS_A320' ? 'FCU' : 'MCP';
  } else if (panelId === 'cdu') {
    label = aircraft === 'AIRBUS_A320' ? 'MCDU' : 'CDU';
  }
  const zoomLabel = typeof zoom === 'number' ? `${Math.round(zoom * 100)}%` : null;

  return (
    <div className="instrument-header">
      <span className="instrument-header__label">{label}</span>
      <div className="instrument-header__group" aria-label={`${label} zoom controls`}>
        {onZoomOut && (
          <button type="button" onClick={() => onZoomOut(panelId)} aria-label={`Zoom out ${label}`} title="Zoom out">
            -
          </button>
        )}
        {zoomLabel && (
          <button
            type="button"
            onClick={() => onZoomReset?.(panelId)}
            aria-label={`Reset ${label} zoom`}
            title="Reset zoom"
          >
            {zoomLabel}
          </button>
        )}
        {onZoomIn && (
          <button type="button" onClick={() => onZoomIn(panelId)} aria-label={`Zoom in ${label}`} title="Zoom in">
            +
          </button>
        )}
      </div>
      <button type="button" onClick={() => onFocus(panelId)} aria-label={`Focus ${label}`} title={`Focus ${label}`}>
        Focus
      </button>
      <button type="button" onClick={() => onHide(panelId)} aria-label={`Hide ${label}`} title={`Hide ${label}`}>
        Hide
      </button>
      <button
        type="button"
        onClick={() => onTogglePin(panelId)}
        aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
        aria-pressed={pinned}
        title={pinned ? `Unpin ${label}` : `Pin ${label}`}
      >
        {pinned ? 'Pinned' : 'Pin'}
      </button>
    </div>
  );
}
