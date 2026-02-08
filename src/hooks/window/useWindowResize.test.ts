import {
  renderHook,
  act,
  createMockCsrWindow,
} from '@/__tests__/utils/test-utils';
import {
  useWindowResize,
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
} from './useWindowResize';
import type { WindowState } from '@/models';

function simulateResize(
  direction: string,
  deltaX: number,
  deltaY: number,
  initialWindow = createMockCsrWindow(),
) {
  const windowList = [initialWindow];
  const mockSetWindowList = vi.fn((callback) => {
    if (typeof callback === 'function') callback(windowList);
  });
  const mockBringToFront = vi.fn();

  const { result } = renderHook(() =>
    useWindowResize(mockSetWindowList, mockBringToFront),
  );

  act(() => {
    result.current.handleResizeMouseDown(
      {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent,
      initialWindow,
      direction,
    );
  });

  act(() => {
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 150 + deltaX,
        clientY: 150 + deltaY,
      }),
    );
  });

  act(() => {
    vi.runOnlyPendingTimers();
  });

  const updateCallback = mockSetWindowList.mock.calls[0]?.[0];
  const updatedWindow = updateCallback?.(windowList)?.[0];

  return { updatedWindow, mockBringToFront, mockSetWindowList };
}

describe('useWindowResize', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('[init] should register event listeners and call bringToFront on mousedown', () => {
    // Arrange
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const mockSetWindowList = vi.fn();
    const mockBringToFront = vi.fn();
    const mockWindow = createMockCsrWindow();
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 150,
      clientY: 150,
    } as unknown as React.MouseEvent;

    const { result } = renderHook(() =>
      useWindowResize(mockSetWindowList, mockBringToFront),
    );

    // Act
    act(() => {
      result.current.handleResizeMouseDown(mockEvent, mockWindow, 'e');
    });

    // Assert
    expect(mockBringToFront).toHaveBeenCalledTimes(1);
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
  });

  it.each([
    ['e', 50, 0, 450, 300, 100, 100, 'east: width only'],
    ['n', 0, -50, 400, 350, 100, 50, 'north: height + y adjustment'],
    ['se', 50, 50, 450, 350, 100, 100, 'southeast: diagonal'],
    [
      'nw',
      -50,
      -50,
      450,
      350,
      50,
      50,
      'northwest: diagonal + position adjustment',
    ],
  ])(
    '[resize] direction "%s" with delta (%d, %d): %s',
    (
      direction,
      deltaX,
      deltaY,
      expectedWidth,
      expectedHeight,
      expectedX,
      expectedY,
    ) => {
      // Arrange & Act
      const { updatedWindow } = simulateResize(direction, deltaX, deltaY);

      // Assert
      expect(updatedWindow.size).toEqual({
        width: expectedWidth,
        height: expectedHeight,
      });
      expect(updatedWindow.position).toEqual({
        x: expectedX,
        y: expectedY,
      });
    },
  );

  it('[clamp] should enforce minimum dimensions with position adjustment', () => {
    // Arrange & Act - Width clamping (east)
    const eastResult = simulateResize('e', -500, 0);

    // Assert
    expect(eastResult.updatedWindow.size.width).toBe(WINDOW_MIN_WIDTH);

    // Arrange & Act - Height clamping (south)
    const southResult = simulateResize('s', 0, -500);

    // Assert
    expect(southResult.updatedWindow.size.height).toBe(WINDOW_MIN_HEIGHT);

    // Arrange - West direction with position adjustment
    const westWindow = createMockCsrWindow({
      size: { width: 400, height: 300 },
    });

    // Act
    const westResult = simulateResize('w', 500, 0, westWindow);

    // Assert
    expect(westResult.updatedWindow.size.width).toBe(WINDOW_MIN_WIDTH);
    expect(westResult.updatedWindow.position.x).toBe(
      100 + (400 - WINDOW_MIN_WIDTH),
    );

    // Arrange - North direction with position adjustment
    const northWindow = createMockCsrWindow({
      size: { width: 400, height: 300 },
    });

    // Act
    const northResult = simulateResize('n', 0, 500, northWindow);

    // Assert
    expect(northResult.updatedWindow.size.height).toBe(WINDOW_MIN_HEIGHT);
    expect(northResult.updatedWindow.position.y).toBe(
      100 + (300 - WINDOW_MIN_HEIGHT),
    );
  });

  it('[cleanup] should remove event listeners on mouseup', () => {
    // Arrange
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    simulateResize('e', 50, 0);

    // Act
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    // Assert
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });

  it('[immutability] should only update target window and preserve original object', () => {
    // Arrange
    const targetWindow = createMockCsrWindow({
      id: 'about',
      size: { width: 400, height: 300 },
    });
    const otherWindow = createMockCsrWindow({
      id: 'blog',
      size: { width: 400, height: 300 },
    });
    const windowList = [targetWindow, otherWindow];
    const originalTargetSize = { ...targetWindow.size };
    const mockSetWindowList = vi.fn((cb) => cb(windowList));

    const { result } = renderHook(() =>
      useWindowResize(mockSetWindowList, vi.fn()),
    );

    // Act
    act(() => {
      result.current.handleResizeMouseDown(
        {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          clientX: 150,
          clientY: 150,
        } as unknown as React.MouseEvent,
        targetWindow,
        'e',
      );
    });

    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 150 }),
      );
      vi.runOnlyPendingTimers();
    });

    const updatedList = mockSetWindowList.mock.calls[0][0](windowList);

    // Assert - Target window updated
    expect(
      updatedList.find((w: WindowState) => w.id === 'about')?.size.width,
    ).toBe(450);

    // Assert - Other window unchanged
    expect(
      updatedList.find((w: WindowState) => w.id === 'blog')?.size.width,
    ).toBe(400);

    // Assert - Original object unchanged (immutability)
    expect(targetWindow.size).toEqual(originalTargetSize);
  });
});
