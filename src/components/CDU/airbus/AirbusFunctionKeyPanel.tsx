import { useCockpitLayoutStore } from '../../../store/cockpitLayoutStore';
import { AvionicsKey } from '../../instruments/common/AvionicsKey';

interface FunctionKey {
  label: string;
  key: string;
  ariaLabel: string;
  small?: boolean;
  disabled?: boolean;
}

interface AirbusFunctionKeyPanelProps {
  onPress: (key: string) => void;
  isHighlighted: (id: string) => boolean;
}

const row1: FunctionKey[] = [
  { label: 'DIR', key: 'DIR_INTC', ariaLabel: 'Direct Intercept' },
  { label: 'PROG', key: 'PROG_A', ariaLabel: 'Progress' },
  { label: 'PERF', key: 'PERF_TAKEOFF', ariaLabel: 'Performance' },
  { label: 'INIT', key: 'INIT_A', ariaLabel: 'Init' },
  { label: 'DATA', key: 'DATA_INDEX', ariaLabel: 'Data' },
  { label: '', key: 'BLANK1', ariaLabel: 'Blank', disabled: true },
];

const row2: FunctionKey[] = [
  { label: 'F-PLN', key: 'F_PLN', ariaLabel: 'Flight Plan' },
  { label: 'RAD NAV', key: 'RAD_NAV', ariaLabel: 'Radio Navigation', small: true },
  { label: 'FUEL PRED', key: 'FUEL_PRED', ariaLabel: 'Fuel Prediction', small: true },
  { label: 'SEC F-PLN', key: 'SEC_F_PLN', ariaLabel: 'Secondary Flight Plan', small: true },
  { label: 'ATC COMM', key: 'ATC_COMM', ariaLabel: 'ATC Communications', small: true },
  { label: 'MCDU MENU', key: 'MCDU_MENU', ariaLabel: 'MCDU Menu', small: true },
];

const row3: FunctionKey[] = [
  { label: 'AIR PORT', key: 'AIR_PORT', ariaLabel: 'Airport', small: true },
  { label: '', key: 'BLANK2', ariaLabel: 'Blank', disabled: true },
  { label: '', key: 'BLANK3', ariaLabel: 'Blank', disabled: true },
  { label: '', key: 'BLANK4', ariaLabel: 'Blank', disabled: true },
  { label: '', key: 'BLANK5', ariaLabel: 'Blank', disabled: true },
  { label: '', key: 'BLANK6', ariaLabel: 'Blank', disabled: true },
];

export function AirbusFunctionKeyPanel({ onPress, isHighlighted }: AirbusFunctionKeyPanelProps) {
  const brightness = useCockpitLayoutStore((s) => s.brightness);
  const setBrightness = useCockpitLayoutStore((s) => s.setBrightness);

  const handleBrt = () => {
    setBrightness(Math.min(100, brightness + 10));
  };

  const handleDim = () => {
    setBrightness(Math.max(0, brightness - 10));
  };

  const renderKey = (item: FunctionKey) => {
    if (item.disabled) {
      return (
        <div
          key={item.key}
          className="flex-1 h-9 rounded bg-[#1f2326] border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] opacity-20 pointer-events-none"
        />
      );
    }
    return (
      <AvionicsKey
        key={item.key}
        label={item.label}
        ariaLabel={item.ariaLabel}
        variant="airbus"
        shape="function"
        tone="white"
        highlighted={isHighlighted(item.key)}
        onPress={() => onPress(item.key)}
        className={`flex-1 h-9 ${item.small ? 'text-[8px] leading-tight px-0.5' : 'text-[10px]'}`}
      />
    );
  };

  return (
    <div className="mt-2.5 flex w-full gap-2 items-center px-1">
      <div className="flex-[6] flex flex-col gap-1.5">
        <div className="flex gap-1.5 w-full">{row1.map(renderKey)}</div>
        <div className="flex gap-1.5 w-full">{row2.map(renderKey)}</div>
        <div className="flex gap-1.5 w-full">{row3.map(renderKey)}</div>
      </div>

      <div className="flex-[1] flex flex-col gap-1.5 items-center justify-center min-w-[44px]">
        <AvionicsKey
          label="BRT"
          ariaLabel="Brightness Increase"
          variant="airbus"
          onPress={handleBrt}
          className="w-full h-11 text-[9px] font-bold"
        />
        <AvionicsKey
          label="DIM"
          ariaLabel="Brightness Decrease"
          variant="airbus"
          onPress={handleDim}
          className="w-full h-11 text-[9px] font-bold mt-1"
        />
      </div>
    </div>
  );
}
