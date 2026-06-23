import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizableSplitPaneProps {
  children: ReactNode[];
  minWidth?: number;
}

export default function ResizableSplitPane({ children, minWidth = 250 }: ResizableSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);

  useEffect(() => {
    // Initialize widths equally on first mount or when children count changes
    if (children.length > 0 && containerRef.current) {
      const totalWidth = containerRef.current.clientWidth;
      const initialWidth = 100 / children.length; // Percentage based
      setWidths(new Array(children.length).fill(initialWidth));
    }
  }, [children.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === null || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const dragIndex = isDragging; // The handle index is the left column index
      const nextIndex = dragIndex + 1;

      // Calculate the total percentage these two columns occupy
      const totalPct = widths[dragIndex] + widths[nextIndex];
      
      // Calculate mouse position relative to container
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      
      // Calculate the start of the dragged column
      let prevColumnsWidthPct = 0;
      for(let i = 0; i < dragIndex; i++) {
        prevColumnsWidthPct += widths[i];
      }
      
      const newDragIndexWidthPct = ((mouseX - (containerWidth * prevColumnsWidthPct / 100)) / containerWidth) * 100;
      const newNextIndexWidthPct = totalPct - newDragIndexWidthPct;

      // Enforce min widths
      const minPct = (minWidth / containerWidth) * 100;
      if (newDragIndexWidthPct >= minPct && newNextIndexWidthPct >= minPct) {
        const newWidths = [...widths];
        newWidths[dragIndex] = newDragIndexWidthPct;
        newWidths[nextIndex] = newNextIndexWidthPct;
        setWidths(newWidths);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Disable text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, widths, minWidth]);

  if (widths.length === 0) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          <div style={{ width: `${widths[index]}%`, height: '100%' }}>
            {child}
          </div>
          {index < children.length - 1 && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(index);
              }}
              style={{
                width: 16, // Grab area
                margin: '0 -8px',
                zIndex: 10,
                cursor: 'col-resize',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: 4,
                  height: '100%',
                  background: isDragging === index ? 'var(--color-accent-violet)' : 'transparent',
                  borderRadius: 2,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (isDragging === null) e.currentTarget.style.background = 'var(--color-border-active)';
                }}
                onMouseLeave={(e) => {
                  if (isDragging === null) e.currentTarget.style.background = 'transparent';
                }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
