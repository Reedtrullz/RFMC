import { AvionicsKey } from '../../instruments/common/AvionicsKey';
import { RotaryKnob } from '../../instruments/common/RotaryKnob';

interface BoeingKeypadAreaProps {
  onPress: (key: string) => void;
  isHighlighted: (id: string) => boolean;
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

const row5Alphas = [
  { label: 'Z', key: 'Z', variant: 'boeing' as const },
  { label: 'SP', key: 'SPACE', variant: 'boeing' as const },
  { label: 'DEL', key: 'DEL', variant: 'function' as const },
  { label: '/', key: 'SLASH', variant: 'function' as const },
  { label: 'CLR', key: 'CLR', variant: 'boeing' as const },
];

export function BoeingKeypadArea({
  onPress,
  isHighlighted,
  execLit,
  brightness,
  onBrightnessChange,
  hintLevel,
}: BoeingKeypadAreaProps) {
  const getHint = (id: string) => (isHighlighted(id) ? hintLevel : 0);

  return (
    <div className="boeing-keypad-panel hardware-wear-panel mt-1 w-full rounded-[8px] border-2 border-[#1a1c1d] bg-[#2a2d2d] pt-1.5 pb-2 px-2.5 shadow-[inset_0_4px_10px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)]">
      {/* Top Section (Functions + EXEC/BRT) */}
      <div className="grid grid-cols-[5fr_1fr] gap-3 mb-2">
        {/* Row 1 & 2 Functions */}
        <div className="grid grid-cols-5 gap-1.5">
          <AvionicsKey
            label="INIT REF"
            shape="rect"
            variant="function"
            ariaLabel="Init Ref page"
            hintLevel={getHint('INIT_REF')}
            onPress={() => onPress('INIT_REF')}
          />
          <AvionicsKey
            label="RTE"
            shape="rect"
            variant="function"
            ariaLabel="Route page"
            hintLevel={getHint('RTE')}
            onPress={() => onPress('RTE')}
          />
          <AvionicsKey
            label="DEP ARR"
            shape="rect"
            variant="function"
            ariaLabel="Departure Arrivals page"
            hintLevel={getHint('DEP_ARR')}
            onPress={() => onPress('DEP_ARR')}
          />
          <AvionicsKey
            label="ATC"
            shape="rect"
            variant="function"
            ariaLabel="ATC page"
            hintLevel={getHint('ATC')}
            onPress={() => onPress('ATC')}
          />
          <AvionicsKey
            label="VNAV"
            shape="rect"
            variant="function"
            ariaLabel="VNAV page"
            hintLevel={getHint('VNAV')}
            onPress={() => onPress('VNAV')}
          />

          <AvionicsKey
            label="FIX"
            shape="rect"
            variant="function"
            ariaLabel="Fix page"
            hintLevel={getHint('FIX')}
            onPress={() => onPress('FIX')}
          />
          <AvionicsKey
            label="LEGS"
            shape="rect"
            variant="function"
            ariaLabel="Legs page"
            hintLevel={getHint('LEGS')}
            onPress={() => onPress('LEGS')}
          />
          <AvionicsKey
            label="HOLD"
            shape="rect"
            variant="function"
            ariaLabel="Hold page"
            hintLevel={getHint('HOLD')}
            onPress={() => onPress('HOLD')}
          />
          <AvionicsKey
            label="FMC COMM"
            shape="rect"
            variant="function"
            ariaLabel="FMC Comm page"
            hintLevel={getHint('FMC_COMM')}
            onPress={() => onPress('FMC_COMM')}
          />
          <AvionicsKey
            label="PROG"
            shape="rect"
            variant="function"
            ariaLabel="Progress page"
            hintLevel={getHint('PROG')}
            onPress={() => onPress('PROG')}
          />
        </div>

        {/* EXEC and BRT */}
        <div className="flex flex-col items-center justify-between pb-1">
          <div className="scale-75 -mt-2">
            <RotaryKnob
              value={brightness}
              onRotate={(delta) => onBrightnessChange(Math.max(20, Math.min(100, brightness + delta * 5)))}
              size="sm"
              label="BRT"
              variant="boeing"
            />
          </div>
          <AvionicsKey
            label="EXEC"
            shape="rect"
            variant="exec"
            lit={execLit}
            active={isHighlighted('EXEC')}
            hintLevel={getHint('EXEC')}
            onPress={() => onPress('EXEC')}
            className="w-full h-10 mt-auto"
          />
        </div>
      </div>

      {/* Bottom Section (Menu/Numbers & Alphas) */}
      <div className="flex gap-4">
        {/* Left Bottom (Menu, N1 LIMIT, Prev/Next, Numbers) */}
        <div className="flex flex-col flex-[3.2]">
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <AvionicsKey
              label="MENU"
              shape="rect"
              variant="function"
              ariaLabel="Menu page"
              hintLevel={getHint('MENU')}
              onPress={() => onPress('MENU')}
            />
            <AvionicsKey
              label="N1 LIMIT"
              shape="rect"
              variant="function"
              ariaLabel="N1 Limit page"
              hintLevel={getHint('N1_LIMIT')}
              onPress={() => onPress('N1_LIMIT')}
            />
            <AvionicsKey
              label="PREV PAGE"
              shape="rect"
              variant="function"
              ariaLabel="Previous page"
              hintLevel={getHint('PREV_PAGE')}
              onPress={() => onPress('PREV_PAGE')}
              className="h-10"
            />
            <AvionicsKey
              label="NEXT PAGE"
              shape="rect"
              variant="function"
              ariaLabel="Next page"
              hintLevel={getHint('NEXT_PAGE')}
              onPress={() => onPress('NEXT_PAGE')}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 px-1 mt-auto">
            {numKeys.map((row, rIdx) =>
              row.map((key) => (
                <AvionicsKey
                  key={key}
                  label={key}
                  shape="round"
                  variant="boeing"
                  hintLevel={getHint(key)}
                  onPress={() => onPress(key)}
                  className="aspect-square w-full h-auto !min-h-[36px] text-lg"
                />
              )),
            )}
          </div>
        </div>

        {/* Right Bottom (Alphas) */}
        <div className="flex flex-col flex-[5] pl-2 border-l border-black/20">
          <div className="grid grid-cols-5 gap-1">
            {alphaKeys.map((row, rIdx) =>
              row.map((key) => (
                <AvionicsKey
                  key={key}
                  label={key}
                  shape="square"
                  variant="boeing"
                  hintLevel={getHint(key)}
                  onPress={() => onPress(key)}
                  className="aspect-square w-full h-auto !min-h-[36px] text-base"
                />
              )),
            )}
            {row5Alphas.map((item) => (
              <AvionicsKey
                key={item.key}
                label={item.label}
                shape="square"
                variant={item.variant}
                hintLevel={getHint(item.key)}
                onPress={() => onPress(item.key)}
                className="aspect-square w-full h-auto !min-h-[36px] text-sm"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
