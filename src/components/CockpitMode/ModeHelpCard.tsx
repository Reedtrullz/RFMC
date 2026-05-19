import { buildTrainingProgress, type CockpitLayoutMode } from '@shared';
import { getTrainingModeConfig } from '../../config/trainingModes';
import { useAutopilotStore } from '../../store/autopilotStore';
import { useFMCStore } from '../../store/useFMCStore';
import { panelLabels } from '../workspace/panelTypes';

interface ModeHelpCardProps {
  mode: CockpitLayoutMode;
  onResetLayout: () => void;
}

export function ModeHelpCard({ mode, onResetLayout }: ModeHelpCardProps) {
  const config = getTrainingModeConfig(mode);

  const currentPage = useFMCStore((s) => s.currentPage);
  const aircraft = useFMCStore((s) => s.aircraft);
  const flightPhase = useFMCStore((s) => s.flightPhase);
  const tutorialActive = useFMCStore((s) => s.tutorialActive);

  void currentPage;
  void flightPhase;
  void tutorialActive;

  const autopilotState = useAutopilotStore((state) => ({
    boeing: state.boeing,
    airbus: state.airbus,
    truth: state.truth,
  }));
  const progress = buildTrainingProgress({
    aircraft: aircraft,
    layoutMode: mode,
    fmcState: useFMCStore.getState(),
    autopilotState,
  });

  return (
    <aside className="mode-help-card" aria-label={`${config.label} guidance`}>
      <div>
        <div className="mode-help-card__eyebrow">Training mode</div>
        <h2>{config.label}</h2>
        <p>{config.purpose}</p>
      </div>
      <div className="mode-help-card__list">
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
          <strong>{config.minimumRequiredPanels.map((panelId) => panelLabels[panelId]).join(' + ')}</strong>
        </div>
      </div>
      <div className="mode-help-card__progress" aria-label="Current training progress">
        <span>Next</span>
        <strong>{progress.nextAction}</strong>
        <p>{progress.hint}</p>
        {progress.warning ? <em>{progress.warning}</em> : null}
      </div>
      <div className="mode-help-card__stats">
        <div>
          <span>Page</span>
          <strong>{progress.expectedPage ?? '--'}</strong>
        </div>
        <div>
          <span>Key</span>
          <strong>{progress.expectedKey ?? '--'}</strong>
        </div>
        <div>
          <span>Panel</span>
          <strong>{progress.expectedPanel ? panelLabels[progress.expectedPanel] : '--'}</strong>
        </div>
      </div>
      <button type="button" onClick={onResetLayout}>
        Restore recommended panels
      </button>
    </aside>
  );
}
