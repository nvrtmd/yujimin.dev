import { renderHook, act, waitFor } from '@/__tests__/utils/test-utils';
import { useBlogNavigation } from './useBlogNavigation';

const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

describe('useBlogNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/');
  });

  it('[init] should initialize with navigation disabled', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBlogNavigation());

    // Assert
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it('[non-blog] should not track non-blog paths', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    // Act - Navigate to non-blog paths
    mockPathname.mockReturnValue('/about');
    rerender();
    mockPathname.mockReturnValue('/resume');
    rerender();

    // Assert - Navigation stays disabled
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it('[track] should track blog paths and enable goBack after second blog path', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    // Act - Navigate to /blog
    mockPathname.mockReturnValue('/blog');
    rerender();

    // Assert - First blog path, no back
    await waitFor(() => {
      expect(result.current.canGoBack).toBe(false);
    });

    // Act - Navigate to /blog/post-1
    mockPathname.mockReturnValue('/blog/post-1');
    rerender();

    // Assert - Second blog path, back enabled
    await waitFor(() => {
      expect(result.current.canGoBack).toBe(true);
      expect(result.current.canGoForward).toBe(false);
    });
  });

  it('[goBack] should navigate back within blog history', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    // Build up history: /blog -> /blog/post-1
    mockPathname.mockReturnValue('/blog');
    rerender();
    mockPathname.mockReturnValue('/blog/post-1');
    rerender();

    await waitFor(() => {
      expect(result.current.canGoBack).toBe(true);
    });

    // Act - Go back
    act(() => {
      result.current.goBack();
    });

    // Assert
    expect(mockPush).toHaveBeenCalledWith('/blog');
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(true);
  });

  it('[goForward] should navigate forward within blog history', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    // Build history: /blog -> /blog/post-1
    mockPathname.mockReturnValue('/blog');
    rerender();
    mockPathname.mockReturnValue('/blog/post-1');
    rerender();

    // Go back first
    act(() => {
      result.current.goBack();
    });

    // Simulate pathname update from goBack's router.push
    mockPathname.mockReturnValue('/blog');
    rerender();

    // Act - Go forward
    act(() => {
      result.current.goForward();
    });

    // Assert
    expect(mockPush).toHaveBeenLastCalledWith('/blog/post-1');
    expect(result.current.canGoBack).toBe(true);
    expect(result.current.canGoForward).toBe(false);
  });

  it('[truncation] should truncate forward history on new external navigation', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    // Build history: /blog -> /blog/post-1 -> /blog/post-2
    mockPathname.mockReturnValue('/blog');
    rerender();
    mockPathname.mockReturnValue('/blog/post-1');
    rerender();
    mockPathname.mockReturnValue('/blog/post-2');
    rerender();

    // Go back twice to /blog
    act(() => {
      result.current.goBack();
    });
    mockPathname.mockReturnValue('/blog/post-1');
    rerender();

    act(() => {
      result.current.goBack();
    });
    mockPathname.mockReturnValue('/blog');
    rerender();

    await waitFor(() => {
      expect(result.current.canGoForward).toBe(true);
    });

    // Act - Navigate to new blog path (should truncate forward history)
    mockPathname.mockReturnValue('/blog/post-3');
    rerender();

    // Assert - Forward is gone, back is enabled
    await waitFor(() => {
      expect(result.current.canGoForward).toBe(false);
      expect(result.current.canGoBack).toBe(true);
    });
  });

  it('[goBack-noop] should not navigate when already at the beginning', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    mockPathname.mockReturnValue('/blog');
    rerender();

    // Act - Try go back at beginning
    act(() => {
      result.current.goBack();
    });

    // Assert - Should not call router.push
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('[goForward-noop] should not navigate when already at the end', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    mockPathname.mockReturnValue('/blog');
    rerender();

    // Act - Try go forward at end
    act(() => {
      result.current.goForward();
    });

    // Assert - Should not call router.push
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('[internal-nav-skip] should not duplicate history entry when goBack triggers pathname change', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useBlogNavigation());

    // Build history: /blog -> /blog/post-1
    mockPathname.mockReturnValue('/blog');
    rerender();
    mockPathname.mockReturnValue('/blog/post-1');
    rerender();

    // Act - Go back (sets internal flag)
    act(() => {
      result.current.goBack();
    });

    // Simulate pathname change from router.push
    mockPathname.mockReturnValue('/blog');
    rerender();

    // Assert - Should still have forward ability (history not duplicated)
    await waitFor(() => {
      expect(result.current.canGoForward).toBe(true);
      expect(result.current.canGoBack).toBe(false);
    });

    // Act - Go forward
    act(() => {
      result.current.goForward();
    });

    // Assert - Should navigate to /blog/post-1
    expect(mockPush).toHaveBeenLastCalledWith('/blog/post-1');
  });
});
