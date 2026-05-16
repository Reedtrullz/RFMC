import { AvionicsKey } from '../../instruments/common/AvionicsKey';
import { BoeingBrightnessExecPanel } from './BoeingBrightnessExecPanel';

interface BoeingAlphaNumericKeypadProps {
  onPress: (key: string) => void;
  highlight: string | null;
  execLit: boolean;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
  hintLevel?: number;
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
  hintLevel,
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
                variant="boeing"
                hintLevel={highlight === key ? hintLevel : 0}
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
                variant="boeing"
                hintLevel={highlight === key ? hintLevel : 0}
                onPress={() => onPress(key)}
              />
            ))}
          </div>
        ))}
        <div className="mt-1 grid grid-cols-[0.7fr_1.3fr_1.3fr_0.7fr_1fr] gap-1">
              <AvionicsKey label="/" variant="function" ariaLabel="Slash" hintLevel={highlight === 'SLASH' ? hintLevel : 0} onPress={() => onPress('SLASH')} />
          <AvionicsKey label="CLR" variant="boeing" ariaLabel="Clear" hintLevel={highlight === 'CLR' ? hintLevel : 0} onPress={() => onPress('CLR')} />
          <AvionicsKey label="SP" variant="boeing" ariaLabel="Space" hintLevel={highlight === 'SPACE' ? hintLevel : 0} onPress={() => onPress('SPACE')} />
          <AvionicsKey label="Z" variant="boeing" hintLevel={highlight === 'Z' ? hintLevel : 0} onPress={() => onPress('Z')} />
          <AvionicsKey label="DEL" variant="function" ariaLabel="Delete" hintLevel={highlight === 'DEL' ? hintLevel : 0} onPress={() => onPress('DEL')} />
        </div>
        <BoeingBrightnessExecPanel
          execLit={execLit}
          highlightedExec={highlight === 'EXEC'}
          hintLevel={highlight === 'EXEC' ? hintLevel : 0}
          brightness={brightness}
          onBrightnessChange={onBrightnessChange}
          onPress={onPress}
        />
      </div>
    </div>
  );
}
