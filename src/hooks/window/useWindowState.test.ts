import { renderHook, act } from '@/__tests__/utils/test-utils';
import { useWindowState } from './useWindowState';
import type { App } from '@/models/app';

vi.mock('@/libs', () => ({
  getContent: vi.fn(() => null),
}));

const TASKBAR_HEIGHT = 38;

describe('useWindowState', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  const mockApp: App = {
    id: 'about',
    title: 'About',
    iconSrc: '/test.png',
    renderType: 'csr',
  };

  it('[init] should initialize with empty windowList and zIndex 0', () => {
    // Act
    const { result } = renderHook(() => useWindowState());

    // Assert
    expect(result.current.windowList).toEqual([]);
    expect(result.current.highestZIndex).toBe(0);
    expect(result.current.isMobile).toBe(false);
  });

  it('[open] should add new window with incremented zIndex', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const secondApp: App = { ...mockApp, id: 'guestbook' };

    // Act - Open first window
    act(() => {
      result.current.openWindow(mockApp);
    });

    // Assert
    expect(result.current.windowList).toHaveLength(1);
    expect(result.current.windowList[0].id).toBe('about');
    expect(result.current.windowList[0].zIndex).toBe(1);

    // Act - Open second window
    act(() => {
      result.current.openWindow(secondApp);
    });

    // Assert
    expect(result.current.windowList).toHaveLength(2);
    expect(result.current.windowList[1].zIndex).toBe(2);
  });

  it('[open] should assign cascading position for multiple windows', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const secondApp: App = { ...mockApp, id: 'guestbook' };

    // Act
    act(() => {
      result.current.openWindow(mockApp);
    });
    act(() => {
      result.current.openWindow(secondApp);
    });

    // Assert
    const [firstWindow, secondWindow] = result.current.windowList;
    expect(secondWindow.position.x).toBe(firstWindow.position.x + 20);
    expect(secondWindow.position.y).toBe(firstWindow.position.y + 20);
  });

  it('[open] should prevent duplicate and bring existing window to front', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const secondApp: App = { ...mockApp, id: 'guestbook' };

    act(() => {
      result.current.openWindow(mockApp);
    });
    act(() => {
      result.current.openWindow(secondApp);
    });

    const initialZIndex = result.current.windowList.find(
      (w) => w.id === mockApp.id,
    )!.zIndex;

    // Act - Try to open duplicate
    act(() => {
      result.current.openWindow(mockApp);
    });

    // Assert - No duplicate, brought to front
    expect(result.current.windowList).toHaveLength(2);
    const updatedWindow = result.current.windowList.find(
      (w) => w.id === mockApp.id,
    )!;
    expect(updatedWindow.zIndex).toBeGreaterThan(initialZIndex);
  });

  it('[open] should constrain window to screen boundaries', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());

    // Act - Oversized window
    act(() => {
      result.current.openWindow(mockApp, { width: 10000, height: 10000 });
    });

    // Assert
    const window1 = result.current.windowList[0];
    expect(window1.size.width).toBeLessThan(10000);
    expect(window1.size.height).toBeLessThan(10000);

    // Arrange
    const secondApp: App = { ...mockApp, id: 'guestbook' };

    // Act - Out of bounds position
    act(() => {
      result.current.openWindow(secondApp, undefined, { x: 10000, y: 10000 });
    });

    // Assert
    const window2 = result.current.windowList[1];
    expect(window2.position.x).toBeLessThan(10000);
    expect(window2.position.y).toBeLessThan(10000);
  });

  it('[close] should remove window from list', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const secondApp: App = { ...mockApp, id: 'guestbook' };

    act(() => {
      result.current.openWindow(mockApp);
      result.current.openWindow(secondApp);
    });

    // Act
    act(() => {
      result.current.closeWindow(mockApp);
    });

    // Assert
    expect(result.current.windowList).toHaveLength(1);
    expect(result.current.windowList[0].id).toBe('guestbook');
  });

  it('[minimize] should toggle isMinimized state while preserving other properties', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());

    act(() => {
      result.current.openWindow(mockApp);
    });
    const originalWindow = { ...result.current.windowList[0] };

    // Act
    act(() => {
      result.current.minimizeWindow(mockApp);
    });

    // Assert
    const minimizedWindow = result.current.windowList[0];
    expect(minimizedWindow.isMinimized).toBe(true);
    expect(minimizedWindow.position).toEqual(originalWindow.position);
    expect(minimizedWindow.size).toEqual(originalWindow.size);
  });

  it('[front] should increase zIndex and restore if minimized', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const secondApp: App = { ...mockApp, id: 'guestbook' };

    act(() => {
      result.current.openWindow(mockApp);
    });
    act(() => {
      result.current.openWindow(secondApp);
    });

    const initialZIndex = result.current.windowList.find(
      (w) => w.id === mockApp.id,
    )!.zIndex;

    // Act - Bring to front
    act(() => {
      result.current.bringToFront(mockApp);
    });

    // Assert - zIndex increased
    const updatedWindow = result.current.windowList.find(
      (w) => w.id === mockApp.id,
    )!;
    expect(updatedWindow.zIndex).toBeGreaterThan(initialZIndex);

    // Arrange - Minimize window
    act(() => {
      result.current.minimizeWindow(mockApp);
    });
    expect(
      result.current.windowList.find((w) => w.id === mockApp.id)!.isMinimized,
    ).toBe(true);

    // Act - Bring to front restores
    act(() => {
      result.current.bringToFront(mockApp);
    });

    // Assert - Restored
    expect(
      result.current.windowList.find((w) => w.id === mockApp.id)!.isMinimized,
    ).toBe(false);
  });

  it('[maximize] should toggle between maximized and restored state', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const customSize = { width: 400, height: 300 };
    const customPosition = { x: 100, y: 100 };

    act(() => {
      result.current.openWindow(mockApp, customSize, customPosition);
    });

    // Act - Maximize
    act(() => {
      result.current.toggleMaximizeWindow(mockApp);
    });

    // Assert - Maximized
    const maximizedWindow = result.current.windowList[0];
    expect(maximizedWindow.isMaximized).toBe(true);
    expect(maximizedWindow.position).toEqual({ x: 0, y: 0 });
    expect(maximizedWindow.size.width).toBe(1024);
    expect(maximizedWindow.size.height).toBe(768 - TASKBAR_HEIGHT);
    expect(maximizedWindow.previousSize).toEqual(customSize);
    expect(maximizedWindow.previousPosition).toEqual(customPosition);

    // Act - Restore
    act(() => {
      result.current.toggleMaximizeWindow(mockApp);
    });

    // Assert - Restored
    const restoredWindow = result.current.windowList[0];
    expect(restoredWindow.isMaximized).toBe(false);
    expect(restoredWindow.size).toEqual(customSize);
    expect(restoredWindow.position).toEqual(customPosition);
  });

  it('[maximize] should respect canMaximize flag and not maximize when false', () => {
    // Arrange
    const { result } = renderHook(() => useWindowState());
    const nonMaximizableApp: App = { ...mockApp, canMaximize: false };

    act(() => {
      result.current.openWindow(nonMaximizableApp);
    });
    const originalState = { ...result.current.windowList[0] };

    // Act
    act(() => {
      result.current.toggleMaximizeWindow(nonMaximizableApp);
    });

    // Assert - State unchanged
    const window = result.current.windowList[0];
    expect(window.isMaximized).toBe(originalState.isMaximized);
    expect(window.size).toEqual(originalState.size);
    expect(window.position).toEqual(originalState.position);
  });
});
