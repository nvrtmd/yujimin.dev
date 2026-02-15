import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Taskbar } from './Taskbar';
import type { WindowState } from '@/models';
import {
  createMockCsrWindow,
  createMockSsgWindow,
} from '@/__tests__/utils/test-utils';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    ...props
  }: {
    alt: string;
    src: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

vi.mock('@/components/layout/StartMenu', () => ({
  StartMenu: ({
    menuRef,
    closeMenu,
  }: {
    menuRef: React.RefObject<HTMLDivElement | null>;
    closeMenu: () => void;
    onCloseAllWindows: () => void;
    onAppActivate: (appId: string) => void;
  }) => (
    <div ref={menuRef} data-testid='start-menu'>
      <button data-testid='menu-item' onClick={closeMenu}>
        Menu Item
      </button>
    </div>
  ),
}));

vi.mock('@/components/layout/Clock', () => ({
  Clock: () => <div data-testid='clock'>Clock</div>,
}));

vi.mock('@/components/common/PushLockButton', () => ({
  PushLockButton: vi
    .fn()
    .mockImplementation(
      ({
        isPushed,
        onClick,
        children,
        className,
        ref,
        ...props
      }: {
        isPushed: boolean;
        onClick?: () => void;
        children?: React.ReactNode;
        className?: string;
        ref?: React.RefObject<HTMLButtonElement | null>;
        'data-testid'?: string;
      }) => {
        const isStartButton =
          !props['data-testid']?.startsWith('taskbar-button-');
        return (
          <button
            ref={(el) => {
              if (ref && typeof ref === 'object') {
                (
                  ref as React.MutableRefObject<HTMLButtonElement | null>
                ).current = el;
              }
            }}
            onClick={onClick}
            className={className}
            data-pushed={isPushed}
            data-testid={isStartButton ? 'start-button' : props['data-testid']}
          >
            {children}
          </button>
        );
      },
    ),
}));

// =============================================================================
// Tests
// =============================================================================

describe('Taskbar', () => {
  const mockOnTaskbarButtonClick = vi.fn();
  const mockOnCloseAllWindows = vi.fn();
  const mockOnAppActivate = vi.fn();

  const defaultProps = {
    windowList: [] as WindowState[],
    frontmostOpenWindow: createMockCsrWindow(),
    onTaskbarButtonClick: mockOnTaskbarButtonClick,
    onCloseAllWindows: mockOnCloseAllWindows,
    onAppActivate: mockOnAppActivate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[start-toggle] should open menu on first click and close on second click', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Taskbar {...defaultProps} />);
    const startButton = screen.getByTestId('start-button');

    // Assert - Initial state: menu closed
    expect(screen.queryByTestId('start-menu')).not.toBeInTheDocument();
    expect(startButton).toHaveAttribute('data-pushed', 'false');

    // Act - First click
    await user.click(startButton);

    // Assert - Menu opened
    expect(screen.getByTestId('start-menu')).toBeInTheDocument();
    expect(startButton).toHaveAttribute('data-pushed', 'true');

    // Act - Second click
    await user.click(startButton);

    // Assert - Menu closed
    expect(screen.queryByTestId('start-menu')).not.toBeInTheDocument();
    expect(startButton).toHaveAttribute('data-pushed', 'false');
  });

  it('[outside-click] should close menu when clicking outside', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid='outside-area'>Outside</div>
        <Taskbar {...defaultProps} />
      </div>,
    );
    await user.click(screen.getByTestId('start-button'));
    expect(screen.getByTestId('start-menu')).toBeInTheDocument();

    // Act
    fireEvent.mouseDown(screen.getByTestId('outside-area'));

    // Assert
    await waitFor(() => {
      expect(screen.queryByTestId('start-menu')).not.toBeInTheDocument();
    });
  });

  it('[inside-click] should keep menu open when clicking inside menu or start button', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Taskbar {...defaultProps} />);
    await user.click(screen.getByTestId('start-button'));
    expect(screen.getByTestId('start-menu')).toBeInTheDocument();

    // Act & Assert - Click inside menu
    fireEvent.mouseDown(screen.getByTestId('start-menu'));
    expect(screen.getByTestId('start-menu')).toBeInTheDocument();

    // Act & Assert - Click on start button
    fireEvent.mouseDown(screen.getByTestId('start-button'));
    expect(screen.getByTestId('start-menu')).toBeInTheDocument();
  });

  it('[taskbar-click] should call onTaskbarButtonClick with corresponding window', async () => {
    // Arrange
    const user = userEvent.setup();
    const window1 = createMockCsrWindow({ id: 'about-me', title: 'About Me' });
    const window2 = createMockSsgWindow({ id: 'blog', title: 'Blog' });
    render(<Taskbar {...defaultProps} windowList={[window1, window2]} />);

    // Act & Assert - Click about button
    await user.click(screen.getByTestId('taskbar-button-about-me'));
    expect(mockOnTaskbarButtonClick).toHaveBeenCalledWith(window1);

    // Act & Assert - Click blog button
    await user.click(screen.getByTestId('taskbar-button-blog'));
    expect(mockOnTaskbarButtonClick).toHaveBeenCalledWith(window2);
  });

  it('[active-state] should highlight only the frontmost window button', () => {
    // Arrange
    const window1 = createMockCsrWindow({ id: 'about-me', title: 'About Me' });
    const window2 = createMockSsgWindow({ id: 'blog', title: 'Blog' });
    const windowList = [window1, window2];

    const { rerender } = render(
      <Taskbar
        {...defaultProps}
        windowList={windowList}
        frontmostOpenWindow={window1}
      />,
    );

    // Assert - window1 is active
    expect(screen.getByTestId('taskbar-button-about-me')).toHaveAttribute(
      'data-pushed',
      'true',
    );
    expect(screen.getByTestId('taskbar-button-blog')).toHaveAttribute(
      'data-pushed',
      'false',
    );

    // Act - Change frontmost to window2
    rerender(
      <Taskbar
        {...defaultProps}
        windowList={windowList}
        frontmostOpenWindow={window2}
      />,
    );

    // Assert - window2 is now active
    expect(screen.getByTestId('taskbar-button-about-me')).toHaveAttribute(
      'data-pushed',
      'false',
    );
    expect(screen.getByTestId('taskbar-button-blog')).toHaveAttribute(
      'data-pushed',
      'true',
    );
  });
});
