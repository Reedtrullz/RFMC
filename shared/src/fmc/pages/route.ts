import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';
import { inferBoeingSemantic } from '../pageLineSemantics';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine['color'], semantic?: DisplayLine['semantic']): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color, semantic: semantic ?? inferBoeingSemantic(color) };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { ...fmt(text, left, right, color), inverse: true, color, semantic: inferBoeingSemantic(color, true) };
}
function blank() { return fmt('', '', ''); }
function modData(text: string, isModified: boolean, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return fmt(text, left, right, color, isModified ? 'modified' : undefined);
}

export function renderRtePage(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const { rteSubPage } = state;
  const title = state.isModified ? 'MOD RTE' : 'RTE';

  if (rteSubPage === 0) {
    return {
      title,
      pageIndicator: '1/2',
      lines: [
        inverse(`  ${title}              1/2`),
        fmt(' ORIGIN', '', ''),
        modData(` ${route.origin || '[    ]'}`, state.isModified),
        fmt(' DEST', '', ''),
        modData(` ${route.destination || '[    ]'}`, state.isModified),
        blank(),
        fmt(' FLT NO', '', ''),
        modData(` ${route.flightNumber || '--------'}`, state.isModified),
        blank(),
        fmt(' CO ROUTE', '', ''),
        modData(` ${route.companyRoute || '---------'}`, state.isModified),
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
    title,
    pageIndicator: '2/2',
    lines: [
      inverse(`  ${title}              2/2`),
      fmt(' ROUTE', '', ''),
      modData(` ${routeLines.length > 20 ? routeLines.slice(0, 20) : routeLines.padEnd(20)}`, state.isModified),
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
