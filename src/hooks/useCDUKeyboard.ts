import { useEffect } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { useCockpitLayoutStore } from '../store/cockpitLayoutStore';
import type { CDUKey } from '@shared';

/**
 * Captures physical keyboard events and routes them to the FMC pressKey action.
 */
export function useCDUKeyboard() {
  const pressKey = useFMCStore((s) => s.pressKey);
  const pressLSK = useFMCStore((s) => s.pressLSK);
  const toggleKeyboardHelp = useCockpitLayoutStore((s) => s.toggleKeyboardHelp);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      // Prevent browser shortcuts
      if (
        [
          'Backspace',
          'Delete',
          'Enter',
          '/',
          ' ',
          '+',
          '-',
          'F1',
          'F2',
          'F3',
          'F4',
          'F5',
          'F6',
          'F7',
          'F8',
          'F9',
          'F10',
          'F11',
          'F12',
        ].includes(e.key)
      ) {
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
        pressKey(key as CDUKey);
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

        // LSK Mapping: F1-F6 left side, Shift+F1-F6 or F7-F12 right side.
        case 'F1':
        case 'F2':
        case 'F3':
        case 'F4':
        case 'F5':
        case 'F6':
          e.preventDefault();
          pressLSK(e.shiftKey ? 'R' : 'L', parseInt(e.key.substring(1), 10));
          break;
        case 'F7':
        case 'F8':
        case 'F9':
        case 'F10':
        case 'F11':
        case 'F12':
          e.preventDefault();
          pressLSK('R', parseInt(e.key.substring(1), 10) - 6);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressKey, pressLSK, toggleKeyboardHelp]);
}
