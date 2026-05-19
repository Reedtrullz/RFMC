import { useState, useCallback, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useDraggable(initialPosition?: Position) {
  const [position, setPosition] = useState<Position>(initialPosition ?? { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const initialDragPosition = useRef<Position>({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only drag with left click
      if (e.button !== 0) return;

      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialDragPosition.current = { ...position };

      e.preventDefault();
    },
    [position],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStart.current = { x: touch.clientX, y: touch.clientY };
      initialDragPosition.current = { ...position };
    },
    [position],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      setPosition({
        x: initialDragPosition.current.x + dx,
        y: initialDragPosition.current.y + dy,
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;

      setPosition({
        x: initialDragPosition.current.x + dx,
        y: initialDragPosition.current.y + dy,
      });
    };

    const onEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    dragHandlers: {
      onMouseDown,
      onTouchStart,
    },
    resetPosition: () => setPosition(initialPosition ?? { x: 0, y: 0 }),
  };
}
