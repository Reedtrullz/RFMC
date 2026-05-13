import { useFMCStore } from '../../store/useFMCStore';
import { ScratchpadRow } from './display/ScratchpadRow';

interface ScratchpadProps {
  variant?: 'boeing' | 'airbus';
}

export function Scratchpad({ variant = 'boeing' }: ScratchpadProps) {
  const scratchpad = useFMCStore(s => s.scratchpad);
  const scratchpadError = useFMCStore(s => s.scratchpadError);
  const alerts = useFMCStore(s => s.alerts);

  // Find highest priority alert to show in scratchpad
  const activeAlert = alerts.find(a => a.level === 'WARNING') || 
                      alerts.find(a => a.level === 'CAUTION') ||
                      alerts.find(a => a.level === 'ADVISORY');

  const displayText = scratchpadError || scratchpad || activeAlert?.text || ' ';
  const level = scratchpadError ? 'WARNING' : activeAlert?.level;

  return <ScratchpadRow text={displayText} level={level} variant={variant} />;
}
