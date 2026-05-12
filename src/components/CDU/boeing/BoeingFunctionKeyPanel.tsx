import { AvionicsKey } from '../../visual/AvionicsKey';

interface FunctionKey {
  label: string;
  key: string;
  highlight: string;
}

const row1: FunctionKey[] = [
  { label: 'INIT REF', key: 'INIT_REF', highlight: 'POS_INIT' },
  { label: 'RTE', key: 'RTE', highlight: 'RTE' },
  { label: 'CLB', key: 'CLB', highlight: 'CLB' },
  { label: 'CRZ', key: 'CRZ', highlight: 'CRZ' },
  { label: 'DES', key: 'DES', highlight: 'DES' },
  { label: 'DIR INTC', key: 'DIR_INTC', highlight: 'DIR_INTC' },
  { label: 'LEGS', key: 'LEGS', highlight: 'LEGS' },
];

const row2: FunctionKey[] = [
  { label: 'DEP ARR', key: 'DEP_ARR', highlight: 'DEP_ARR' },
  { label: 'HOLD', key: 'HOLD', highlight: 'HOLD' },
  { label: 'PERF', key: 'PERF', highlight: 'PERF_INIT' },
  { label: 'PROG', key: 'PROG', highlight: 'PROGRESS' },
  { label: 'N1 LIMIT', key: 'N1_LIMIT', highlight: 'N1_LIMIT' },
  { label: 'FIX', key: 'FIX', highlight: 'FIX' },
  { label: 'MENU', key: 'MENU', highlight: 'MENU' },
];

interface BoeingFunctionKeyPanelProps {
  onPress: (key: string) => void;
  isHighlighted: (id: string) => boolean;
}

export function BoeingFunctionKeyPanel({ onPress, isHighlighted }: BoeingFunctionKeyPanelProps) {
  return (
    <div className="mt-2 w-full rounded-[5px] border border-black/50 bg-black/20 p-1.5">
      {[row1, row2].map((row, rowIndex) => (
        <div key={rowIndex} className={`grid grid-cols-7 gap-1 ${rowIndex > 0 ? 'mt-1' : ''}`}>
          {row.map(item => (
            <AvionicsKey
              key={item.key}
              label={item.label}
              variant="function"
              active={isHighlighted(item.highlight)}
              onPress={() => onPress(item.key)}
              className="h-9 w-full"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
