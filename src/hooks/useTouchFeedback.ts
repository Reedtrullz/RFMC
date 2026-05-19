import { useCallback, useRef, useEffect } from 'react';

interface TouchFeedbackOptions {
  minPressDuration?: number;
  onPress?: () => void;
}

export function useTouchFeedback({ minPressDuration = 80, onPress }: TouchFeedbackOptions = {}) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPressed = useRef(false);

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    };
  }, []);

  const handleTouchStart = useCallback(() => {
    isPressed.current = true;
    pressTimer.current = setTimeout(() => {
      if (isPressed.current && onPress) {
        onPress();
      }
    }, minPressDuration);
  }, [minPressDuration, onPress]);

  const handleTouchEnd = useCallback(() => {
    isPressed.current = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
    isPressed.current = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
