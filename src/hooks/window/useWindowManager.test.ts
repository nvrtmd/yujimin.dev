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
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const mockOpenWindow = vi.fn();
const mockCloseWindow = vi.fn();
const mockMinimizeWindow = vi.fn();
const mockBringToFront = vi.fn();

let mockWindowList: WindowState[] = [];
const defaultApps = [
  createMockSsgApp({ id: 'blog', syncWithUrl: true }),
  createMockSsgApp({ id: 'about-me' }),
  createMockCsrApp({ id: 'analytics' }),
];

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
  useUrlNavigation: vi.fn(),
}));

vi.mock('../useBlogNavigation', () => ({
  useBlogNavigation: () => ({
    canGoBack: false,
    canGoForward: false,
    goBack: vi.fn(),
    goForward: vi.fn(),
  }),
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
    const { result, rerender } = renderHook(() => useWindowManager(defaultApps));

    // Assert - Empty case
    expect(result.current.frontmostOpenWindow).toBeNull();

    // Arrange - Normal case
    mockWindowList = [
      createMockCsrWindow({ id: 'about-me', zIndex: 1 }),
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
      createMockCsrWindow({ id: 'about-me', zIndex: 5, isMinimized: true }),
      createMockCsrWindow({ id: 'guestbook', zIndex: 3, isMinimized: false }),
      createMockCsrWindow({ id: 'analytics', zIndex: 4, isMinimized: true }),
      createMockCsrWindow({ id: 'resume', zIndex: 2, isMinimized: false }),
    ];

    // Act
    const { result } = renderHook(() => useWindowManager(defaultApps));

    // Assert - guestbook(3) is frontmost since about(5) and analytics(4) are minimized
    expect(result.current.frontmostOpenWindow?.id).toBe('guestbook');
  });

  it('[taskbar-toggle] should minimize frontmost window and bring-to-front non-frontmost window', () => {
    // Arrange
    const frontWindow = createMockCsrWindow({
      id: 'about-me',
      zIndex: 2,
      isMinimized: false,
    });
    const backWindow = createMockCsrWindow({
      id: 'blog',
      zIndex: 1,
      isMinimized: false,
    });
    mockWindowList = [backWindow, frontWindow];
    const { result } = renderHook(() => useWindowManager(defaultApps));

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

  it('[open] should push route for URL-synced apps and directly open for other apps', () => {
    // Arrange
    const { result } = renderHook(() => useWindowManager(defaultApps));

    // Act - Open URL-synced app (Blog with syncWithUrl: true)
    act(() => {
      result.current.handleOpenWindow(
        createMockSsgApp({ id: 'blog', syncWithUrl: true }),
      );
    });

    // Assert - Should push route for URL-synced app
    expect(mockPush).toHaveBeenCalledWith('/blog');
    expect(mockOpenWindow).not.toHaveBeenCalled();

    vi.clearAllMocks();

    // Act - Open non-URL-synced SSG app (About, no syncWithUrl)
    act(() => {
      result.current.handleOpenWindow(createMockSsgApp({ id: 'about-me' }));
    });

    // Assert - Should directly open window without URL change
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockOpenWindow).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'about-me' }),
      undefined,
      undefined,
    );

    vi.clearAllMocks();

    // Act - Open CSR app (Analytics with showAddressBar: false)
    act(() => {
      result.current.handleOpenWindow(createMockCsrApp({ id: 'analytics' }));
    });

    // Assert - Should directly open window without URL change
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockOpenWindow).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'analytics' }),
      undefined,
      undefined,
    );
  });

  it('[open] should bring existing window to front immediately', () => {
    // Arrange
    const existingWindow = createMockSsgWindow({
      id: 'blog',
      zIndex: 1,
      syncWithUrl: true,
    });
    mockWindowList = [existingWindow];
    const { result } = renderHook(() => useWindowManager(defaultApps));

    // Act - Open app that already has a window
    act(() => {
      result.current.handleOpenWindow(
        createMockSsgApp({ id: 'blog', syncWithUrl: true }),
      );
    });

    // Assert - Should bring to front and push route
    expect(mockBringToFront).toHaveBeenCalledWith(existingWindow);
    expect(mockPush).toHaveBeenCalledWith('/blog');
    expect(mockOpenWindow).not.toHaveBeenCalled();
  });

  it('[close] should push "/" for active URL-synced window and skip for other windows', () => {
    // Arrange
    const urlSyncedWindow = createMockSsgWindow({
      id: 'blog',
      syncWithUrl: true,
    });
    const nonSyncedWindow = createMockCsrWindow({ id: 'analytics' });
    mockWindowList = [urlSyncedWindow, nonSyncedWindow];
    mockPathname.mockReturnValue('/blog');
    const { result } = renderHook(() => useWindowManager(defaultApps));

    // Act - Close active URL-synced window (pathname matches)
    act(() => {
      result.current.handleCloseWindow(urlSyncedWindow);
    });

    // Assert - Should push "/" for URL-synced window
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockCloseWindow).toHaveBeenCalledWith(urlSyncedWindow);

    vi.clearAllMocks();

    // Act - Close non-URL-synced window
    act(() => {
      result.current.handleCloseWindow(nonSyncedWindow);
    });

    // Assert - Should NOT push route for non-URL-synced window
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseWindow).toHaveBeenCalledWith(nonSyncedWindow);
  });

  it('[close] should not navigate when closing inactive URL-synced window', () => {
    // Arrange
    const window = createMockSsgWindow({ id: 'about-me' }); // No syncWithUrl
    mockWindowList = [window];
    mockPathname.mockReturnValue('/blog');
    const { result } = renderHook(() => useWindowManager(defaultApps));

    // Act - Close window that does NOT match current URL
    act(() => {
      result.current.handleCloseWindow(window);
    });

    // Assert - Should NOT push route (window is not URL-synced)
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseWindow).toHaveBeenCalledWith(window);
  });
});
