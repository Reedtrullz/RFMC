import { type AlertLevel } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { ScratchpadRow } from './display/ScratchpadRow';

interface ScratchpadProps {
  variant?: 'boeing' | 'airbus';
}

export function Scratchpad({ variant = 'boeing' }: ScratchpadProps) {
  const scratchpad = useFMCStore((s) => s.scratchpad);
  const scratchpadError = useFMCStore((s) => s.scratchpadError);
  const messages = useFMCStore((s) => s.scratchpadMessages);
  const activeMessage = messages[0];

  const displayText = scratchpadError || scratchpad || activeMessage?.text || ' ';

  let level: AlertLevel | undefined = undefined;
  if (scratchpadError) {
    level = 'WARNING';
  } else if (activeMessage) {
    level = activeMessage.severity as AlertLevel;
  }

  return <ScratchpadRow text={displayText} level={level} variant={variant} />;
}
