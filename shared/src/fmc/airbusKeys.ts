// Airbus A320 MCDU keyboard layout
// Key: label → CDUKey value

export const AIRBUS_FUNCTION_KEYS = [
  { label: 'AIR\nPORT', key: 'INIT_A' },
  { label: 'F-PLN', key: 'F_PLN' },
  { label: 'PERF', key: 'PERF_TAKEOFF' },
  { label: 'PROG', key: 'PROG_A' },
  { label: 'RAD\nNAV', key: 'RAD_NAV' },
  { label: 'MCDU\nMENU', key: 'MCDU_MENU' },
];

// Airbus has alphabetical keys in a different layout than Boeing
export const AIRBUS_KEYS = {
  numpad: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '+/-'],
  ],
  alphabet: [
    ['A', 'B', 'C'],
    ['D', 'E', 'F'],
    ['G', 'H', 'I'],
    ['J', 'K', 'L'],
    ['M', 'N', 'O'],
    ['P', 'Q', 'R'],
    ['S', 'T', 'U'],
    ['V', 'W', 'X'],
    ['Y', 'Z', 'SP'],
  ],
  actions: [
    { label: '/', key: 'SLASH' },
    { label: 'CLR', key: 'CLR' },
    { label: 'DEL', key: 'DEL' },
    { label: 'EXEC', key: 'EXEC' },
  ],
};
