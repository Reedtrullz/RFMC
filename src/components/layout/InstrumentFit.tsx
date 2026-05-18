import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { instrumentDimensions, type InstrumentTarget } from './instrumentDimensions';

interface InstrumentFitProps {
  children: ReactNode;
  target: InstrumentTarget;
  preferredScale?: number;
  allowOverflowZoom?: boolean;
  className?: string;
  overlay?: ReactNode;
  dataTestId?: string;
}

interface Size {
  width: number;
  height: number;
}

const DEFAULT_SIZE: Size = { width: 1, height: 1 };

export function InstrumentFit({
  children,
  target,
  preferredScale = 2,
  allowOverflowZoom = false,
  className = '',
  overlay,
  dataTestId,
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

  const aspectRatio = slotSize.width / slotSize.height;
  const isTall = slotSize.height > 1 ? aspectRatio < 1.35 : false;

  const scale = useMemo(() => {
    const widthScale = slotSize.width / contentSize.width;
    const heightScale = slotSize.height / contentSize.height;
    const fitScale = Math.min(widthScale, heightScale);

    return allowOverflowZoom ? preferredScale : Math.min(preferredScale, fitScale);
  }, [allowOverflowZoom, contentSize.height, contentSize.width, preferredScale, slotSize.height, slotSize.width]);

  const dynamicStyles = useMemo(() => {
    return {
      '--bezel-padding': isTall ? '8px' : '24px',
      '--side-margin': isTall ? '4px' : '32px',
      '--instrument-aspect-ratio': aspectRatio.toFixed(3),
    } as React.CSSProperties;
  }, [isTall, aspectRatio]);

  return (
    <div
      ref={slotRef}
      className={`cockpit-instrument ${allowOverflowZoom ? 'cockpit-instrument--scrollable' : ''} ${className}`}
      data-testid={dataTestId}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        ...dynamicStyles,
      }}
    >
      <div
        className="instrument-fit-viewport"
        style={{
          width: contentSize.width * scale,
          height: contentSize.height * scale,
          boxSizing: 'border-box',
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
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
      {overlay}
    </div>
  );
}
