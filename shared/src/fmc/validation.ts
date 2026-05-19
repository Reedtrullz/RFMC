export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function isValidICAO(code: string): ValidationResult {
  if (!code || code.length !== 4) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  if (!/^[A-Z]{4}$/.test(code)) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  return { valid: true };
}

export function isValidWaypoint(ident: string): ValidationResult {
  if (!ident || ident.length < 1 || ident.length > 5) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  if (!/^[A-Z0-9]+$/.test(ident)) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  return { valid: true };
}

export function isValidFlightNumber(flt: string): ValidationResult {
  if (!flt || flt.length < 3) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  if (!/^[A-Z]{1,3}\d{1,4}$/.test(flt)) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  return { valid: true };
}

export function isValidAltitude(alt: string): ValidationResult {
  const num = parseInt(alt);
  if (isNaN(num) || num < 0) {
    return { valid: false, error: 'OUT OF RANGE' };
  }
  if (num <= 410) {
    return { valid: true };
  }
  if (num >= 1000 && num <= 41000) {
    return { valid: true };
  }
  return { valid: false, error: 'OUT OF RANGE' };
}

export function isValidSpeed(spd: string): ValidationResult {
  const num = parseInt(spd);
  if (isNaN(num) || num < 50 || num > 500) {
    return { valid: false, error: 'OUT OF RANGE' };
  }
  return { valid: true };
}

export function isValidTemperature(temp: string): ValidationResult {
  const num = parseInt(temp);
  if (isNaN(num) || num < -60 || num > 60) {
    return { valid: false, error: 'OUT OF RANGE' };
  }
  return { valid: true };
}

export function isValidVSpeeds(v1: number, vr: number, v2: number): ValidationResult {
  if (v1 > 0 && vr > 0 && v1 >= vr) {
    return { valid: false, error: 'V1 MUST BE < VR' };
  }
  if (vr > 0 && v2 > 0 && vr >= v2) {
    return { valid: false, error: 'VR MUST BE < V2' };
  }
  return { valid: true };
}

export function isValidRunway(rwy: string): ValidationResult {
  if (!rwy || rwy.length < 2) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  const match = rwy.match(/^(\d{1,2})([LCR])?$/);
  if (!match) {
    return { valid: false, error: 'INVALID ENTRY' };
  }
  const rwyNum = parseInt(match[1], 10);
  if (rwyNum < 1 || rwyNum > 36) {
    return { valid: false, error: 'OUT OF RANGE' };
  }
  return { valid: true };
}

export function isValidWind(wind: string): ValidationResult {
  if (!wind || !wind.includes('/')) {
    return { valid: false, error: 'INVALID FORMAT' };
  }
  const [dir, spd] = wind.split('/');
  const dirNum = parseInt(dir);
  const spdNum = parseInt(spd);
  if (isNaN(dirNum) || dirNum < 0 || dirNum > 360) {
    return { valid: false, error: 'INVALID WIND' };
  }
  if (isNaN(spdNum) || spdNum < 0 || spdNum > 200) {
    return { valid: false, error: 'INVALID WIND' };
  }
  return { valid: true };
}

export function isValidFrequency(freq: string): ValidationResult {
  const num = parseFloat(freq);
  if (isNaN(num) || num < 108.0 || num > 117.95) {
    return { valid: false, error: 'OUT OF RANGE' };
  }
  return { valid: true };
}

export function isValidADF(freq: string): ValidationResult {
  const num = parseInt(freq);
  if (isNaN(num) || num < 190 || num > 1750) {
    return { valid: false, error: 'OUT OF RANGE' };
  }
  return { valid: true };
}
