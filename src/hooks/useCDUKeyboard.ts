import { useEffect } from 'react';
import { useFMCStore } from '../store/useFMCStore';

/**
 * Captures physical keyboard events and routes them to the FMC pressKey action.
 */
export function useCDUKeyboard() {
  const pressKey = useFMCStore(s => s.pressKey);
  const aircraft = useFMCStore(s => s.aircraft);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      
      // Prevent browser shortcuts like backspace navigating away
      if (['Backspace', 'Delete', 'Enter', '/', ' ', '+', '-'].includes(e.key)) {
        // e.preventDefault(); // Might be too aggressive for all keys, but good for some
      }

      // Alphanumeric
      if (/^[A-Z0-9]$/.test(key)) {
        pressKey(key as any);
        return;
      }

      // Special keys mapping
      switch (e.key) {
        case 'Backspace':
          pressKey('CLR');
          break;
        case 'Delete':
          pressKey('DEL');
          break;
        case '.':
          pressKey('DOT');
          break;
        case '/':
          pressKey('SLASH');
          break;
        case '+':
        case '-':
          pressKey('PLUS_MINUS');
          break;
        case ' ':
          pressKey('SPACE');
          break;
        case 'Enter':
          if (aircraft === 'BOEING_737') {
            pressKey('EXEC');
          }
          break;
        case 'ArrowUp':
          pressKey('PREV_PAGE');
          break;
        case 'ArrowDown':
          pressKey('NEXT_PAGE');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressKey, aircraft]);
}
