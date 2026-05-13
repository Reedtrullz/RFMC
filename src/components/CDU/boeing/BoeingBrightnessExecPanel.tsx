import { AvionicsKey } from '../../instruments/common/AvionicsKey';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';

interface BoeingBrightnessExecPanelProps {
  execLit: boolean;
  highlightedExec: boolean;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
  onPress: (key: string) => void;
  hintLevel?: number;
}

export function BoeingBrightnessExecPanel({
  execLit,
  highlightedExec,
  brightness,
  onBrightnessChange,
  onPress,
  hintLevel,
}: BoeingBrightnessExecPanelProps) {
  return (
    <div className="mt-1 grid grid-cols-[1.4fr_0.7fr_1fr_1fr] gap-1">
      <AvionicsKey
        label="EXEC"
        variant="exec"
        lit={execLit}
        active={highlightedExec}
        hintLevel={highlightedExec ? hintLevel : 0}
        onPress={() => onPress('EXEC')}
      />
      <div className="flex flex-col items-center justify-end rounded-[4px] border border-black/60 bg-black/25 px-1 pb-1">
        <span className="mb-1 font-cdu text-[7px] text-cdu-white/50">BRT</span>
        <input
          aria-label="CDU brightness"
          type="range"
          min="20"
          max="100"
          value={brightness}
          onChange={(event) => onBrightnessChange(Number(event.target.value))}
          className="h-1 w-full appearance-none rounded-full bg-cdu-bezel-light outline-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cdu-white"
        />
      </div>
      <AvionicsKey label="NEXT" variant="boeing" onPress={() => onPress('NEXT_PAGE')} />
      <AvionicsKey label="PREV" variant="boeing" onPress={() => onPress('PREV_PAGE')} />
    </div>
  );
}
