import { render, screen, fireEvent, act } from '@/__tests__/utils/test-utils';
import { useIconDrag } from './useIconDrag';
import { DesktopIcon } from '@/components/layout/DesktopIcon';
import type { AppId } from '@/models';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock useSelectedStyle
vi.mock('@/hooks/useSelectedStyle', () => ({
  useSelectedStyle: (isSelected: boolean) => ({
    container: isSelected
      ? 'bg-[var(--color-window-title-active)] text-white border-gray-200 border-dotted'
      : 'text-black border-transparent border-dotted',
    imageTint: isSelected ? 'opacity-90 mix-blend-hard-light' : '',
  }),
}));

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
      id: 'guestbook',
      title: 'Guestbook',
      iconSrc: '/guestbook.png',
      renderType: 'csr',
    },
  ],
}));

function IconDragTestComponent({
  isMobile = false,
  onIconClick,
}: {
  isMobile?: boolean;
  onIconClick?: (id: AppId) => void;
}) {
  const { iconPositions, handleIconMouseDown, isDragged, isRenderReady } =
    useIconDrag(isMobile);

  const handleClick = (id: AppId) => {
    if (!isDragged) {
      onIconClick?.(id);
    }
  };

  return (
    <div
      data-testid='icon-container'
      style={{ width: '1024px', height: '768px', position: 'relative' }}
    >
      <DesktopIcon
        id='blog'
        iconSrc='/blog.png'
        title='Blog'
        isSelected={false}
        position={iconPositions.blog}
        className={`absolute transition-opacity duration-150 ${
          isRenderReady ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseDown={(e) => handleIconMouseDown(e, 'blog')}
        onClick={() => handleClick('blog')}
      />
      <DesktopIcon
        id='about-me'
        iconSrc='/about.png'
        title='About Me'
        isSelected={false}
        position={iconPositions['about-me']}
        className={`absolute transition-opacity duration-150 ${
          isRenderReady ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseDown={(e) => handleIconMouseDown(e, 'about-me')}
        onClick={() => handleClick('about-me')}
      />
      <DesktopIcon
        id='guestbook'
        iconSrc='/guestbook.png'
        title='Guestbook'
        isSelected={false}
        position={iconPositions.guestbook}
        className={`absolute transition-opacity duration-150 ${
          isRenderReady ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseDown={(e) => handleIconMouseDown(e, 'guestbook')}
        onClick={() => handleClick('guestbook')}
      />
    </div>
  );
}

describe('useIconDrag Integration', () => {
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
  });

  it('[drag] should update icon position after drag completes', () => {
    // Arrange
    render(<IconDragTestComponent />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');
    expect(blogIcon.style.left).toBe('16px');
    expect(blogIcon.style.top).toBe('16px');

    // Act
    fireEvent.mouseDown(blogIcon, { clientX: 100, clientY: 100 });
    act(() => {
      fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });

    // Assert
    expect(blogIcon.style.left).not.toBe('16px');
    expect(blogIcon.style.top).not.toBe('16px');
  });

  it('[threshold] should prevent click when dragged >3px and allow when <=3px', () => {
    // Arrange
    const onIconClick = vi.fn();
    render(<IconDragTestComponent onIconClick={onIconClick} />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');

    // Act & Assert - Drag >3px should prevent click
    fireEvent.mouseDown(blogIcon, { clientX: 100, clientY: 100 });
    act(() => {
      fireEvent.mouseMove(window, { clientX: 110, clientY: 110 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });
    fireEvent.click(blogIcon);
    expect(onIconClick).not.toHaveBeenCalled();

    // Act & Assert - Drag <=3px should allow click
    fireEvent.mouseDown(blogIcon, { clientX: 100, clientY: 100 });
    act(() => {
      fireEvent.mouseMove(window, { clientX: 102, clientY: 102 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });
    fireEvent.click(blogIcon);
    expect(onIconClick).toHaveBeenCalledWith('blog');
  });

  it('[independence] should only move the dragged icon without affecting others', () => {
    // Arrange
    render(<IconDragTestComponent />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');
    const aboutIcon = screen.getByTestId('desktop-icon-about-me');
    const aboutInitialLeft = aboutIcon.style.left;
    const aboutInitialTop = aboutIcon.style.top;

    // Act
    fireEvent.mouseDown(blogIcon, { clientX: 100, clientY: 100 });
    act(() => {
      fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });

    // Assert
    expect(blogIcon.style.left).not.toBe('16px');
    expect(aboutIcon.style.left).toBe(aboutInitialLeft);
    expect(aboutIcon.style.top).toBe(aboutInitialTop);
  });

  it('[mobile] should disable drag but allow click in mobile mode', () => {
    // Arrange
    const onIconClick = vi.fn();
    render(<IconDragTestComponent isMobile={true} onIconClick={onIconClick} />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');
    const initialLeft = blogIcon.style.left;
    const initialTop = blogIcon.style.top;

    // Act - Try to drag
    fireEvent.mouseDown(blogIcon, { clientX: 100, clientY: 100 });
    act(() => {
      fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });

    // Assert - Position unchanged
    expect(blogIcon.style.left).toBe(initialLeft);
    expect(blogIcon.style.top).toBe(initialTop);

    // Act & Assert - Click works
    fireEvent.click(blogIcon);
    expect(onIconClick).toHaveBeenCalledWith('blog');
  });

  it('[opacity] should start with opacity-0 class and transition to opacity-100 after rAF', () => {
    // Arrange
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    // Act
    render(<IconDragTestComponent />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');

    // Assert - Initially hidden (opacity-0)
    expect(blogIcon.className).toContain('opacity-0');
    expect(blogIcon.className).not.toContain('opacity-100');
    expect(blogIcon.className).toContain('transition-opacity');

    // Act - Flush rAF
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    // Assert - Now visible (opacity-100)
    expect(blogIcon.className).toContain('opacity-100');
    expect(blogIcon.className).not.toContain('opacity-0');

    vi.restoreAllMocks();
  });

  it('[opacity] should have positions set even before opacity transition', () => {
    // Arrange
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);

    // Act
    render(<IconDragTestComponent />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');

    // Assert - Position is set even while hidden
    expect(blogIcon.style.left).toBe('16px');
    expect(blogIcon.style.top).toBe('16px');
    expect(blogIcon.className).toContain('opacity-0');

    vi.restoreAllMocks();
  });

  it('[boundary] should constrain icon position within screen bounds', () => {
    // Arrange
    render(<IconDragTestComponent />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');

    // Act - Drag beyond screen edges
    fireEvent.mouseDown(blogIcon, { clientX: 100, clientY: 100 });
    act(() => {
      fireEvent.mouseMove(window, { clientX: 2000, clientY: 2000 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });

    // Assert - Constrained to max bounds (innerWidth - 100, innerHeight - 120)
    expect(blogIcon.style.left).toBe('924px');
    expect(blogIcon.style.top).toBe('648px');
  });
});
