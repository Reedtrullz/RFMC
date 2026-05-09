/**
 * PMDG 737 adapter - reads CDU display via SimConnect L: variables.
 *
 * PMDG 737 exposes the CDU screen as:
 *   L:PMDG_CDU_Screen_1_Row_X_Col_Y for each character position
 *   L:PMDG_CDU_Screen_1_Title for the title
 *
 * This is a stub that provides mock data when MSFS/SimConnect is unavailable.
 * Wire to real SimConnect via node-simconnect in production.
 */

import type { IAircraftAdapter, CDUDisplayData } from './IAircraftAdapter';

export class PMDG737Adapter implements IAircraftAdapter {
  readonly name = 'PMDG 737-800';
  isConnected = false;

  private mockLines: string[] = [];

  constructor() {
    // Default mock display: IDENT page
    this.mockLines = [
      '  IDENT            1/1',
      ' MODEL',
      ' 737-800',
      '',
      ' ENG RATING',
      ' 26K',
      '',
      ' NAV DATA',
      ' FMC21A1',
      '',
      ' -----------------------',
      '                         ',
      '                         ',
    ];
  }

  async connect(): Promise<boolean> {
    // TODO: Connect to MSFS via node-simconnect
    // Check if PMDG L: variables are available
    console.log(`[PMDG] Attempting connection...`);
    this.isConnected = true; // Stub - assumes connected
    console.log(`[PMDG] Connected to ${this.name}`);
    return true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log(`[PMDG] Disconnected`);
  }

  async readDisplay(): Promise<CDUDisplayData> {
    // TODO: Read from SimConnect L:PMDG_CDU_Screen_1_* variables
    // For now, return mock data
    return {
      lines: this.mockLines,
      title: 'IDENT',
      brightness: 0.8,
    };
  }

  async sendKeypress(key: string): Promise<void> {
    // TODO: Send via SimConnect to PMDG
    // PMDG accepts H: events or specific L: variables for CDU keys
    console.log(`[PMDG] Keypress: ${key}`);
  }

  async sendLSK(side: 'L' | 'R', index: number): Promise<void> {
    const lsk = `${side}${index}`;
    console.log(`[PMDG] LSK: ${lsk}`);
    await this.sendKeypress(lsk);
  }
}
