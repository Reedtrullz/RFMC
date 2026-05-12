import { AvionicsKey } from '../../visual/AvionicsKey';
import { BoeingBrightnessExecPanel } from './BoeingBrightnessExecPanel';

interface BoeingAlphaNumericKeypadProps {
  onPress: (key: string) => void;
  highlight: string | null;
  execLit: boolean;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
}

const numKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '+/-'],
];

const alphaKeys = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O'],
  ['P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y'],
];

export function BoeingAlphaNumericKeypad({
  onPress,
  highlight,
  execLit,
  brightness,
  onBrightnessChange,
}: BoeingAlphaNumericKeypadProps) {
  return (
    <div className="mt-2 flex w-full gap-1.5 rounded-[5px] border border-black/50 bg-black/25 p-1.5">
      <div className="flex-[1.2]">
        {numKeys.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid grid-cols-3 gap-1 ${rowIndex > 0 ? 'mt-1' : ''}`}>
            {row.map(key => (
              <AvionicsKey
                key={key}
                label={key}
                shape="numeric"
                onPress={() => onPress(key)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex-[1.8]">
        {alphaKeys.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid grid-cols-5 gap-1 ${rowIndex > 0 ? 'mt-1' : ''}`}>
            {row.map(key => (
              <AvionicsKey
                key={key}
                label={key}
                shape="alpha"
                onPress={() => onPress(key)}
              />
            ))}
          </div>
        ))}
        <div className="mt-1 grid grid-cols-[0.7fr_1.3fr_1.3fr_0.7fr_1fr] gap-1">
          <AvionicsKey label="/" shape="function" onPress={() => onPress('SLASH')} />
          <AvionicsKey label="CLR" shape="wide" onPress={() => onPress('CLR')} />
          <AvionicsKey label="SP" shape="wide" onPress={() => onPress('SPACE')} />
          <AvionicsKey label="Z" shape="alpha" onPress={() => onPress('Z')} />
          <AvionicsKey label="DEL" shape="function" onPress={() => onPress('DEL')} />
        </div>
        <BoeingBrightnessExecPanel
          execLit={execLit}
          highlightedExec={highlight === 'EXEC'}
          brightness={brightness}
          onBrightnessChange={onBrightnessChange}
          onPress={onPress}
        />
      </div>
    </div>
  );
}
