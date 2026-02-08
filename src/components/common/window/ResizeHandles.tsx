'use client';

import React, { memo } from 'react';
import { RESIZE_DIRECTIONS } from './constants';

interface ResizeHandlesProps {
  windowId: string;
  onResizeMouseDown: (e: React.MouseEvent, direction: string) => void;
}

export const ResizeHandles = memo(
  ({ windowId, onResizeMouseDown }: ResizeHandlesProps) => {
    return (
      <>
        {RESIZE_DIRECTIONS.map(({ direction, className }) => (
          <div
            key={direction}
            data-testid={`resize-handle-${direction}-${windowId}`}
            className={`absolute ${className}`}
            onMouseDown={(e) => onResizeMouseDown(e, direction)}
          />
        ))}
      </>
    );
  },
);
ResizeHandles.displayName = 'ResizeHandles';
