import { useFMCStore } from '../../store/useFMCStore';
import { ScratchpadRow } from './display/ScratchpadRow';

interface ScratchpadProps {
  variant?: 'boeing' | 'airbus';
}

export function Scratchpad({ variant = 'boeing' }: ScratchpadProps) {
  const scratchpad = useFMCStore(s => s.scratchpad);
  const scratchpadError = useFMCStore(s => s.scratchpadError);
  const displayText = scratchpadError || scratchpad || ' ';

  return <ScratchpadRow text={displayText} error={!!scratchpadError} variant={variant} />;
}
