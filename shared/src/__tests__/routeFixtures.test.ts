import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateRouteFixture, type SimBriefRouteFixture } from '../fmc/navdataSchema';
import { parseRouteString } from '../fmc/flightPlanParser';

describe('SimBrief route fixtures', () => {
  const fixtures = JSON.parse(
    readFileSync(resolve(process.cwd(), 'fixtures/simbrief/routes.json'), 'utf8'),
  ) as SimBriefRouteFixture[];

  it('keeps fixture metadata valid and uniquely identifiable', () => {
    const ids = new Set<string>();
    expect(fixtures.length).toBeGreaterThanOrEqual(20);
    for (const fixture of fixtures) {
      expect(validateRouteFixture(fixture), fixture.id).toEqual([]);
      expect(ids.has(fixture.id)).toBe(false);
      ids.add(fixture.id);
    }
  });

  it('keeps fixture routes parseable by the current trainer parser', () => {
    for (const fixture of fixtures) {
      const parsed = parseRouteString(fixture.route);
      expect(parsed.origin, fixture.id).toBe(fixture.origin);
      expect(parsed.destination, fixture.id).toBe(fixture.destination);
      expect(parsed.waypoints.length, fixture.id).toBeGreaterThan(0);
    }
  });
});
