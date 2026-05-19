import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_WIDTH } from '../constants';
import { inferBoeingSemantic } from '../pageLineSemantics';

function fmt(
  text: string,
  left: string = '',
  right: string = '',
  color?: DisplayLine['color'],
  semantic?: DisplayLine['semantic'],
): DisplayLine {
  return {
    text: text.padEnd(PAGE_WIDTH, ' '),
    leftLabel: left,
    rightLabel: right,
    inverse: false,
    color,
    semantic: semantic ?? inferBoeingSemantic(color),
  };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { ...fmt(text, left, right, color), inverse: true, color, semantic: inferBoeingSemantic(color, true) };
}
function blank() {
  return fmt('', '', '');
}

export function renderHoldPage(state: FMCState): DisplayData {
  const { hold, holdPending } = state;
  const h = holdPending ?? hold;
  const fixStr = h.fix || '----';
  const crsStr = h.inboundCourse ? String(h.inboundCourse).padStart(3, '0') : '---';
  const timeStr = h.legTime ? `${h.legTime.toFixed(1)} MIN` : '1.0 MIN';
  const distStr = h.legDist ? `${h.legDist.toFixed(1)} NM` : '---';
  const dirStr = h.direction || 'R';

  return {
    title: 'HOLD',
    pageIndicator: '1/1',
    lines: [
      inverse('  HOLD             1/1', '', '', 'cyan'),
      blank(),
      fmt(' FIX', '<', '', 'white'),
      fmt(` ${fixStr}`, '', '', 'green'),
      blank(),
      fmt(' INBOUND CRS', '<', '', 'white'),
      fmt(` ${crsStr}`, '', '', 'green'),
      fmt(' LEG TIME', '<', '', 'white'),
      fmt(` ${timeStr}`, '', '', 'green'),
      blank(),
      fmt(' LEG DIST', '<', '', 'white'),
      fmt(` ${distStr}`, '', '', 'green'),
      fmt(' DIR', '<', '', 'white'),
      fmt(` ${dirStr}`, '', '', 'green'),
      blank(),
    ],
    lskActions: {
      L1: 'set_hold_fix',
      L2: null,
      L3: 'set_inbound_crs',
      L4: 'set_leg_time',
      L5: 'set_leg_dist',
      L6: null,
      R1: 'set_hold_direction',
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
    lskLabels: {
      L1: 'FIX',
      L3: 'CRS',
      L4: 'TIME',
      L5: 'DIST',
      R1: 'DIR',
    },
  };
}

export function renderFixPage(state: FMCState): DisplayData {
  const entries = getFixEntries(state);
  const [entry1, entry2] = entries;
  const refFix1 = entry1.refFix || '----';
  const radDis1 = formatFixRadialDistance(entry1);
  const refFix2 = entry2.refFix || '----';
  const radDis2 = formatFixRadialDistance(entry2);
  const abeam1 =
    entry1.refFix && entry1.radial > 0
      ? `1 ${entry1.refFix} R${String(entry1.radial).padStart(3, '0')} D${String(entry1.distance).padStart(3, '0')}`
      : '---/---';
  const abeam2 =
    entry2.refFix && entry2.radial > 0
      ? `2 ${entry2.refFix} R${String(entry2.radial).padStart(3, '0')} D${String(entry2.distance).padStart(3, '0')}`
      : '----';

  return {
    title: 'FIX',
    pageIndicator: '1/1',
    lines: [
      inverse('  FIX              1/1', '', '', 'cyan'),
      blank(),
      fmt(' REF FIX 1', '<', 'REF FIX 2', 'white'),
      fmt(` ${refFix1}`, '', refFix2, 'green'),
      blank(),
      fmt(' RAD/DIS 1', '<', 'RAD/DIS 2', 'white'),
      fmt(` ${radDis1}`, '', radDis2, 'green'),
      blank(),
      fmt(' ABEAM PTS', '', '', 'white'),
      fmt(` ${abeam1}`, '', '', 'green'),
      fmt(` ${abeam2}`, '', '', 'green'),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_fix_ref_0',
      L2: 'set_fix_radial_distance_0',
      L3: null,
      L4: null,
      L5: null,
      L6: null,
      R1: 'set_fix_ref_1',
      R2: 'set_fix_radial_distance_1',
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
    lskLabels: {
      L1: 'REF1',
      L2: 'R/D1',
      R1: 'REF2',
      R2: 'R/D2',
    },
  };
}

function getFixEntries(state: FMCState) {
  const entries = state.fixEntries.some((entry) => entry.refFix) ? state.fixEntries : [state.fix];
  return [entries[0] ?? { refFix: '', radial: 0, distance: 0 }, entries[1] ?? { refFix: '', radial: 0, distance: 0 }];
}

function formatFixRadialDistance(entry: { refFix: string; radial: number; distance: number }): string {
  return entry.refFix && entry.radial > 0
    ? `${String(entry.radial).padStart(3, '0')}/${String(entry.distance).padStart(3, '0')}`
    : '---/---';
}
