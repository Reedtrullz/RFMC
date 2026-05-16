import { AvionicsKey } from '../../instruments/common/AvionicsKey';

interface FunctionKey {
  label: string;
  key: string;
  ariaLabel: string;
  small?: boolean;
}

interface AirbusFunctionKeyPanelProps {
  onPress: (key: string) => void;
  isHighlighted: (id: string) => boolean;
}

const keys: FunctionKey[] = [
  { label: 'DIR', key: 'DIR_INTC', ariaLabel: 'Direct Intercept page' },
  { label: 'PROG', key: 'PROG_A', ariaLabel: 'Progress page' },
  { label: 'PERF', key: 'PERF_TAKEOFF', ariaLabel: 'Performance page' },
  { label: 'INIT', key: 'INIT_A', ariaLabel: 'Init page' },
  { label: 'DATA', key: 'DATA_INDEX', ariaLabel: 'Data Index page' },
  { label: 'F-PLN', key: 'F_PLN', ariaLabel: 'Flight Plan page' },
  { label: 'RAD NAV', key: 'RAD_NAV', ariaLabel: 'Radio Navigation page', small: true },
];

export function AirbusFunctionKeyPanel({ onPress, isHighlighted }: AirbusFunctionKeyPanelProps) {
  return (
    <div className="mt-1.5 flex w-full gap-1">
      {keys.map((item) => (
        <AvionicsKey
          key={item.key}
          label={item.label}
          ariaLabel={item.ariaLabel}
          variant="airbus"
          shape="function"
          tone="white"
          highlighted={isHighlighted(item.key)}
          onPress={() => onPress(item.key)}
          className={`flex-1 h-9 ${item.small ? 'text-[8px]' : 'text-[10px]'}`}
        />
      ))}
    </div>
  );
}
