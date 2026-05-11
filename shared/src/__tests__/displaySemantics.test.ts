import { describe, expect, it } from 'vitest';
import { getSemanticColor, withDisplaySemantic } from '../fmc/displaySemantics';

describe('display semantics', () => {
  it('maps Boeing semantics to 737 NG display colors', () => {
    expect(getSemanticColor('BOEING_737', 'title')).toBe('cyan');
    expect(getSemanticColor('BOEING_737', 'label')).toBe('white');
    expect(getSemanticColor('BOEING_737', 'activeData')).toBe('green');
    expect(getSemanticColor('BOEING_737', 'guidance')).toBe('magenta');
    expect(getSemanticColor('BOEING_737', 'warning')).toBe('amber');
  });

  it('maps Airbus semantics to MCDU display colors', () => {
    expect(getSemanticColor('AIRBUS_A320', 'title')).toBe('white');
    expect(getSemanticColor('AIRBUS_A320', 'inactiveData')).toBe('blue');
    expect(getSemanticColor('AIRBUS_A320', 'activeData')).toBe('green');
    expect(getSemanticColor('AIRBUS_A320', 'warning')).toBe('amber');
    expect(getSemanticColor('AIRBUS_A320', 'guidance')).toBe('magenta');
  });

  it('applies semantic color without overwriting explicit page colors', () => {
    expect(withDisplaySemantic('BOEING_737', 'title', { text: 'IDENT' })).toMatchObject({
      text: 'IDENT',
      semantic: 'title',
      color: 'cyan',
    });
    expect(withDisplaySemantic('BOEING_737', 'title', { text: 'IDENT', color: 'white' })).toMatchObject({
      text: 'IDENT',
      semantic: 'title',
      color: 'white',
    });
  });
});
