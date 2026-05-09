import type { FMCState, DisplayData } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false };
}
function inverse(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { ...fmt(text, left, right), inverse: true };
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
    const sids = [
      { name: 'RBV3', runway: '22L', idx: 1 },
      { name: 'BETTE3', runway: '22L', idx: 2 },
      { name: 'JFK5', runway: '31L', idx: 3 },
    ];

    return {
      title: 'DEP/ARR',
      pageIndicator: 'DEP',
      lines: [
        inverse('  DEP/ARR        DEP'),
        fmt(` ${route.origin || '----'}`, '', ''),
        fmt(' SID', '', ''),
        ...sids.flatMap(s => [
          fmt(`  ${s.name}`, '<'),
          fmt(`   RW${s.runway}`),
        ]),
        ...Array(Math.max(0, 14 - sids.length * 2 - 3)).fill(0).map(() => blank()),
      ].slice(0, PAGE_LINES),
      lskActions: {
        L1: null,
        L2: null,
        L3: 'select_sid_1',
        L4: null,
        L5: 'select_sid_2',
        L6: 'arr_page',
        R1: null,
        R2: null,
        R3: null,
        R4: null,
        R5: 'select_sid_3',
        R6: null,
      },
    };
  }

  // ARR page
  const stars = [
    { name: 'FRDMM2', runway: '22L', idx: 1 },
    { name: 'ILG1', runway: '27R', idx: 2 },
  ];
  const approaches = [
    { name: 'ILS22L', type: 'ILS', idx: 3 },
    { name: 'RNAV27R', type: 'RNAV', idx: 4 },
  ];

  const allItems = [
    fmt(` ${route.destination || '----'}`, '', ''),
    fmt(' STAR', '', ''),
    ...stars.flatMap(s => [fmt(`  ${s.name}`, '<'), fmt(`   RW${s.runway}`)]),
    fmt(' APPR', '', ''),
    ...approaches.flatMap(a => [fmt(`  ${a.name}`, '<'), fmt(`   ${a.type}`)]),
  ];

  return {
    title: 'DEP/ARR',
    pageIndicator: 'ARR',
    lines: [
      inverse('  DEP/ARR        ARR'),
      ...allItems,
      ...Array(Math.max(0, PAGE_LINES - 1 - allItems.length)).fill(0).map(() => blank()),
    ].slice(0, PAGE_LINES),
    lskActions: {
      L1: null,
      L2: null,
      L3: 'select_star_1',
      L4: null,
      L5: 'select_star_2',
      L6: 'dep_page',
      R1: null,
      R2: null,
      R3: 'select_apr_1',
      R4: null,
      R5: 'select_apr_2',
      R6: null,
    },
  };
}
