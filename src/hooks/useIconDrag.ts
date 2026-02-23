import {
  useState,
  useCallback,
  useEffect,
  useEffectEvent,
  useSyncExternalStore,
} from 'react';
import type { AppId, Position } from '@/models';
import { APP_LIST } from '@/libs/contentProvider';
import { calculateInitialIconPositions } from '@/libs/iconLayout';

const DRAG_THRESHOLD = 3;
const BOUNDARY_OFFSET_WIDTH = 100;
const BOUNDARY_OFFSET_HEIGHT = 120;

function getAppIds() {
  return APP_LIST.map((app) => app.id);
}

function subscribeToResize(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getViewportHeight() {
  return window.innerHeight;
}

export const useIconDrag = (isMobile: boolean) => {
  const viewportHeight = useSyncExternalStore(
    subscribeToResize,
    getViewportHeight,
    () => undefined,
  );

  const [iconPositions, setIconPositions] = useState<Record<string, Position>>(
    () => calculateInitialIconPositions(getAppIds()),
  );

  const [isRenderReady, setIsRenderReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Recalculate positions once with actual viewport height on first client render
  if (!isInitialized && viewportHeight !== undefined) {
    setIsInitialized(true);
    const actualPositions = calculateInitialIconPositions(
      getAppIds(),
      viewportHeight,
    );
    setIconPositions(actualPositions);
  }

  useEffect(() => {
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

  const handleMouseMove = useEffectEvent((e: MouseEvent) => {
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
  });

  const handleMouseUp = useEffectEvent(() => {
    setDragState((prev) => ({ ...prev, isDragging: false, iconId: null }));
  });

  useEffect(() => {
    if (!dragState.isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging]);

  return {
    iconPositions,
    handleIconMouseDown,
    isDragged,
    isRenderReady,
  };
};
