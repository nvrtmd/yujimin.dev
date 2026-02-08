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
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
  });

  it('[filter] should separate SSG and CSR windows by renderType', () => {
    // Arrange
    mockWindowList = [
      createMockSsgWindow({ id: 'blog', zIndex: 1 }),
      createMockCsrWindow({ id: 'about', zIndex: 2 }),
      createMockCsrWindow({ id: 'guestbook', zIndex: 3 }),
    ];

    // Act
    const { result } = renderHook(() => useWindowManager());

    // Assert
    expect(result.current.ssgWindowList).toHaveLength(1);
    expect(result.current.ssgWindowList[0].id).toBe('blog');
    expect(result.current.csrWindowList).toHaveLength(2);
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

  it('[open] should push route for SSG app and skip for CSR app', () => {
    // Arrange
    const { result } = renderHook(() => useWindowManager());

    // Act - Open SSG app
    act(() => {
      result.current.handleOpenWindow(createMockSsgApp({ id: 'blog' }));
    });

    // Assert - Should push route
    expect(mockPush).toHaveBeenCalledWith('/blog');
    expect(mockOpenWindow).toHaveBeenCalled();

    vi.clearAllMocks();

    // Act - Open CSR app
    act(() => {
      result.current.handleOpenWindow(createMockCsrApp({ id: 'about' }));
    });

    // Assert - Should NOT push route
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockOpenWindow).toHaveBeenCalled();
  });

  it('[close] should push "/" for SSG window and skip for CSR window', () => {
    // Arrange
    const ssgWindow = createMockSsgWindow({ id: 'blog' });
    const csrWindow = createMockCsrWindow({ id: 'about' });
    mockWindowList = [ssgWindow, csrWindow];
    const { result } = renderHook(() => useWindowManager());

    // Act - Close SSG window
    act(() => {
      result.current.handleCloseWindow(ssgWindow);
    });

    // Assert - Should push "/"
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockCloseWindow).toHaveBeenCalledWith(ssgWindow);

    vi.clearAllMocks();

    // Act - Close CSR window
    act(() => {
      result.current.handleCloseWindow(csrWindow);
    });

    // Assert - Should NOT push route
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseWindow).toHaveBeenCalledWith(csrWindow);
  });
});
