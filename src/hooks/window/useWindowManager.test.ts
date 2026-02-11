import {
  renderHook,
  act,
  createMockCsrWindow,
  createMockSsgWindow,
  createMockCsrApp,
  createMockSsgApp,
} from '@/__tests__/utils/test-utils';
import { useWindowManager } from './useWindowManager';
import type { WindowState } from '@/models';

const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
}));

const mockOpenWindow = vi.fn();
const mockCloseWindow = vi.fn();
const mockMinimizeWindow = vi.fn();
const mockBringToFront = vi.fn();

let mockWindowList: WindowState[] = [];

vi.mock('./useWindowState', () => ({
  useWindowState: () => ({
    windowList: mockWindowList,
    setWindowList: vi.fn(),
    openWindow: mockOpenWindow,
    closeWindow: mockCloseWindow,
    minimizeWindow: mockMinimizeWindow,
    toggleMaximizeWindow: vi.fn(),
    bringToFront: mockBringToFront,
  }),
}));

vi.mock('./useWindowDrag', () => ({
  useWindowDrag: () => ({ handleWindowDragMouseDown: vi.fn() }),
}));

vi.mock('./useWindowResize', () => ({
  useWindowResize: () => ({ handleResizeMouseDown: vi.fn() }),
}));

vi.mock('../useUrlNavigation', () => ({
  useUrlNavigation: () => ({ isPreviousPathHome: false }),
}));

describe('useWindowManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowList = [];
    mockPathname.mockReturnValue('/');
  });

  it('[frontmost] should return highest zIndex window as frontmost', () => {
    // Arrange - Empty array boundary
    mockWindowList = [];
    const { result, rerender } = renderHook(() => useWindowManager());

    // Assert - Empty case
    expect(result.current.frontmostOpenWindow).toBeNull();

    // Arrange - Normal case
    mockWindowList = [
      createMockCsrWindow({ id: 'about', zIndex: 1 }),
      createMockCsrWindow({ id: 'guestbook', zIndex: 3 }),
      createMockCsrWindow({ id: 'blog', zIndex: 2 }),
    ];

    // Act
    rerender();

    // Assert
    expect(result.current.frontmostOpenWindow?.id).toBe('guestbook');
  });

  it('[frontmost] should exclude minimized windows from frontmost calculation', () => {
    // Arrange
    mockWindowList = [
      createMockCsrWindow({ id: 'about', zIndex: 5, isMinimized: true }),
      createMockCsrWindow({ id: 'guestbook', zIndex: 3, isMinimized: false }),
      createMockCsrWindow({ id: 'analytics', zIndex: 4, isMinimized: true }),
      createMockCsrWindow({ id: 'resume', zIndex: 2, isMinimized: false }),
    ];

    // Act
    const { result } = renderHook(() => useWindowManager());

    // Assert - guestbook(3) is frontmost since about(5) and analytics(4) are minimized
    expect(result.current.frontmostOpenWindow?.id).toBe('guestbook');
  });

  it('[taskbar-toggle] should minimize frontmost window and bring-to-front non-frontmost window', () => {
    // Arrange
    const frontWindow = createMockCsrWindow({
      id: 'about',
      zIndex: 2,
      isMinimized: false,
    });
    const backWindow = createMockCsrWindow({
      id: 'blog',
      zIndex: 1,
      isMinimized: false,
    });
    mockWindowList = [backWindow, frontWindow];
    const { result } = renderHook(() => useWindowManager());

    // Act - Click frontmost window
    act(() => {
      result.current.toggleWindowFromTaskbar(frontWindow);
    });

    // Assert - Should minimize
    expect(mockMinimizeWindow).toHaveBeenCalledWith(frontWindow);
    expect(mockBringToFront).not.toHaveBeenCalled();

    vi.clearAllMocks();

    // Act - Click non-frontmost window
    act(() => {
      result.current.toggleWindowFromTaskbar(backWindow);
    });

    // Assert - Should bring to front
    expect(mockBringToFront).toHaveBeenCalledWith(backWindow);
    expect(mockMinimizeWindow).not.toHaveBeenCalled();
  });

  it('[open] should always push route for all apps', () => {
    // Arrange
    const { result } = renderHook(() => useWindowManager());

    // Act - Open app with address bar
    act(() => {
      result.current.handleOpenWindow(createMockSsgApp({ id: 'blog' }));
    });

    // Assert - Should push route
    expect(mockPush).toHaveBeenCalledWith('/blog');
    expect(mockOpenWindow).toHaveBeenCalled();

    vi.clearAllMocks();

    // Act - Open app without address bar
    act(() => {
      result.current.handleOpenWindow(createMockCsrApp({ id: 'analytics' }));
    });

    // Assert - Should also push route
    expect(mockPush).toHaveBeenCalledWith('/analytics');
    expect(mockOpenWindow).toHaveBeenCalled();
  });

  it('[close] should push "/" for active window and skip for inactive window', () => {
    // Arrange
    const window1 = createMockSsgWindow({ id: 'blog' });
    const window2 = createMockCsrWindow({ id: 'analytics' });
    mockWindowList = [window1, window2];
    mockPathname.mockReturnValue('/blog');
    const { result } = renderHook(() => useWindowManager());

    // Act - Close active window (pathname matches)
    act(() => {
      result.current.handleCloseWindow(window1);
    });

    // Assert - Should push "/"
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockCloseWindow).toHaveBeenCalledWith(window1);

    vi.clearAllMocks();

    // Act - Close inactive window
    act(() => {
      result.current.handleCloseWindow(window2);
    });

    // Assert - Should NOT push route
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseWindow).toHaveBeenCalledWith(window2);
  });

  it('[close] should not navigate when closing inactive window', () => {
    // Arrange
    const window = createMockSsgWindow({ id: 'about' });
    mockWindowList = [window];
    mockPathname.mockReturnValue('/blog');
    const { result } = renderHook(() => useWindowManager());

    // Act - Close window that does NOT match current URL
    act(() => {
      result.current.handleCloseWindow(window);
    });

    // Assert - Should NOT push route (window is not active)
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseWindow).toHaveBeenCalledWith(window);
  });
});
