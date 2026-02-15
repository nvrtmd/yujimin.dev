import { renderHook, act } from '@/__tests__/utils/test-utils';
import { useIconDrag } from './useIconDrag';

// Mock APP_LIST
vi.mock('@/libs/contentProvider', () => ({
  APP_LIST: [
    { id: 'blog', title: 'Blog', iconSrc: '/blog.png', renderType: 'ssg' },
    {
      id: 'about-me',
      title: 'About Me',
      iconSrc: '/about.png',
      renderType: 'csr',
    },
    {
      id: 'resume',
      title: 'Resume',
      iconSrc: '/resume.png',
      renderType: 'csr',
    },
    {
      id: 'guestbook',
      title: 'Guestbook',
      iconSrc: '/guestbook.png',
      renderType: 'csr',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      iconSrc: '/analytics.png',
      renderType: 'csr',
    },
  ],
}));

describe('useIconDrag', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

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

    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockEvent = (clientX = 100, clientY = 200) =>
    ({
      clientX,
      clientY,
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    }) as unknown as React.MouseEvent;

  it('[init] should initialize with vertical layout and isDragged=false', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(false));

    // Act (none for init)

    // Assert
    expect(result.current.isDragged).toBe(false);
    expect(result.current.iconPositions).toEqual({
      blog: { x: 16, y: 16 },
      'about-me': { x: 16, y: 122 },
      resume: { x: 16, y: 228 },
      guestbook: { x: 16, y: 334 },
      analytics: { x: 16, y: 440 },
    });
  });

  it('[init] should have pre-calculated positions before useEffect (not empty object)', () => {
    // Arrange & Act
    let initialPositions: Record<string, { x: number; y: number }> | null =
      null;

    renderHook(() => {
      const result = useIconDrag(false);
      if (initialPositions === null) {
        initialPositions = { ...result.iconPositions };
      }
      return result;
    });

    // Assert - Should NOT be empty on first render
    expect(initialPositions).not.toEqual({});
    expect(Object.keys(initialPositions!)).toHaveLength(5);
    expect(initialPositions!.blog).toBeDefined();
  });

  it('[isRenderReady] should start as false and become true after initialization', async () => {
    // Arrange
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    // Act
    const { result } = renderHook(() => useIconDrag(false));

    // Assert - isRenderReady should be false initially
    expect(result.current.isRenderReady).toBe(false);

    // Act - Flush requestAnimationFrame
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    // Assert - isRenderReady should be true after rAF fires
    expect(result.current.isRenderReady).toBe(true);

    vi.restoreAllMocks();
  });

  it('[isRenderReady] should be returned from the hook', () => {
    // Arrange & Act
    const { result } = renderHook(() => useIconDrag(false));

    // Assert - isRenderReady property exists
    expect(result.current).toHaveProperty('isRenderReady');
    expect(typeof result.current.isRenderReady).toBe('boolean');
  });

  it('[mouseDown] should start drag and register event listeners on desktop', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(false));
    const mockEvent = createMockEvent();

    // Act
    act(() => {
      result.current.handleIconMouseDown(mockEvent, 'blog');
    });

    // Assert
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.isDragged).toBe(false);
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );
  });

  it('[mouseDown] should reset isDragged on new drag start', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(false));
    const mockEvent = createMockEvent();

    // Act - Start drag and move to set isDragged=true
    act(() => {
      result.current.handleIconMouseDown(mockEvent, 'blog');
    });
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 300 }),
      );
    });
    expect(result.current.isDragged).toBe(true);

    // Act - End drag and start new one
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });
    act(() => {
      result.current.handleIconMouseDown(createMockEvent(150, 250), 'about-me');
    });

    // Assert - isDragged should reset
    expect(result.current.isDragged).toBe(false);
  });

  it('[mouseDown] should NOT start drag on mobile', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(true));
    const mockEvent = createMockEvent();

    // Act
    act(() => {
      result.current.handleIconMouseDown(mockEvent, 'blog');
    });

    // Assert
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
  });

  it('[move] should update position only when dragging', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(false));
    const initialPosition = { ...result.current.iconPositions.blog };

    // Act & Assert - Without drag start, should not update
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 250 }),
      );
    });
    expect(result.current.iconPositions.blog).toEqual(initialPosition);

    // Act - With drag start, should update
    act(() => {
      result.current.handleIconMouseDown(createMockEvent(), 'blog');
    });
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 250 }),
      );
    });

    // Assert - Initial (16, 16) + delta (50, 50) = (66, 66)
    expect(result.current.iconPositions.blog).toEqual({ x: 66, y: 66 });
  });

  it.each([
    [0, 200, 0, 16, 'left edge'],
    [100, 0, 16, 0, 'top edge'],
    [2000, 200, 924, 16, 'right edge'],
    [100, 2000, 16, 648, 'bottom edge'],
  ])(
    '[boundary] should constrain position at %s (clientX=%d, clientY=%d)',
    (clientX, clientY, expectedX, expectedY) => {
      // Arrange
      const { result } = renderHook(() => useIconDrag(false));

      // Act
      act(() => {
        result.current.handleIconMouseDown(createMockEvent(), 'blog');
      });
      act(() => {
        window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
      });

      // Assert
      expect(result.current.iconPositions.blog.x).toBe(expectedX);
      expect(result.current.iconPositions.blog.y).toBe(expectedY);
    },
  );

  it.each([
    [102, 200, false, '<=3px x-axis'],
    [100, 203, false, '=3px y-axis'],
    [104, 200, true, '>3px x-axis'],
    [100, 204, true, '>3px y-axis'],
    [95, 200, true, 'negative >3px'],
  ])(
    '[threshold] should set isDragged=%s for %s movement (clientX=%d, clientY=%d)',
    (clientX, clientY, expectedDragged) => {
      // Arrange
      const { result } = renderHook(() => useIconDrag(false));

      // Act
      act(() => {
        result.current.handleIconMouseDown(createMockEvent(), 'blog');
      });
      act(() => {
        window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
      });

      // Assert
      expect(result.current.isDragged).toBe(expectedDragged);
    },
  );

  it('[mouseUp] should stop dragging and remove event listeners', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(false));
    act(() => {
      result.current.handleIconMouseDown(createMockEvent(), 'blog');
    });
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 250 }),
      );
    });
    const positionBeforeUp = { ...result.current.iconPositions.blog };

    // Act
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });

    // Assert
    expect(result.current.iconPositions.blog).toEqual(positionBeforeUp);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );
  });

  it('[cleanup] should remove event listeners on unmount during drag', () => {
    // Arrange
    const { result, unmount } = renderHook(() => useIconDrag(false));
    act(() => {
      result.current.handleIconMouseDown(createMockEvent(), 'blog');
    });
    vi.clearAllMocks();

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
  });

  it('[independence] should only move the most recently grabbed icon', () => {
    // Arrange
    const { result } = renderHook(() => useIconDrag(false));
    act(() => {
      result.current.handleIconMouseDown(createMockEvent(100, 200), 'blog');
    });
    act(() => {
      result.current.handleIconMouseDown(createMockEvent(150, 250), 'about-me');
    });
    const blogInitialPos = { ...result.current.iconPositions.blog };

    // Act
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 300 }),
      );
    });

    // Assert
    expect(result.current.iconPositions.blog).toEqual(blogInitialPos);
    expect(result.current.iconPositions['about-me']).toEqual({ x: 66, y: 172 });
  });
});
