import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { instrumentDimensions, type InstrumentTarget } from './instrumentDimensions';

interface InstrumentFitProps {
  children: ReactNode;
  target: InstrumentTarget;
  preferredScale?: number;
  className?: string;
}

interface Size {
  width: number;
  height: number;
}

const DEFAULT_SIZE: Size = { width: 1, height: 1 };

export function InstrumentFit({
  children,
  target,
  preferredScale = 1,
  className = '',
}: InstrumentFitProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dimensions = instrumentDimensions[target];
  const useFixedHeight = target !== 'boeingCdu' && target !== 'airbusMcdu';
  const [slotSize, setSlotSize] = useState<Size>(DEFAULT_SIZE);
  const [contentSize, setContentSize] = useState<Size>({
    width: dimensions.idealWidth,
    height: dimensions.idealHeight,
  });

  useLayoutEffect(() => {
    const updateSizes = () => {
      const slot = slotRef.current;
      const content = contentRef.current;

      if (slot) {
        const rect = slot.getBoundingClientRect();
        setSlotSize({
          width: Math.max(rect.width, 1),
          height: Math.max(rect.height, 1),
        });
      }

      if (content) {
        setContentSize({
          width: Math.max(
            content.offsetWidth || dimensions.idealWidth,
            content.scrollWidth || dimensions.idealWidth,
            dimensions.idealWidth,
          ),
          height: Math.max(
            content.offsetHeight || dimensions.idealHeight,
            content.scrollHeight || dimensions.idealHeight,
            dimensions.idealHeight,
          ),
        });
      }
    };

    updateSizes();

    const observer = new ResizeObserver(updateSizes);
    if (slotRef.current) observer.observe(slotRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [dimensions.idealHeight, dimensions.idealWidth]);

  const scale = useMemo(() => {
    const widthScale = slotSize.width / contentSize.width;
    const heightScale = slotSize.height / contentSize.height;

    return Math.min(preferredScale, widthScale, heightScale);
  }, [contentSize.height, contentSize.width, preferredScale, slotSize.height, slotSize.width]);

  return (
    <div ref={slotRef} className={`cockpit-instrument ${className}`}>
      <div
        className="instrument-fit-viewport"
        style={{
          width: contentSize.width * scale,
          height: contentSize.height * scale,
        }}
      >
        <div
          ref={contentRef}
          className="instrument-fit-content"
          style={{
            width: dimensions.idealWidth,
            height: useFixedHeight ? dimensions.idealHeight : undefined,
            minHeight: dimensions.idealHeight,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
