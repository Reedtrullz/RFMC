import { FMCState, DisplayData, AcarsMessage } from '../../../types/fmc';
import { inv, fmt, blank } from './formatting';

export function renderAtsuMenu(state: FMCState): DisplayData {
  const unreadCount = state.atsu.messages.filter((m) => !m.read).length;
  const msgLabel = unreadCount > 0 ? `*RCVD MSGS[${unreadCount}]` : ' RCVD MSGS';

  return {
    title: 'ATSU',
    pageIndicator: '',
    lines: [
      blank(),
      fmt(' AOC MENU', '<', '', 'white'),
      fmt(' ATC MENU', '<', '', 'white'),
      blank(),
      fmt(msgLabel, '<', '', unreadCount > 0 ? 'amber' : 'white'),
      blank(),
      fmt(' COMM STATUS', '', '', 'white'),
      fmt('  VHF3: READY', '', '', 'green'),
      fmt('  SATCOM: READY', '', '', 'green'),
      blank(),
      blank(),
      blank(),
      fmt('', ' <MCDU MENU', '', 'white'),
    ],
    lskActions: {
      L1: 'atsu_aoc',
      L2: 'atsu_atc',
      L3: 'atsu_msgs',
      L6: 'mcdu_menu',
    },
  };
}

export function renderAtsuMessages(state: FMCState): DisplayData {
  const msgs = state.atsu.messages;

  const lines = [inv('  RECEIVED MSGS', '', '', 'cyan')];

  const actions: Record<string, string> = { L6: 'atsu' };

  for (let i = 0; i < 5; i++) {
    const msg = msgs[i];
    if (msg) {
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lines.push(fmt(` ${msg.from} ${time}`, '<', '', msg.read ? 'white' : 'amber'));
      lines.push(fmt(`  ${msg.text.substring(0, 20)}...`, '', '', 'white', true));
      actions[`L${i + 1}`] = `view_msg_${msg.id}`;
    } else {
      lines.push(blank());
      lines.push(blank());
    }
  }

  lines.push(fmt('', ' <BACK', '', 'white'));

  return {
    title: 'ATSU MSGS',
    pageIndicator: `${msgs.length > 0 ? '1' : '0'}/${Math.ceil(msgs.length / 5) || 1}`,
    lines: lines as any,
    lskActions: actions,
  };
}

export function renderAtsuMessageDetail(state: FMCState): DisplayData {
  const msg = state.atsu.messages.find((m) => m.id === state.selectedMessageId);
  if (!msg) return renderAtsuMessages(state);

  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(msg.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' }).toUpperCase();

  const lines = [
    inv('  MESSAGE DETAIL', '', '', 'cyan'),
    fmt(' FROM', 'DATE/TIME', '', 'white'),
    fmt(` ${msg.from}`, ` ${date}/${time}`, '', 'green'),
    blank(),
    fmt(' TEXT', '', '', 'white'),
  ];

  // Wrap text into lines
  const words = msg.text.split(' ');
  let currentLine = ' ';
  for (const word of words) {
    if ((currentLine + word).length > 23) {
      lines.push(fmt(currentLine, '', '', 'green'));
      currentLine = ' ' + word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  lines.push(fmt(currentLine, '', '', 'green'));

  while (lines.length < 13) lines.push(blank());
  lines.push(fmt('', ' <BACK', 'PRINT >', 'white'));

  return {
    title: 'ATSU MSG',
    pageIndicator: '',
    lines: lines as any,
    lskActions: {
      L6: 'atsu_msgs',
      R6: 'print_msg',
    },
  };
}
