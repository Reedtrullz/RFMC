import { AvionicsKey } from '../../instruments/common/AvionicsKey';

interface FunctionKey {
  label: string;
  key: string;
  highlight: string;
  ariaLabel: string;
}

const row1: FunctionKey[] = [
  { label: 'INIT REF', key: 'INIT_REF', highlight: 'POS_INIT', ariaLabel: 'Init Ref page' },
  { label: 'RTE', key: 'RTE', highlight: 'RTE', ariaLabel: 'Route page' },
  { label: 'CLB', key: 'CLB', highlight: 'CLB', ariaLabel: 'Climb page' },
  { label: 'CRZ', key: 'CRZ', highlight: 'CRZ', ariaLabel: 'Cruise page' },
  { label: 'DES', key: 'DES', highlight: 'DES', ariaLabel: 'Descent page' },
  { label: 'DIR INTC', key: 'DIR_INTC', highlight: 'DIR_INTC', ariaLabel: 'Direct Intercept page' },
  { label: 'LEGS', key: 'LEGS', highlight: 'LEGS', ariaLabel: 'Legs page' },
];

const row2: FunctionKey[] = [
  { label: 'DEP ARR', key: 'DEP_ARR', highlight: 'DEP_ARR', ariaLabel: 'Departure Arrivals page' },
  { label: 'HOLD', key: 'HOLD', highlight: 'HOLD', ariaLabel: 'Hold page' },
  { label: 'PERF', key: 'PERF', highlight: 'PERF_INIT', ariaLabel: 'Performance page' },
  { label: 'PROG', key: 'PROG', highlight: 'PROGRESS', ariaLabel: 'Progress page' },
  { label: 'N1 LIMIT', key: 'N1_LIMIT', highlight: 'N1_LIMIT', ariaLabel: 'N1 Limit page' },
  { label: 'FIX', key: 'FIX', highlight: 'FIX', ariaLabel: 'Fix page' },
  { label: 'MENU', key: 'MENU', highlight: 'MENU', ariaLabel: 'Menu page' },
];

interface BoeingFunctionKeyPanelProps {
  onPress: (key: string) => void;
  isHighlighted: (id: string) => boolean;
  hintLevel?: number;
}

export function BoeingFunctionKeyPanel({ onPress, isHighlighted, hintLevel }: BoeingFunctionKeyPanelProps) {
  return (
    <div className="mt-2 w-full rounded-[5px] border border-black/50 bg-black/20 p-1.5">
      {[row1, row2].map((row, rowIndex) => (
        <div key={rowIndex} className={`grid grid-cols-7 gap-1 ${rowIndex > 0 ? 'mt-1' : ''}`}>
          {row.map((item) => (
            <AvionicsKey
              key={item.key}
              label={item.label}
              ariaLabel={item.ariaLabel}
              variant="function"
              active={isHighlighted(item.highlight)}
              hintLevel={isHighlighted(item.highlight) ? hintLevel : 0}
              onPress={() => onPress(item.key)}
              className="h-9 w-full"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
