import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';
import { inferBoeingSemantic } from '../pageLineSemantics';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color, semantic: inferBoeingSemantic(color) };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { ...fmt(text, left, right, color), inverse: true, color, semantic: inferBoeingSemantic(color, true) };
}
function blank() { return fmt('', '', ''); }

export function renderRtePage(state: FMCState): DisplayData {
  const { route, flightPlan, rteSubPage } = state;

  if (rteSubPage === 0) {
    return {
      title: 'RTE',
      pageIndicator: '1/2',
      lines: [
        inverse('  RTE              1/2'),
        fmt(' ORIGIN', '', ''),
        fmt(` ${route.origin || '----'}`),
        fmt(' DEST', '', ''),
        fmt(` ${route.destination || '----'}`),
        blank(),
        fmt(' FLT NO', '', ''),
        fmt(` ${route.flightNumber || '--------'}`),
        blank(),
        fmt(' CO ROUTE', '', ''),
        fmt(` ${route.companyRoute || '---------'}`),
        blank(),
        blank(),
      ],
      lskActions: {
        L1: 'set_origin',
        L2: null,
        L3: 'set_dest',
        L4: null,
        L5: null,
        L6: 'next_page',
        R1: 'set_flt_no',
        R2: null,
        R3: 'dep_arr',
        R4: null,
        R5: null,
        R6: null,
      },
    };
  }

  // RTE page 2 — route entry
  const routeLines = route.routeString || '----';
  const waypointPreview = flightPlan.waypoints.slice(0, 4).map(w => w.ident).join(' ');

  return {
    title: 'RTE',
    pageIndicator: '2/2',
    lines: [
      inverse('  RTE              2/2'),
      fmt(' ROUTE', '', ''),
      fmt(` ${routeLines.length > 20 ? routeLines.slice(0, 20) : routeLines.padEnd(20)}`),
      blank(),
      fmt(' VIA/TO', '', ''),
      fmt(' DIRECT'),
      blank(),
      fmt(' WPT PREVIEW', '', ''),
      fmt(` ${waypointPreview || '----'}`),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_route',
      L2: null,
      L3: null,
      L4: null,
      L5: null,
      L6: 'prev_page',
      R1: null,
      R2: null,
      R3: 'legs',
      R4: null,
      R5: null,
      R6: null,
    },
  };
}

export function renderDepArrPage(state: FMCState): DisplayData {
  const { route, depArrSubPage } = state;

  if (depArrSubPage === 'DEP') {
    return {
      title: 'DEP/ARR',
      pageIndicator: 'DEP',
      lines: [
        inverse('  DEP/ARR        DEP'),
        fmt(` ${route.origin || '----'}`, '', ''),
        fmt(' SID', '<', '', 'white'),
        fmt(` ${route.sid || '----'}`, '', '', 'green'),
        fmt(' RUNWAY', '<', '', 'white'),
        fmt(` ${route.runway || '----'}`, '', '', 'green'),
        blank(),
        fmt(' TRANS', '<', '', 'white'),
        fmt(' ----', '', '', 'green'),
        blank(),
        blank(),
        blank(),
      ],
      lskActions: {
        L1: null,
        L2: 'set_sid',
        L3: 'set_rwy',
        L4: null,
        L5: null,
        L6: 'arr_page',
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
    title: 'DEP/ARR',
    pageIndicator: 'ARR',
    lines: [
      inverse('  DEP/ARR        ARR'),
      fmt(` ${route.destination || '----'}`, '', ''),
      fmt(' STAR', '<', '', 'white'),
      fmt(` ${route.star || '----'}`, '', '', 'green'),
      fmt(' APPROACH', '<', '', 'white'),
      fmt(` ${route.approach || '----'}`, '', '', 'green'),
      fmt(' RUNWAY', '<', '', 'white'),
      fmt(` ${route.runway || '----'}`, '', '', 'green'),
      blank(),
      fmt(' TRANS', '<', '', 'white'),
      fmt(' ----', '', '', 'green'),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: null,
      L2: 'set_star',
      L3: 'set_appr',
      L4: 'set_rwy',
      L5: null,
      L6: 'dep_page',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
  };
}
