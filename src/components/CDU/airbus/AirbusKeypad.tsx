import { AvionicsKey } from '../../visual/AvionicsKey';

interface AirbusKeypadProps {
  onPress: (key: string) => void;
  highlight: string | null;
  execLit: boolean;
}

const numKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '+/-'],
];

const alphaKeys = [
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['G', 'H', 'I'],
  ['J', 'K', 'L'],
  ['M', 'N', 'O'],
  ['P', 'Q', 'R'],
  ['S', 'T', 'U'],
  ['V', 'W', 'X'],
  ['Y', 'Z', 'SP'],
];

export function AirbusKeypad({ onPress, highlight, execLit }: AirbusKeypadProps) {
  return (
    <div className="mt-1.5 flex w-full gap-1">
      <div className="flex-[1] flex flex-col gap-1">
        {numKeys.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((k) => (
              <AvionicsKey
                key={k}
                label={k}
                variant="airbus"
                onPress={() => onPress(k)}
                className="flex-1 h-9"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex-[2] flex flex-col gap-1">
        <div className="grid grid-cols-3 gap-1">
          {alphaKeys.flat().map((k) => (
            <AvionicsKey
              key={k}
              label={k}
              variant="airbus"
              onPress={() => onPress(k === 'SP' ? 'SPACE' : k)}
              className="h-9"
            />
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          <AvionicsKey label="/" variant="function" onPress={() => onPress('SLASH')} className="flex-1 h-9" />
          <AvionicsKey label="CLR" variant="airbus" onPress={() => onPress('CLR')} className="flex-[2] h-9" />
          <AvionicsKey label="DEL" variant="function" onPress={() => onPress('DEL')} className="flex-1 h-9" />
          <AvionicsKey
            label="EXEC"
            variant="exec"
            lit={execLit}
            active={highlight === 'EXEC'}
            onPress={() => onPress('EXEC')}
            className="flex-[2] h-9"
          />
        </div>
      </div>
    </div>
  );
}
