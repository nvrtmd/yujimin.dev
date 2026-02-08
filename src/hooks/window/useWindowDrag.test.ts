import {
  renderHook,
  act,
  createMockCsrWindow,
} from '@/__tests__/utils/test-utils';
import { useWindowDrag } from './useWindowDrag';
import type { WindowState } from '@/models';

// =============================================================================
// Test Helper
// =============================================================================

function simulateDrag(
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
    useWindowDrag({
      setWindowList: mockSetWindowList,
      bringToFront: mockBringToFront,
    }),
  );

  act(() => {
    result.current.handleWindowDragMouseDown(
      { clientX: 150, clientY: 150 } as React.MouseEvent,
      initialWindow,
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

  return { updatedWindow, mockBringToFront, mockSetWindowList, result };
}

// =============================================================================
// Tests
// =============================================================================

describe('useWindowDrag', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('[init] should register event listeners and call bringToFront on drag start', () => {
    // Arrange
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    // Act
    const { mockBringToFront } = simulateDrag(0, 0);

    // Assert
    expect(mockBringToFront).toHaveBeenCalledTimes(1);
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
    [50, 50, 150, 150, 'positive delta (diagonal)'],
    [-50, -50, 50, 50, 'negative delta (diagonal)'],
    [0, 0, 100, 100, 'zero delta'],
  ])(
    '[drag] should calculate position correctly - delta (%d, %d) results in (%d, %d): %s',
    (deltaX, deltaY, expectedX, expectedY) => {
      // Arrange & Act
      const { updatedWindow } = simulateDrag(deltaX, deltaY);

      // Assert
      expect(updatedWindow.position).toEqual({
        x: expectedX,
        y: expectedY,
      });
    },
  );

  it('[cleanup] should remove event listeners on mouseup', () => {
    // Arrange
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    simulateDrag(50, 0);

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

  it('[cleanup] should reset drag state and ignore mousemove after mouseup', () => {
    // Arrange
    const mockWindow = createMockCsrWindow({ position: { x: 100, y: 100 } });
    const windowList = [mockWindow];
    const mockSetWindowList = vi.fn((callback) => {
      if (typeof callback === 'function') callback(windowList);
    });
    const mockBringToFront = vi.fn();

    const { result } = renderHook(() =>
      useWindowDrag({
        setWindowList: mockSetWindowList,
        bringToFront: mockBringToFront,
      }),
    );

    act(() => {
      result.current.handleWindowDragMouseDown(
        { clientX: 150, clientY: 150 } as React.MouseEvent,
        mockWindow,
      );
    });

    // Act
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 300, clientY: 300 }),
      );
      vi.runOnlyPendingTimers();
    });

    // Assert
    expect(mockSetWindowList).not.toHaveBeenCalled();
  });

  it('[throttle] should cancel previous RAF on rapid mouse moves', () => {
    // Arrange
    const cancelRAFSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const initialWindow = createMockCsrWindow({ position: { x: 100, y: 100 } });
    const windowList = [initialWindow];
    const mockSetWindowList = vi.fn((callback) => {
      if (typeof callback === 'function') callback(windowList);
    });
    const mockBringToFront = vi.fn();

    const { result } = renderHook(() =>
      useWindowDrag({
        setWindowList: mockSetWindowList,
        bringToFront: mockBringToFront,
      }),
    );

    act(() => {
      result.current.handleWindowDragMouseDown(
        { clientX: 150, clientY: 150 } as React.MouseEvent,
        initialWindow,
      );
    });

    // Act
    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 150 }),
      );
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 250, clientY: 150 }),
      );
    });

    // Assert
    expect(cancelRAFSpy).toHaveBeenCalled();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(mockSetWindowList).toHaveBeenCalled();
    const updateCallback = mockSetWindowList.mock.calls[0][0];
    const updatedWindow = updateCallback(windowList)[0];
    expect(updatedWindow.position).toEqual({ x: 200, y: 100 });

    cancelRAFSpy.mockRestore();
  });

  it('[isolation] should only update target window in list', () => {
    // Arrange
    const targetWindow = createMockCsrWindow({
      id: 'about',
      position: { x: 100, y: 100 },
    });
    const otherWindow = createMockCsrWindow({
      id: 'blog',
      position: { x: 200, y: 200 },
    });
    const windowList = [targetWindow, otherWindow];

    const mockSetWindowList = vi.fn((cb) => cb(windowList));
    const { result } = renderHook(() =>
      useWindowDrag({
        setWindowList: mockSetWindowList,
        bringToFront: vi.fn(),
      }),
    );

    // Act
    act(() => {
      result.current.handleWindowDragMouseDown(
        { clientX: 150, clientY: 150 } as React.MouseEvent,
        targetWindow,
      );
    });

    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 200 }),
      );
      vi.runOnlyPendingTimers();
    });

    // Assert
    const updatedList = mockSetWindowList.mock.calls[0][0](windowList);
    expect(
      updatedList.find((w: WindowState) => w.id === 'blog')?.position,
    ).toEqual({ x: 200, y: 200 });
    expect(
      updatedList.find((w: WindowState) => w.id === 'about')?.position,
    ).toEqual({ x: 150, y: 150 });
  });

  it('[immutability] should not mutate original window object', () => {
    // Arrange
    const mockWindow = createMockCsrWindow({
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });
    const originalPosition = { ...mockWindow.position };
    const originalSize = { ...mockWindow.size };

    // Act
    simulateDrag(50, 50, mockWindow);

    // Assert
    expect(mockWindow.position).toEqual(originalPosition);
    expect(mockWindow.size).toEqual(originalSize);
  });

  it('[lifecycle] should clean up listeners and RAF when unmounted while dragging', () => {
    // Arrange
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const cancelRAFSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const { result, unmount } = renderHook(() =>
      useWindowDrag({
        setWindowList: vi.fn(),
        bringToFront: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleWindowDragMouseDown(
        { clientX: 100, clientY: 100 } as React.MouseEvent,
        createMockCsrWindow(),
      );
    });

    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 110, clientY: 110 }),
      );
    });

    // Act
    unmount();

    // Assert
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );
    expect(cancelRAFSpy).toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
    cancelRAFSpy.mockRestore();
  });
});
