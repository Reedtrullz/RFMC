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
function modData(
  text: string,
  isModified: boolean,
  left: string = '',
  right: string = '',
  color?: DisplayLine['color'],
): DisplayLine {
  return fmt(text, left, right, color, isModified ? 'modified' : undefined);
}

export function renderDepArrPage(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const { depArrSubPage } = state;
  const title = state.isModified ? 'MOD DEP/ARR' : 'DEP/ARR';

  if (depArrSubPage === 'DEP') {
    return {
      title,
      pageIndicator: 'DEP',
      lines: [
        inverse(`  ${title}        DEP`),
        fmt(` ${route.origin || '----'}`, '', ''),
        fmt(' SID', '<', '', 'white'),
        modData(` ${route.sid || '----'}`, state.isModified, '', '', 'green'),
        fmt(' RUNWAY', '<', '', 'white'),
        modData(` ${route.runway || '----'}`, state.isModified, '', '', 'green'),
        blank(),
        fmt(' TRANS', '<', '', 'white'),
        fmt(' ----', '', '', 'green'),
        blank(),
        blank(),
        state.isModified ? fmt(' ERASE', '<', '', 'amber') : blank(),
      ],
      lskActions: {
        L1: null,
        L2: 'set_sid',
        L3: 'set_rwy',
        L4: null,
        L5: null,
        L6: state.isModified ? 'erase' : 'arr_page',
        R1: null,
        R2: null,
        R3: null,
        R4: null,
        R5: null,
        R6: null,
      },
    };
  }

  // ARR page
  return {
    title,
    pageIndicator: 'ARR',
    lines: [
      inverse(`  ${title}        ARR`),
      fmt(` ${route.destination || '----'}`, '', ''),
      fmt(' STAR', '<', '', 'white'),
      modData(` ${route.star || '----'}`, state.isModified, '', '', 'green'),
      fmt(' APPROACH', '<', '', 'white'),
      modData(` ${route.approach || '----'}`, state.isModified, '', '', 'green'),
      fmt(' RUNWAY', '<', '', 'white'),
      modData(` ${route.runway || '----'}`, state.isModified, '', '', 'green'),
      blank(),
      fmt(' TRANS', '<', '', 'white'),
      fmt(' ----', '', '', 'green'),
      blank(),
      state.isModified ? fmt(' ERASE', '<', '', 'amber') : blank(),
    ],
    lskActions: {
      L1: null,
      L2: 'set_star',
      L3: 'set_appr',
      L4: 'set_rwy',
      L5: null,
      L6: state.isModified ? 'erase' : 'dep_page',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
  };
}
