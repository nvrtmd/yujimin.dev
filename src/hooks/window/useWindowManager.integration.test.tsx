import { renderHook, act } from '@testing-library/react';
import { useWindowManager } from './useWindowManager';
import { APP_LIST } from '@/libs/contentProvider';
import { App } from '@/models';
import { vi } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

let currentPathname = '/';

const mockPush = vi.fn((path: string) => {
  currentPathname = path;
});
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => currentPathname,
  useSearchParams: () => new URLSearchParams(),
}));

// =============================================================================
// Helpers
// =============================================================================

/**
 * Simulates the full window-open flow:
 * 1. handleOpenWindow calls router.push (updates currentPathname via mock)
 * 2. Re-render triggers useUrlNavigation to detect the route change
 * 3. useUrlNavigation calls openWindow to create the window
 */
const openWindowViaNavigation = (
  result: { current: ReturnType<typeof useWindowManager> },
  rerender: () => void,
  app: App,
) => {
  act(() => {
    result.current.handleOpenWindow(app);
  });
  act(() => {
    rerender();
  });
};

// =============================================================================
// Tests
// =============================================================================

describe('useWindowManager - App Activation Scenarios', () => {
  const blogApp = APP_LIST.find((app) => app.id === 'blog')!;
  const aboutApp = APP_LIST.find((app) => app.id === 'about')!;
  const guestbookApp = APP_LIST.find((app) => app.id === 'guestbook')!;

  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/';
  });

  // ===========================================================================
  // Scenario 1: Blog window is already frontmost
  // ===========================================================================

  it('[scenario-1] should do nothing when blog is already frontmost', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useWindowManager());

    // Open Blog window
    openWindowViaNavigation(result, rerender, blogApp);

    const blogWindow = result.current.windowList.find((w) => w.id === 'blog');
    expect(blogWindow).toBeDefined();
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');

    const initialWindowList = [...result.current.windowList];

    // Act - Try to open Blog again when it's already frontmost
    act(() => {
      result.current.handleOpenWindow(blogApp);
    });

    // Assert - Window list should not change
    expect(result.current.windowList).toEqual(initialWindowList);
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');
  });

  // ===========================================================================
  // Scenario 2: Blog window is behind another window
  // ===========================================================================

  it('[scenario-2] should bring blog to front when it is behind another window', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useWindowManager());

    // Open Blog first
    openWindowViaNavigation(result, rerender, blogApp);

    // Open About on top of Blog
    openWindowViaNavigation(result, rerender, aboutApp);

    expect(result.current.frontmostOpenWindow?.id).toBe('about');
    expect(result.current.windowList).toHaveLength(2);

    const blogWindow = result.current.windowList.find((w) => w.id === 'blog')!;
    const aboutWindow = result.current.windowList.find(
      (w) => w.id === 'about',
    )!;
    expect(blogWindow.zIndex).toBeLessThan(aboutWindow.zIndex);

    // Act - Bring Blog to front
    act(() => {
      result.current.bringToFront(blogWindow);
    });

    // Assert - Blog should now be frontmost
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');
    const updatedBlogWindow = result.current.windowList.find(
      (w) => w.id === 'blog',
    )!;
    const updatedAboutWindow = result.current.windowList.find(
      (w) => w.id === 'about',
    )!;
    expect(updatedBlogWindow.zIndex).toBeGreaterThan(updatedAboutWindow.zIndex);
  });

  // ===========================================================================
  // Scenario 3: Blog window is minimized
  // ===========================================================================

  it('[scenario-3] should restore and bring blog to front when it is minimized', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useWindowManager());

    // Open Blog and Guestbook
    openWindowViaNavigation(result, rerender, blogApp);
    openWindowViaNavigation(result, rerender, guestbookApp);

    // Minimize Blog
    const blogWindow = result.current.windowList.find((w) => w.id === 'blog')!;
    act(() => {
      result.current.minimizeWindow(blogWindow);
    });

    const minimizedBlog = result.current.windowList.find(
      (w) => w.id === 'blog',
    )!;
    expect(minimizedBlog.isMinimized).toBe(true);
    expect(result.current.frontmostOpenWindow?.id).toBe('guestbook');

    // Act - Bring minimized Blog to front
    act(() => {
      result.current.bringToFront(minimizedBlog);
    });

    // Assert - Blog should be restored and frontmost
    const restoredBlog = result.current.windowList.find(
      (w) => w.id === 'blog',
    )!;
    expect(restoredBlog.isMinimized).toBe(false);
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');
  });

  // ===========================================================================
  // Scenario 4: Blog window is not open
  // ===========================================================================

  it('[scenario-4] should open new blog window when it is not open', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useWindowManager());

    expect(result.current.windowList).toHaveLength(0);

    // Act - Open Blog
    openWindowViaNavigation(result, rerender, blogApp);

    // Assert - Blog should be opened and frontmost
    expect(result.current.windowList).toHaveLength(1);
    const blogWindow = result.current.windowList.find((w) => w.id === 'blog');
    expect(blogWindow).toBeDefined();
    expect(blogWindow?.isMinimized).toBe(false);
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');
  });

  // ===========================================================================
  // Complex Scenario: Multiple windows with mixed states
  // ===========================================================================

  it('[scenario-complex] should correctly handle blog activation with multiple windows', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useWindowManager());

    // Open Blog, About, Guestbook in sequence
    openWindowViaNavigation(result, rerender, blogApp);
    openWindowViaNavigation(result, rerender, aboutApp);
    openWindowViaNavigation(result, rerender, guestbookApp);

    expect(result.current.windowList).toHaveLength(3);
    expect(result.current.frontmostOpenWindow?.id).toBe('guestbook');

    // Minimize Blog (which is in the background)
    const blogWindow = result.current.windowList.find((w) => w.id === 'blog')!;
    act(() => {
      result.current.minimizeWindow(blogWindow);
    });

    expect(result.current.frontmostOpenWindow?.id).toBe('guestbook');

    // Act - Activate Blog (should restore and bring to front)
    const minimizedBlog = result.current.windowList.find(
      (w) => w.id === 'blog',
    )!;
    act(() => {
      result.current.bringToFront(minimizedBlog);
    });

    // Assert - Blog should be restored and frontmost
    const activeBlog = result.current.windowList.find((w) => w.id === 'blog')!;
    expect(activeBlog.isMinimized).toBe(false);
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');

    // All three windows should still exist
    expect(result.current.windowList).toHaveLength(3);
  });

  // ===========================================================================
  // Edge Case: Activate already maximized blog in background
  // ===========================================================================

  it('[edge-case] should bring maximized blog to front when it is in background', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useWindowManager());

    // Open Blog
    openWindowViaNavigation(result, rerender, blogApp);

    const blogWindow = result.current.windowList.find((w) => w.id === 'blog')!;

    // Maximize Blog
    act(() => {
      result.current.toggleMaximizeWindow(blogWindow);
    });

    const maximizedBlog = result.current.windowList.find(
      (w) => w.id === 'blog',
    )!;
    expect(maximizedBlog.isMaximized).toBe(true);

    // Open About on top
    openWindowViaNavigation(result, rerender, aboutApp);

    expect(result.current.frontmostOpenWindow?.id).toBe('about');

    // Act - Bring maximized Blog to front
    const backgroundBlog = result.current.windowList.find(
      (w) => w.id === 'blog',
    )!;
    act(() => {
      result.current.bringToFront(backgroundBlog);
    });

    // Assert - Blog should be frontmost and still maximized
    const frontBlog = result.current.windowList.find((w) => w.id === 'blog')!;
    expect(frontBlog.isMaximized).toBe(true);
    expect(result.current.frontmostOpenWindow?.id).toBe('blog');
  });
});
