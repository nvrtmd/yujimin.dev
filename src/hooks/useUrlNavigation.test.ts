import {
  renderHook,
  waitFor,
  createMockSsgWindow,
} from '@/__tests__/utils/test-utils';
import { useUrlNavigation } from './useUrlNavigation';
import type { App, WindowState } from '@/models';

const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('@/libs/contentProvider', () => ({
  APP_LIST: [
    {
      id: 'blog',
      title: 'Blog',
      iconSrc: '/images/icons/internet_img.webp',
      showAddressBar: true,
    },
  ],
}));

describe('useUrlNavigation', () => {
  let mockOpenWindow: (
    app: App,
    size?: App['size'],
    position?: App['position'],
  ) => void;
  let mockBringToFront: (app: App) => void;
  let windowList: WindowState[];

  beforeEach(() => {
    mockOpenWindow = vi.fn();
    mockBringToFront = vi.fn();
    windowList = [];
    mockPathname.mockReturnValue('/');
  });

  it('[init] should not open window on initial render', () => {
    // Arrange & Act
    renderHook(() =>
      useUrlNavigation(windowList, mockOpenWindow, mockBringToFront),
    );

    // Assert
    expect(mockOpenWindow).not.toHaveBeenCalled();
    expect(mockBringToFront).not.toHaveBeenCalled();
  });

  it('[window] should open window on app path and ignore non-app paths', async () => {
    // Arrange
    const { rerender } = renderHook(() =>
      useUrlNavigation(windowList, mockOpenWindow, mockBringToFront),
    );

    // Assert - Root path should not open window
    expect(mockOpenWindow).not.toHaveBeenCalled();

    // Act - Navigate to app path
    mockPathname.mockReturnValue('/blog');
    rerender();

    // Assert - Should open window with size and position
    await waitFor(() => {
      expect(mockOpenWindow).toHaveBeenCalledTimes(1);
      expect(mockOpenWindow).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'blog', showAddressBar: true }),
        undefined,
        undefined,
      );
    });

    vi.clearAllMocks();

    // Act - Navigate to non-app path
    mockPathname.mockReturnValue('/about');
    rerender();

    // Assert - Should not open window
    await waitFor(() => {
      expect(mockOpenWindow).not.toHaveBeenCalled();
      expect(mockBringToFront).not.toHaveBeenCalled();
    });
  });

  it('[window] should bring existing window to front instead of opening', async () => {
    // Arrange
    const blogWindow = createMockSsgWindow({
      id: 'blog',
      showAddressBar: true,
    });
    windowList = [blogWindow];
    const { rerender } = renderHook(() =>
      useUrlNavigation(windowList, mockOpenWindow, mockBringToFront),
    );

    // Act
    mockPathname.mockReturnValue('/blog');
    rerender();

    // Assert
    await waitFor(() => {
      expect(mockBringToFront).toHaveBeenCalledTimes(1);
      expect(mockBringToFront).toHaveBeenCalledWith(blogWindow);
      expect(mockOpenWindow).not.toHaveBeenCalled();
    });
  });

  it('[guard] should only trigger on pathname change, not windowList change', async () => {
    // Arrange
    const { rerender } = renderHook(
      ({ list }) => useUrlNavigation(list, mockOpenWindow, mockBringToFront),
      { initialProps: { list: [] as WindowState[] } },
    );

    // Act - Trigger once with pathname change
    mockPathname.mockReturnValue('/blog');
    rerender({ list: [] });
    await waitFor(() => {
      expect(mockOpenWindow).toHaveBeenCalledTimes(1);
    });

    vi.clearAllMocks();

    // Act - Change only windowList (pathname stays same)
    const blogWindow = createMockSsgWindow({
      id: 'blog',
      showAddressBar: true,
    });
    rerender({ list: [blogWindow] });

    // Assert - Should not trigger again
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockBringToFront).not.toHaveBeenCalled();
    expect(mockOpenWindow).not.toHaveBeenCalled();
  });
});
