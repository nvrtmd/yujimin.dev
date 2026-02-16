import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { StartMenu } from './StartMenu';
import { vi } from 'vitest';
import { RefObject, createRef } from 'react';

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

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// =============================================================================
// Tests
// =============================================================================

describe('StartMenu', () => {
  const mockCloseMenu = vi.fn();
  const mockOnCloseAllWindows = vi.fn();
  const mockOnAppActivate = vi.fn();
  const mockMenuRef: RefObject<HTMLDivElement | null> = createRef();

  const defaultProps = {
    menuRef: mockMenuRef,
    closeMenu: mockCloseMenu,
    onCloseAllWindows: mockOnCloseAllWindows,
    onAppActivate: mockOnAppActivate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Home Click
  // ===========================================================================

  it('[home-click] should close all windows and close menu when Home is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StartMenu {...defaultProps} />);

    // Act
    await user.click(screen.getByText('Home'));

    // Assert
    expect(mockOnCloseAllWindows).toHaveBeenCalledTimes(1);
    expect(mockCloseMenu).toHaveBeenCalledTimes(1);
  });

  // ===========================================================================
  // Blog Click Scenarios
  // ===========================================================================

  it('[blog-click] should call onAppActivate with "blog" and close menu when Blog is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StartMenu {...defaultProps} />);

    // Act
    await user.click(screen.getByText('Blog'));

    // Assert
    expect(mockOnAppActivate).toHaveBeenCalledTimes(1);
    expect(mockOnAppActivate).toHaveBeenCalledWith('blog');
    expect(mockCloseMenu).toHaveBeenCalledTimes(1);
  });

  it('[blog-click] should close menu after activating blog', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<StartMenu {...defaultProps} />);

    // Act
    await user.click(screen.getByText('Blog'));

    // Assert - onAppActivate should be called before closeMenu
    const onAppActivateOrder = mockOnAppActivate.mock.invocationCallOrder[0];
    const closeMenuOrder = mockCloseMenu.mock.invocationCallOrder[0];
    expect(onAppActivateOrder).toBeLessThan(closeMenuOrder);
  });

  // ===========================================================================
  // Source Code Click
  // ===========================================================================

  it('[source-click] should open GitHub in new tab when Source Code is clicked', () => {
    // Arrange
    render(<StartMenu {...defaultProps} />);

    // Assert
    const sourceCodeLink = screen
      .getByText('Source Code')
      .closest('a') as HTMLAnchorElement;
    expect(sourceCodeLink).toHaveAttribute(
      'href',
      'https://github.com/nvrtmd/yujimin.dev',
    );
    expect(sourceCodeLink).toHaveAttribute('target', '_blank');
    expect(sourceCodeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // ===========================================================================
  // Shut Down Click
  // ===========================================================================

  it('[shutdown-click] should call window.close when Shut Down is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockWindowClose = vi.fn();
    const originalClose = window.close;
    window.close = mockWindowClose;

    render(<StartMenu {...defaultProps} />);

    // Act
    await user.click(screen.getByText('Shut Down'));

    // Assert
    expect(mockWindowClose).toHaveBeenCalledTimes(1);

    // Cleanup
    window.close = originalClose;
  });

  // ===========================================================================
  // Rendering
  // ===========================================================================

  it('[render] should render all menu items with correct icons', () => {
    // Arrange
    render(<StartMenu {...defaultProps} />);

    // Assert
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByAltText('Home')).toHaveAttribute(
      'src',
      '/images/icons/home_img.webp',
    );

    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByAltText('Blog')).toHaveAttribute(
      'src',
      '/images/icons/blog_img.webp',
    );

    expect(screen.getByText('Source Code')).toBeInTheDocument();
    expect(screen.getByAltText('Source Code')).toHaveAttribute(
      'src',
      '/images/icons/source_code_img.webp',
    );

    expect(screen.getByText('Shut Down')).toBeInTheDocument();
    expect(screen.getByAltText('Shut Down')).toHaveAttribute(
      'src',
      '/images/icons/power_img.webp',
    );
  });

  it('[render] should display username in sidebar', () => {
    // Arrange
    render(<StartMenu {...defaultProps} />);

    // Assert
    expect(screen.getByText('yujimin.dev')).toBeInTheDocument();
  });
});
