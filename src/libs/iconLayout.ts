import type { Position } from '@/models';

export const TASKBAR_HEIGHT = 38;

export const ICON_LAYOUT = {
  ICON_WIDTH: 96,
  ICON_HEIGHT: 96,
  ICON_GAP: 24,
  PADDING: 16,
  TASKBAR_HEIGHT,
  DEFAULT_VIEWPORT_HEIGHT: 1080,
} as const;

/**
 * Calculate initial grid positions for desktop icons.
 *
 * Icons are laid out in a vertical-first grid: fills one column top to bottom,
 * then wraps to the next column when the available height runs out.
 *
 * @param appIds - Array of app identifier strings to position
 * @param viewportHeight - Browser viewport height in pixels (defaults to 1080)
 * @returns Record mapping each app id to its {x, y} position
 */
export function calculateInitialIconPositions(
  appIds: readonly string[],
  viewportHeight: number = ICON_LAYOUT.DEFAULT_VIEWPORT_HEIGHT,
): Record<string, Position> {
  const { ICON_WIDTH, ICON_HEIGHT, ICON_GAP, PADDING, TASKBAR_HEIGHT } =
    ICON_LAYOUT;

  const containerHeight = viewportHeight - PADDING * 2 - TASKBAR_HEIGHT;
  const iconsPerColumn = Math.max(
    1,
    Math.floor((containerHeight + ICON_GAP) / (ICON_HEIGHT + ICON_GAP)),
  );

  const positions: Record<string, Position> = {};

  appIds.forEach((id, index) => {
    const col = Math.floor(index / iconsPerColumn);
    const row = index % iconsPerColumn;

    positions[id] = {
      x: PADDING + col * (ICON_WIDTH + ICON_GAP),
      y: PADDING + row * (ICON_HEIGHT + ICON_GAP),
    };
  });

  return positions;
}
