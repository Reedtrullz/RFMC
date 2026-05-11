import { describe, it, expect } from 'vitest';
import {
  isValidICAO,
  isValidAltitude,
  isValidSpeed,
  isValidTemperature,
  isValidWind,
  isValidVSpeeds,
} from '../fmc/validation';

describe('Input Validation', () => {
  describe('isValidICAO', () => {
    it('accepts valid 4-letter ICAO codes', () => {
      expect(isValidICAO('KJFK').valid).toBe(true);
      expect(isValidICAO('EGLL').valid).toBe(true);
      expect(isValidICAO('LFPG').valid).toBe(true);
    });

    it('rejects invalid ICAO codes', () => {
      expect(isValidICAO('JFK').valid).toBe(false);
      expect(isValidICAO('KJFK1').valid).toBe(false);
      expect(isValidICAO('kjfk').valid).toBe(false);
      expect(isValidICAO('').valid).toBe(false);
    });
  });

  describe('isValidAltitude', () => {
    it('accepts valid altitudes', () => {
      expect(isValidAltitude('350').valid).toBe(true);
      expect(isValidAltitude('410').valid).toBe(true);
    });

    it('rejects invalid altitudes', () => {
      expect(isValidAltitude('-10').valid).toBe(false);
      expect(isValidAltitude('501').valid).toBe(false);
      expect(isValidAltitude('abc').valid).toBe(false);
    });
  });

  describe('isValidSpeed', () => {
    it('accepts valid speeds', () => {
      expect(isValidSpeed('250').valid).toBe(true);
      expect(isValidSpeed('120').valid).toBe(true);
    });

    it('rejects invalid speeds', () => {
      expect(isValidSpeed('10').valid).toBe(false);
      expect(isValidSpeed('501').valid).toBe(false);
    });
  });

  describe('isValidTemperature', () => {
    it('accepts valid temperatures', () => {
      expect(isValidTemperature('15').valid).toBe(true);
      expect(isValidTemperature('-10').valid).toBe(true);
    });

    it('rejects invalid temperatures', () => {
      expect(isValidTemperature('100').valid).toBe(false);
      expect(isValidTemperature('-100').valid).toBe(false);
    });
  });

  describe('isValidWind', () => {
    it('accepts valid wind entries', () => {
      expect(isValidWind('270/50').valid).toBe(true);
      expect(isValidWind('360/10').valid).toBe(true);
    });

    it('rejects invalid wind entries', () => {
      expect(isValidWind('400/50').valid).toBe(false);
      expect(isValidWind('270/201').valid).toBe(false);
      expect(isValidWind('invalid').valid).toBe(false);
    });
  });

  describe('isValidVSpeeds', () => {
    it('accepts valid V-speeds', () => {
      expect(isValidVSpeeds(135, 140, 145).valid).toBe(true);
    });

    it('rejects V1 > VR', () => {
      expect(isValidVSpeeds(150, 140, 145).valid).toBe(false);
    });

    it('rejects VR > V2', () => {
      expect(isValidVSpeeds(130, 150, 145).valid).toBe(false);
    });
  });
});
