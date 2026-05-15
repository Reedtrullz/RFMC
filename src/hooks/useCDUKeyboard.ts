import { useEffect } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { useAircraftStore } from '../store/aircraftStore';
import { useCockpitLayoutStore } from '../store/cockpitLayoutStore';

/**
 * Captures physical keyboard events and routes them to the FMC pressKey action.
 */
export function useCDUKeyboard() {
  const pressKey = useFMCStore(s => s.pressKey);
  const pressLSK = useFMCStore(s => s.pressLSK);
  const aircraft = useAircraftStore(s => s.aircraft);
  const toggleKeyboardHelp = useCockpitLayoutStore(s => s.toggleKeyboardHelp);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      
      // Prevent browser shortcuts
      if (['Backspace', 'Delete', 'Enter', '/', ' ', '+', '-', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6'].includes(e.key)) {
        e.preventDefault(); 
      }

      // Help toggle (Shift + / = ?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        toggleKeyboardHelp();
        return;
      }

      // Alphanumeric
      if (/^[A-Z0-9]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
          pressKey('EXEC');
          break;
        case 'PageUp':
          pressKey('PREV_PAGE');
          break;
        case 'PageDown':
          pressKey('NEXT_PAGE');
          break;
        case 'ArrowUp':
          pressKey('PREV_PAGE');
          break;
        case 'ArrowDown':
          pressKey('NEXT_PAGE');
          break;
        

        // LSK Mapping (F1-F6)
        case 'F1': case 'F2': case 'F3': case 'F4': case 'F5': case 'F6':
          e.preventDefault();
          const index = parseInt(e.key.substring(1)) - 1;
          const side = e.shiftKey ? 'R' : 'L';
          pressLSK(side, index);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressKey, pressLSK, aircraft, toggleKeyboardHelp]);
}
