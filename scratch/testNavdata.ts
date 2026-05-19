import { expandRoute } from '../shared/src/navdata/routeExpansion';
import { NAV_FIXES, PROCEDURES } from '../shared/src/navdata/navdataStore';

function testExpansion() {
  console.log('--- Testing Boeing Route Expansion (KJFK-KDCA) ---');
  const boeingLegs = expandRoute('KJFK', 'KDCA', 'BETTE3', 'IRONS7', 'ILS19');

  console.log(`Total legs: ${boeingLegs.length}`);
  boeingLegs.forEach((leg, i) => {
    console.log(
      `${i + 1}: ${leg.ident.padEnd(8)} ${leg.type.padEnd(5)} | Alt: ${JSON.stringify(leg.altitudeConstraint) || 'none'}`,
    );
  });

  console.log('\n--- Testing Airbus Route Expansion (ENGM-ENBR) ---');
  const airbusLegs = expandRoute('ENGM', 'ENBR', 'LUNIP1A', 'LOGUT1B', undefined, ['PESOT']);

  console.log(`Total legs: ${airbusLegs.length}`);
  airbusLegs.forEach((leg, i) => {
    console.log(
      `${i + 1}: ${leg.ident.padEnd(8)} ${leg.type.padEnd(5)} | Alt: ${JSON.stringify(leg.altitudeConstraint) || 'none'}`,
    );
  });
}

// Mocking some things if needed, but the logic is pure JS
testExpansion();
