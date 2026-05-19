import type { PanelId } from '@shared';
export { PanelId };

export type PanelState = {
  id: PanelId;
  visible: boolean;
  dock: 'left' | 'right' | 'bottom' | 'center' | 'floating';
  focused: boolean;
  minimized: boolean;
};

export const panelLabels: Record<PanelId, string> = {
  cdu: 'CDU',
  nd: 'ND',
  pfd: 'PFD',
  autoflight: 'Autoflight',
  instructor: 'Instructor',
  checklist: 'Checklist',
  connection: 'Connection',
  settings: 'Settings',
  eicas: 'EICAS',
};
