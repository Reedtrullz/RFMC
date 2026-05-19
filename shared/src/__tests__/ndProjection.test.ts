import { describe, it, expect } from 'vitest';
import { projectGeoPointToND, NDProjectionContext } from '../fmc/ndProjection';

describe('ndProjection', () => {
  const aircraft = { lat: 52, lon: 4 };
  const baseContext: NDProjectionContext = {
    style: 'boeing',
    mode: 'MAP',
    rangeNm: 40,
    heading: 0,
    isCentered: false,
    aircraftPosition: aircraft,
  };

  it('projectGeoPointToND returns center for target equal to reference', () => {
    const centered = projectGeoPointToND(aircraft, { ...baseContext, isCentered: true });
    const expanded = projectGeoPointToND(aircraft, { ...baseContext, isCentered: false });

    expect(centered!.x).toBe(50);
    expect(centered!.y).toBe(50);
    expect(expanded!.x).toBe(50);
    expect(expanded!.y).toBe(84);
  });

  it('projectGeoPointToND clips targets beyond selected range', () => {
    const target = { lat: 53, lon: 4 }; // 60nm North
    const result = projectGeoPointToND(target, baseContext);
    expect(result!.visible).toBe(false);
    expect(result!.clipped).toBe(true);
  });

  it('projectGeoPointToND keeps targets visible within selected range', () => {
    const target = { lat: 52.5, lon: 4 }; // 30nm North
    const result = projectGeoPointToND(target, baseContext);
    expect(result!.visible).toBe(true);
    expect(result!.clipped).toBe(false);
  });

  it('projectGeoPointToND changes scale when range changes', () => {
    const target = { lat: 52.5, lon: 4 }; // 30nm North
    const result40 = projectGeoPointToND(target, { ...baseContext, rangeNm: 40 });
    const result80 = projectGeoPointToND(target, { ...baseContext, rangeNm: 80 });

    // y should be higher up the screen (smaller value) for 40nm range than 80nm range
    expect(result40!.y).toBeLessThan(result80!.y);
  });

  it('projectGeoPointToND rotates with heading in MAP/ARC', () => {
    const target = { lat: 52.5, lon: 4 }; // 30nm North

    // Heading 0: North is UP (y decreases)
    const resultHdg0 = projectGeoPointToND(target, { ...baseContext, heading: 0 });
    expect(resultHdg0!.x).toBe(50);
    expect(resultHdg0!.y).toBeLessThan(84);

    // Heading 90: North is LEFT (x decreases, y stays at center)
    const resultHdg90 = projectGeoPointToND(target, { ...baseContext, heading: 90 });
    expect(resultHdg90!.x).toBeLessThan(50);
    expect(resultHdg90!.y).toBeCloseTo(84, 0);
  });

  it('projectGeoPointToND is north-up in PLAN/PLN', () => {
    const target = { lat: 52.5, lon: 4 }; // North
    const result = projectGeoPointToND(target, {
      ...baseContext,
      mode: 'PLAN',
      heading: 90, // Should ignore heading
      isCentered: true,
      planCenter: aircraft,
    });

    // North should always be UP (y decreases, x centered)
    expect(result!.x).toBeCloseTo(50, 0);
    expect(result!.y).toBeLessThan(50);
  });

  it('centered display uses smaller radius than ARC/MAP', () => {
    const target = { lat: 52.5, lon: 4 }; // 30nm North
    const centered = projectGeoPointToND(target, { ...baseContext, isCentered: true });
    const expanded = projectGeoPointToND(target, { ...baseContext, isCentered: false });

    // Distance from center
    const distCentered = 50 - centered!.y;
    const distExpanded = 84 - expanded!.y;

    // Expanded should use a larger visual radius
    expect(distCentered).toBeLessThan(distExpanded);
  });
});
