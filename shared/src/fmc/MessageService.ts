import { FmcMessage, MessageSeverity, AircraftType } from '../types/fmc';

export class MessageService {
  private messages: FmcMessage[] = [];
  private aircraft: AircraftType = 'BOEING_737';
  private maxType2Queue = 5;

  constructor(aircraft: AircraftType) {
    this.aircraft = aircraft;
  }

  public addMessage(text: string, severity: MessageSeverity, type?: 1 | 2): void {
    const id = Math.random().toString(36).substring(7);
    const color = severity === 'ADVISORY' ? 'white' : 'amber';
    const message: FmcMessage = {
      id,
      text,
      severity,
      timestamp: Date.now(),
      type,
    };

    if (this.aircraft === 'AIRBUS_A320') {
      this.addAirbusMessage(message);
    } else {
      this.addBoeingMessage(message);
    }
  }

  private addAirbusMessage(msg: FmcMessage): void {
    if (msg.type === 1) {
      // Type I messages are immediate and override everything
      this.messages = [msg, ...this.messages.filter((m) => m.type !== 1)];
    } else {
      // Type II messages are queued
      if (this.messages.length < this.maxType2Queue) {
        this.messages.push(msg);
      }
    }
  }

  private addBoeingMessage(msg: FmcMessage): void {
    // Priority: ALERT > IMPORTANT > ADVISORY
    const priority = { ALERT: 3, IMPORTANT: 2, ADVISORY: 1 };
    this.messages.push(msg);
    this.messages.sort((a, b) => priority[b.severity] - priority[a.severity] || b.timestamp - a.timestamp);
  }

  public getActiveMessage(): FmcMessage | null {
    return this.messages.length > 0 ? this.messages[0] : null;
  }

  public clearActiveMessage(): void {
    if (this.messages.length > 0) {
      this.messages.shift();
    }
  }

  public clearMessageById(id: string): void {
    this.messages = this.messages.filter((m) => m.id !== id);
  }

  public getAllMessages(): FmcMessage[] {
    return [...this.messages];
  }

  public setAircraft(aircraft: AircraftType): void {
    this.aircraft = aircraft;
    this.messages = []; // Clear queue on aircraft change
  }
}
