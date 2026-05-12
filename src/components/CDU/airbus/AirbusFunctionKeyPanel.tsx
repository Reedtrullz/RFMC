import { AvionicsKey } from '../../visual/AvionicsKey';

interface AirbusFunctionKeyPanelProps {
  onPress: (key: string) => void;
  isHighlighted: (id: string) => boolean;
}

const keys = [
  { label: 'DIR', key: 'DIR_INTC' },
  { label: 'PROG', key: 'PROG_A' },
  { label: 'PERF', key: 'PERF_TAKEOFF' },
  { label: 'INIT', key: 'INIT_A' },
  { label: 'DATA', key: 'DATA_INDEX' },
  { label: 'F-PLN', key: 'F_PLN' },
  { label: 'RAD NAV', key: 'RAD_NAV', small: true },
];

export function AirbusFunctionKeyPanel({ onPress, isHighlighted }: AirbusFunctionKeyPanelProps) {
  return (
    <div className="mt-1.5 flex w-full gap-1">
      {keys.map((item) => (
        <AvionicsKey
          key={item.key}
          label={item.label}
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
