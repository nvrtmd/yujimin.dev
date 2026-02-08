import { render, screen, fireEvent } from '@/__tests__/utils/test-utils';
import { useDoubleClick } from './useDoubleClick';
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

// Test component that integrates useDoubleClick with DesktopIcon
function DoubleClickTestComponent({
  onDoubleClickAction,
}: {
  onDoubleClickAction?: (id: AppId) => void;
}) {
  const { clickedIdentifier, handleDoubleClick } = useDoubleClick<AppId>();

  const handleClick = (e: React.MouseEvent, id: AppId) => {
    handleDoubleClick(e, id, (clickedId) => {
      onDoubleClickAction?.(clickedId);
    });
  };

  return (
    <div data-testid='icon-container' style={{ position: 'relative' }}>
      <DesktopIcon
        id='blog'
        iconSrc='/blog.png'
        title='Blog'
        isSelected={clickedIdentifier === 'blog'}
        onClick={(e) => handleClick(e, 'blog')}
        className='shrink-0'
      />
      <DesktopIcon
        id='about'
        iconSrc='/about.png'
        title='About'
        isSelected={clickedIdentifier === 'about'}
        onClick={(e) => handleClick(e, 'about')}
        className='shrink-0'
      />
    </div>
  );
}

describe('useDoubleClick Integration', () => {
  it('[selection] should select and switch between icons', () => {
    // Arrange
    render(<DoubleClickTestComponent />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');
    const aboutIcon = screen.getByTestId('desktop-icon-about');

    // Act & Assert - Select blog
    fireEvent.click(blogIcon);
    expect(
      blogIcon.querySelector('.bg-\\[var\\(--color-window-title-active\\)\\]'),
    ).toBeInTheDocument();

    // Act & Assert - Switch to about
    fireEvent.click(aboutIcon);
    expect(
      aboutIcon.querySelector('.bg-\\[var\\(--color-window-title-active\\)\\]'),
    ).toBeInTheDocument();
    expect(
      blogIcon.querySelector('.bg-\\[var\\(--color-window-title-active\\)\\]'),
    ).not.toBeInTheDocument();
  });

  it('[doubleClick] should trigger action on double click', () => {
    // Arrange
    vi.useFakeTimers();
    const onDoubleClickAction = vi.fn();
    render(
      <DoubleClickTestComponent onDoubleClickAction={onDoubleClickAction} />,
    );
    const blogIcon = screen.getByTestId('desktop-icon-blog');

    // Act - First click
    fireEvent.click(blogIcon);

    // Assert - No action yet
    expect(onDoubleClickAction).not.toHaveBeenCalled();

    // Act - Second click within threshold
    vi.advanceTimersByTime(200);
    fireEvent.click(blogIcon);

    // Assert
    expect(onDoubleClickAction).toHaveBeenCalledWith('blog');
    expect(onDoubleClickAction).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('[state] should clear selection after double click', () => {
    // Arrange
    vi.useFakeTimers();
    render(<DoubleClickTestComponent onDoubleClickAction={vi.fn()} />);
    const blogIcon = screen.getByTestId('desktop-icon-blog');

    // Act & Assert - Select
    fireEvent.click(blogIcon);
    expect(
      blogIcon.querySelector('.bg-\\[var\\(--color-window-title-active\\)\\]'),
    ).toBeInTheDocument();

    // Act & Assert - Double click clears selection
    vi.advanceTimersByTime(200);
    fireEvent.click(blogIcon);
    expect(
      blogIcon.querySelector('.bg-\\[var\\(--color-window-title-active\\)\\]'),
    ).not.toBeInTheDocument();

    // Act & Assert - Can select again
    vi.advanceTimersByTime(100);
    fireEvent.click(blogIcon);
    expect(
      blogIcon.querySelector('.bg-\\[var\\(--color-window-title-active\\)\\]'),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('[scenario] should handle A-B-A-A pattern correctly', () => {
    // Arrange
    vi.useFakeTimers();
    const onDoubleClickAction = vi.fn();
    render(
      <DoubleClickTestComponent onDoubleClickAction={onDoubleClickAction} />,
    );
    const blogIcon = screen.getByTestId('desktop-icon-blog');
    const aboutIcon = screen.getByTestId('desktop-icon-about');

    // Act - A (blog)
    fireEvent.click(blogIcon);

    // Act - B (about) breaks sequence
    vi.advanceTimersByTime(100);
    fireEvent.click(aboutIcon);

    // Act - A (blog) starts new sequence
    vi.advanceTimersByTime(100);
    fireEvent.click(blogIcon);

    // Act - A (blog) completes double click
    vi.advanceTimersByTime(100);
    fireEvent.click(blogIcon);

    // Assert
    expect(onDoubleClickAction).toHaveBeenCalledWith('blog');
    expect(onDoubleClickAction).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
