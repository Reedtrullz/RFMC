import type { CockpitLayoutMode, PanelId } from '@shared';
import { getTrainingModeConfig } from '../../config/trainingModes';
import { panelLabels } from '../workspace/panelTypes';

interface CockpitEmptyStateProps {
  mode: CockpitLayoutMode;
  missingPanels: PanelId[];
  onRestore: () => void;
}

export function CockpitEmptyState({ mode, missingPanels, onRestore }: CockpitEmptyStateProps) {
  const config = getTrainingModeConfig(mode);
  const missing = missingPanels.map(panelId => panelLabels[panelId]).join(', ');

  return (
    <div className="cockpit-empty-state" role="status">
      <h2>{config.label} needs {missing || 'its required panels'}</h2>
      <p>Restore the recommended workspace to keep this training mode usable.</p>
      <button type="button" onClick={onRestore}>
        Restore {config.label}
      </button>
    </div>
  );
}
