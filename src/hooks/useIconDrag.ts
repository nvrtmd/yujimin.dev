import { useState, useCallback, useEffect, useRef } from 'react';
import type { AppId, Position } from '@/models';
import { APP_LIST } from '@/libs/contentProvider';
import { calculateInitialIconPositions } from '@/libs/iconLayout';

const DRAG_THRESHOLD = 3;
const BOUNDARY_OFFSET_WIDTH = 100;
const BOUNDARY_OFFSET_HEIGHT = 120;

export const useIconDrag = (isMobile: boolean) => {
  const isInitialized = useRef(false);

  const [iconPositions, setIconPositions] = useState<Record<string, Position>>(
    () => calculateInitialIconPositions(APP_LIST.map((app) => app.id)),
  );

  const [isRenderReady, setIsRenderReady] = useState(false);

  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    iconId: AppId | null;
    mouseStartPos: Position;
    iconStartPos: Position;
  }>({
    isDragging: false,
    iconId: null,
    mouseStartPos: { x: 0, y: 0 },
    iconStartPos: { x: 0, y: 0 },
  });

  const [isDragged, setIsDragged] = useState(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Recalculate with actual viewport height
    const actualPositions = calculateInitialIconPositions(
      APP_LIST.map((app) => app.id),
      window.innerHeight,
    );
    setIconPositions(actualPositions);

    // Mark as ready for fade-in after browser paints
    requestAnimationFrame(() => {
      setIsRenderReady(true);
    });
  }, []);

  const handleIconMouseDown = useCallback(
    (e: React.MouseEvent, iconId: AppId) => {
      if (isMobile) return;

      e.stopPropagation();
      e.preventDefault();

      const currentPos = iconPositions[iconId] || { x: 0, y: 0 };

      setIsDragged(false);
      setDragState({
        isDragging: true,
        iconId,
        mouseStartPos: { x: e.clientX, y: e.clientY },
        iconStartPos: currentPos,
      });
    },
    [iconPositions, isMobile],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.iconId) return;

      const deltaX = e.clientX - dragState.mouseStartPos.x;
      const deltaY = e.clientY - dragState.mouseStartPos.y;

      if (
        Math.abs(deltaX) > DRAG_THRESHOLD ||
        Math.abs(deltaY) > DRAG_THRESHOLD
      ) {
        setIsDragged(true);

        const newX = dragState.iconStartPos.x + deltaX;
        const newY = dragState.iconStartPos.y + deltaY;

        const constrainedX = Math.max(
          0,
          Math.min(newX, window.innerWidth - BOUNDARY_OFFSET_WIDTH),
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, window.innerHeight - BOUNDARY_OFFSET_HEIGHT),
        );

        setIconPositions((prev) => ({
          ...prev,
          [dragState.iconId!]: { x: constrainedX, y: constrainedY },
        }));
      }
    },
    [dragState],
  );

  const handleMouseUp = useCallback(() => {
    setDragState((prev) => ({ ...prev, isDragging: false, iconId: null }));
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    iconPositions,
    handleIconMouseDown,
    isDragged,
    isRenderReady,
  };
};
