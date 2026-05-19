import { useShallow } from 'zustand/react/shallow';
import { useFMCStore } from '../../store/useFMCStore';
import { displayDataToGrid, PAGE_LINES } from '@shared';
import { CDUDisplayGrid } from './display/CDUDisplayGrid';
import { useAircraftStore } from '../../store/aircraftStore';

interface DisplayProps {
  variant?: 'boeing' | 'airbus';
}

export function Display({ variant = 'boeing' }: DisplayProps) {
  const displayData = useFMCStore(useShallow((s) => s.getDisplayData()));
  const aircraft = useAircraftStore((s) => s.aircraft);
  const isAirbus = variant === 'airbus' || aircraft === 'AIRBUS_A320';
  const grid = displayDataToGrid(displayData);

  // Scratchpad is rendered separately by the Scratchpad component — exclude from grid to avoid duplicate text.
  const SCRATCHPAD_ROW = PAGE_LINES - 1;
  const contentGrid = {
    ...grid,
    rows: PAGE_LINES - 1,
    segments: grid.segments.filter((s) => s.row !== SCRATCHPAD_ROW),
  };

  return <CDUDisplayGrid grid={contentGrid} variant={isAirbus ? 'airbus' : 'boeing'} testId="main-cdu-display" />;
}
