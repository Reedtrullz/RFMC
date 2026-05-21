import { AvionicsKey } from '../../instruments/common/AvionicsKey';

interface AirbusKeypadProps {
  onPress: (key: string) => void;
  highlight: string | null;
  execLit: boolean;
}

const numKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const alphaRows = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O'],
  ['P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y'],
];

export function AirbusKeypad({ onPress, highlight }: AirbusKeypadProps) {
  const isHighlighted = (k: string) => highlight === k;

  return (
    <div className="airbus-keypad-panel hardware-wear-panel mt-2.5 flex w-full gap-3 px-1">
      <div className="flex-[3] flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-1.5 w-full max-w-[150px] mx-auto bg-[#1f2326]/30 p-1.5 rounded-lg border border-black/20">
          <div />
          <AvionicsKey
            label="▲"
            variant="airbus"
            highlighted={isHighlighted('PREV_PAGE')}
            onPress={() => onPress('PREV_PAGE')}
            className="h-[34px] w-full text-[10px]"
          />
          <div />
          <AvionicsKey
            label="◀"
            variant="airbus"
            highlighted={isHighlighted('PREV_PAGE')}
            onPress={() => onPress('PREV_PAGE')}
            className="h-[34px] w-full text-[10px]"
          />
          <div />
          <AvionicsKey
            label="▶"
            variant="airbus"
            highlighted={isHighlighted('NEXT_PAGE')}
            onPress={() => onPress('NEXT_PAGE')}
            className="h-[34px] w-full text-[10px]"
          />
          <div />
          <AvionicsKey
            label="▼"
            variant="airbus"
            highlighted={isHighlighted('NEXT_PAGE')}
            onPress={() => onPress('NEXT_PAGE')}
            className="h-[34px] w-full text-[10px]"
          />
          <div />
        </div>

        <div className="flex flex-col gap-1.5 w-full mt-1">
          {numKeys.map((row, ri) => (
            <div key={ri} className="flex gap-1.5 w-full">
              {row.map((k) => (
                <AvionicsKey
                  key={k}
                  label={k}
                  variant="airbus"
                  highlighted={isHighlighted(k)}
                  onPress={() => onPress(k)}
                  className="flex-1 h-9 font-bold text-xs"
                />
              ))}
            </div>
          ))}
          <div className="flex gap-1.5 w-full">
            <AvionicsKey
              label="."
              variant="airbus"
              highlighted={isHighlighted('DOT')}
              onPress={() => onPress('DOT')}
              className="flex-1 h-9 font-bold text-xs"
            />
            <AvionicsKey
              label="0"
              variant="airbus"
              highlighted={isHighlighted('0')}
              onPress={() => onPress('0')}
              className="flex-1 h-9 font-bold text-xs"
            />
            <AvionicsKey
              label="+/-"
              variant="airbus"
              highlighted={isHighlighted('PLUS_MINUS')}
              onPress={() => onPress('PLUS_MINUS')}
              className="flex-1 h-9 font-bold text-[10px]"
            />
          </div>
        </div>
      </div>

      <div className="flex-[5] flex flex-col gap-1.5">
        {alphaRows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 w-full">
            {row.map((k) => (
              <AvionicsKey
                key={k}
                label={k}
                variant="airbus"
                highlighted={isHighlighted(k)}
                onPress={() => onPress(k)}
                className="flex-1 h-9 font-bold text-xs"
              />
            ))}
          </div>
        ))}
        <div className="flex gap-1.5 w-full">
          <AvionicsKey
            label="Z"
            variant="airbus"
            highlighted={isHighlighted('Z')}
            onPress={() => onPress('Z')}
            className="flex-1 h-9 font-bold text-xs"
          />
          <AvionicsKey
            label="/"
            variant="airbus"
            highlighted={isHighlighted('SLASH')}
            onPress={() => onPress('SLASH')}
            className="flex-1 h-9 font-bold text-xs"
          />
          <AvionicsKey
            label="SP"
            variant="airbus"
            ariaLabel="Space"
            highlighted={isHighlighted('SPACE')}
            onPress={() => onPress('SPACE')}
            className="flex-1 h-9 font-bold text-xs"
          />
          <AvionicsKey
            label="OVFY"
            variant="airbus"
            highlighted={isHighlighted('OVFY')}
            onPress={() => onPress('OVFY')}
            className="flex-1 h-9 font-bold text-[9px] px-0.5"
          />
          <AvionicsKey
            label="CLR"
            variant="airbus"
            highlighted={isHighlighted('CLR')}
            onPress={() => onPress('CLR')}
            className="flex-1 h-9 font-bold text-[10px]"
          />
        </div>
      </div>
    </div>
  );
}
