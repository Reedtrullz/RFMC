import type { CockpitLayoutMode } from '@shared';
import { getTrainingModeConfig } from '../../config/trainingModes';
import { panelLabels } from '../workspace/panelTypes';

interface ModeHelpCardProps {
  mode: CockpitLayoutMode;
  onResetLayout: () => void;
}

export function ModeHelpCard({ mode, onResetLayout }: ModeHelpCardProps) {
  const config = getTrainingModeConfig(mode);

  return (
    <aside className="mode-help-card" aria-label={`${config.label} guidance`}>
      <div>
        <div className="mode-help-card__eyebrow">Training mode</div>
        <h2>{config.label}</h2>
        <p>{config.purpose}</p>
      </div>
      <div className="mode-help-card__grid">
        <div>
          <span>Practice</span>
          <strong>{config.practiceTask}</strong>
        </div>
        <div>
          <span>Look at</span>
          <strong>{config.lookAt}</strong>
        </div>
        <div>
          <span>Required</span>
          <strong>{config.minimumRequiredPanels.map(panelId => panelLabels[panelId]).join(' + ')}</strong>
        </div>
      </div>
      <button type="button" onClick={onResetLayout}>
        Restore recommended panels
      </button>
    </aside>
  );
}
