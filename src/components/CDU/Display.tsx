import { useFMCStore } from '../../store/useFMCStore';
import { displayDataToGrid } from '@shared';
import { CDUDisplayGrid } from './display/CDUDisplayGrid';
import { useAircraftStore } from '../../store/aircraftStore';

interface DisplayProps {
  variant?: 'boeing' | 'airbus';
}

export function Display({ variant = 'boeing' }: DisplayProps) {
  const displayData = useFMCStore(s => s.getDisplayData());
  const aircraft = useAircraftStore(s => s.aircraft);
  const isAirbus = variant === 'airbus' || aircraft === 'AIRBUS_A320';
  const grid = displayDataToGrid(displayData);

  return (
    <CDUDisplayGrid grid={grid} variant={isAirbus ? 'airbus' : 'boeing'} testId="main-cdu-display" />
  );
}
