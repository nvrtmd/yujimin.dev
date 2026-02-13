import { render, screen, fireEvent } from '@/__tests__/utils/test-utils';
import { Window } from './Window';
import type { WindowState } from '@/models';
import type { BlogNavigation } from '@/hooks/useBlogNavigation';

// =============================================================================
// Mocks
// =============================================================================

// Mock useDoubleClick
const mockHandleDoubleClick = vi.fn();
vi.mock('@/hooks', () => ({
  useDoubleClick: () => ({
    handleDoubleClick: mockHandleDoubleClick,
    clickedIdentifier: null,
  }),
}));

// Mock next/navigation
const mockRouterBack = vi.fn();
const mockRouterForward = vi.fn();
let mockPathname = '/blog';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockRouterBack, forward: mockRouterForward }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
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

// =============================================================================
// Test Data
// =============================================================================

const createDefaultWindow = (
  overrides: Partial<WindowState> = {},
): WindowState => ({
  id: 'about',
  title: 'Test Window',
  iconSrc: '/test-icon.png',
  content: null,
  position: { x: 100, y: 100 },
  size: { width: 800, height: 600 },
  zIndex: 1,
  isMinimized: false,
  isMaximized: false,
  showAddressBar: false,
  canMinimize: true,
  canMaximize: true,
  ...overrides,
});

const createDefaultProps = (overrides = {}) => ({
  window: createDefaultWindow(),
  onBringToFront: vi.fn(),
  onClose: vi.fn(),
  onMinimize: vi.fn(),
  onToggleMaximize: vi.fn(),
  onDragMouseDown: vi.fn(),
  onResizeMouseDown: vi.fn(),
  blogNavigation: {
    canGoBack: false,
    canGoForward: false,
    goBack: vi.fn(),
    goForward: vi.fn(),
  } as BlogNavigation,
  isActive: true,
  isMobile: false,
  ...overrides,
});

// =============================================================================
// Tests
// =============================================================================

describe('Window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/blog';
  });

  // ==========================================================================
  // [render] Rendering Conditions
  // ==========================================================================

  describe('[render] Rendering Conditions', () => {
    it('should return null when isMinimized is true', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ isMinimized: true }),
      });
      const { container } = render(<Window {...props} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render the window container when not minimized', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      expect(screen.getByTestId('window-about')).toBeInTheDocument();
    });

    it('should display the window title text', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      expect(screen.getByText('Test Window')).toBeInTheDocument();
    });

    it('should display the window icon in the titlebar', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      const icon = screen.getByRole('img', { name: 'window page icon' });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/test-icon.png');
    });

    it('should render children content when provided', () => {
      const props = createDefaultProps();
      render(
        <Window {...props}>
          <div data-testid='child-content'>Child Content</div>
        </Window>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render window content from state when no children provided', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          content: <div data-testid='state-content'>State Content</div>,
        }),
      });
      render(<Window {...props} />);

      expect(screen.getByTestId('state-content')).toBeInTheDocument();
      expect(screen.getByText('State Content')).toBeInTheDocument();
    });

    it('should prefer children over content from window state', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          content: <div data-testid='state-content'>State Content</div>,
        }),
      });
      render(
        <Window {...props}>
          <div data-testid='child-content'>Child Content</div>
        </Window>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByTestId('state-content')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [button] Control Button Visibility
  // ==========================================================================

  describe('[button] Control Button Visibility', () => {
    it('should show minimize button when canMinimize is true', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      expect(screen.getByTestId('window-minimize-about')).toBeInTheDocument();
    });

    it('should hide minimize button when canMinimize is false', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ canMinimize: false }),
      });
      render(<Window {...props} />);

      expect(
        screen.queryByTestId('window-minimize-about'),
      ).not.toBeInTheDocument();
    });

    it('should show maximize button when canMaximize is true', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      expect(screen.getByTestId('window-maximize-about')).toBeInTheDocument();
    });

    it('should hide maximize button when canMaximize is false', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ canMaximize: false }),
      });
      render(<Window {...props} />);

      expect(
        screen.queryByTestId('window-maximize-about'),
      ).not.toBeInTheDocument();
    });

    it('should always show close button regardless of canMinimize/canMaximize', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          canMinimize: false,
          canMaximize: false,
        }),
      });
      render(<Window {...props} />);

      expect(screen.getByTestId('window-close-about')).toBeInTheDocument();
    });

    it('should show all three buttons when both canMinimize and canMaximize are true', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      expect(screen.getByTestId('window-minimize-about')).toBeInTheDocument();
      expect(screen.getByTestId('window-maximize-about')).toBeInTheDocument();
      expect(screen.getByTestId('window-close-about')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [menu] MenuBar Rendering
  // ==========================================================================

  describe('[menu] MenuBar Rendering', () => {
    it('should render all 7 menu items', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      const menuItems = [
        'File',
        'Edit',
        'View',
        'Go',
        'Favorite',
        'Tools',
        'Help',
      ];
      menuItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should render menu items in correct order', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      const expectedOrder = [
        'File',
        'Edit',
        'View',
        'Go',
        'Favorite',
        'Tools',
        'Help',
      ];
      const menuElements = expectedOrder.map((item) => screen.getByText(item));

      for (let i = 0; i < menuElements.length - 1; i++) {
        const current = menuElements[i];
        const next = menuElements[i + 1];
        expect(
          current.compareDocumentPosition(next) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      }
    });
  });

  // ==========================================================================
  // [address] AddressBar Conditional Rendering
  // ==========================================================================

  describe('[address] AddressBar Conditional Rendering', () => {
    it('should show AddressBar with navigation buttons for windows with showNavigationButtons=true', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          showAddressBar: true,
          showNavigationButtons: true,
        }),
      });
      render(<Window {...props} />);

      expect(screen.getByRole('img', { name: 'back' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'forward' })).toBeInTheDocument();
    });

    it('should show AddressBar without navigation buttons for windows with showNavigationButtons=false', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          showAddressBar: true,
          showNavigationButtons: false,
        }),
      });
      render(<Window {...props} />);

      expect(
        screen.queryByRole('img', { name: 'back' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('img', { name: 'forward' }),
      ).not.toBeInTheDocument();
    });

    it('should NOT show AddressBar for windows with showAddressBar=false', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ showAddressBar: false }),
      });
      render(<Window {...props} />);

      expect(
        screen.queryByRole('img', { name: 'back' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('img', { name: 'forward' }),
      ).not.toBeInTheDocument();
    });

    it('should disable back button when blogNavigation.canGoBack is false', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          showAddressBar: true,
          showNavigationButtons: true,
        }),
        blogNavigation: {
          canGoBack: false,
          canGoForward: true,
          goBack: vi.fn(),
          goForward: vi.fn(),
        },
      });
      render(<Window {...props} />);

      const backButton = screen
        .getByRole('img', { name: 'back' })
        .closest('button') as HTMLButtonElement;
      expect(backButton).toBeDisabled();
    });

    it('should enable back button when blogNavigation.canGoBack is true', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          showAddressBar: true,
          showNavigationButtons: true,
        }),
        blogNavigation: {
          canGoBack: true,
          canGoForward: false,
          goBack: vi.fn(),
          goForward: vi.fn(),
        },
      });
      render(<Window {...props} />);

      const backButton = screen
        .getByRole('img', { name: 'back' })
        .closest('button') as HTMLButtonElement;
      expect(backButton).not.toBeDisabled();
    });

    it('should display sub-path when pathname is under the window app', () => {
      mockPathname = '/blog/react-hooks';
      const props = createDefaultProps({
        window: createDefaultWindow({
          id: 'blog',
          showAddressBar: true,
          showNavigationButtons: true,
        }),
      });
      render(<Window {...props} />);

      expect(screen.getByText(/\/blog\/react-hooks/)).toBeInTheDocument();
    });

    it('should fall back to app root path when pathname is not under the window app', () => {
      mockPathname = '/about';
      const props = createDefaultProps({
        window: createDefaultWindow({
          id: 'blog',
          showAddressBar: true,
          showNavigationButtons: true,
        }),
      });
      render(<Window {...props} />);

      // Address bar should show /blog, not /about
      const addressTexts = screen.getAllByText(/\/blog/);
      expect(addressTexts.length).toBeGreaterThan(0);
    });

    it('should display the page icon in address bar', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          showAddressBar: true,
          showNavigationButtons: true,
        }),
      });
      render(<Window {...props} />);

      // Both TitleBar and AddressBar have a "window page icon" img
      // For windows with showAddressBar=true, there should be exactly 2 instances
      const pageIcons = screen.getAllByRole('img', {
        name: 'window page icon',
      });
      expect(pageIcons).toHaveLength(2);

      // The second one is in the AddressBar
      expect(pageIcons[1]).toHaveAttribute(
        'src',
        '/images/icons/window_page_img.webp',
      );
    });
  });

  // ==========================================================================
  // [resize] Resize Handles
  // ==========================================================================

  describe('[resize] Resize Handles', () => {
    it('should render all 8 resize handles when not maximized', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
      directions.forEach((direction) => {
        expect(
          screen.getByTestId(`resize-handle-${direction}-about`),
        ).toBeInTheDocument();
      });
    });

    it('should hide all resize handles when maximized', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ isMaximized: true }),
      });
      render(<Window {...props} />);

      const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
      directions.forEach((direction) => {
        expect(
          screen.queryByTestId(`resize-handle-${direction}-about`),
        ).not.toBeInTheDocument();
      });
    });

    it('should call onResizeMouseDown with correct direction for each handle', () => {
      const onResizeMouseDown = vi.fn();
      const props = createDefaultProps({ onResizeMouseDown });
      render(<Window {...props} />);

      const directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
      directions.forEach((direction, index) => {
        fireEvent.mouseDown(
          screen.getByTestId(`resize-handle-${direction}-about`),
        );
        expect(onResizeMouseDown).toHaveBeenCalledTimes(index + 1);
        expect(onResizeMouseDown).toHaveBeenLastCalledWith(
          expect.any(Object),
          direction,
        );
      });
    });
  });

  // ==========================================================================
  // [style] Style Application
  // ==========================================================================

  describe('[style] Style Application', () => {
    it('should apply desktop absolute positioning with correct coords', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({
          position: { x: 200, y: 150 },
          size: { width: 600, height: 400 },
        }),
      });
      render(<Window {...props} />);

      const windowElement = screen.getByTestId('window-about');
      expect(windowElement).toHaveStyle({ position: 'absolute' });
      expect(windowElement).toHaveStyle({ left: '200px' });
      expect(windowElement).toHaveStyle({ top: '150px' });
      expect(windowElement).toHaveStyle({ width: '600px' });
      expect(windowElement).toHaveStyle({ height: '400px' });
    });

    it('should apply correct zIndex for desktop (non-mobile)', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ zIndex: 5 }),
        isMobile: false,
      });
      render(<Window {...props} />);

      const windowElement = screen.getByTestId('window-about');
      expect(windowElement).toHaveStyle({ zIndex: 5 });
    });

    it('should apply mobile zIndex offset (zIndex + 9000) for mobile non-maximized', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ zIndex: 3, isMaximized: false }),
        isMobile: true,
      });
      render(<Window {...props} />);

      const windowElement = screen.getByTestId('window-about');
      expect(windowElement).toHaveStyle({ zIndex: 9003 });
    });

    it('should apply mobile fullscreen style when mobile and maximized', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ zIndex: 2, isMaximized: true }),
        isMobile: true,
      });
      render(<Window {...props} />);

      const windowElement = screen.getByTestId('window-about');
      expect(windowElement).toHaveStyle({ position: 'fixed' });
      expect(windowElement).toHaveStyle({ top: '0px' });
      expect(windowElement).toHaveStyle({ left: '0px' });
      expect(windowElement).toHaveStyle({ right: '0px' });
      expect(windowElement).toHaveStyle({ bottom: '38px' });
      expect(windowElement).toHaveStyle({ zIndex: 9002 });
    });

    it('should apply desktop style when maximized but NOT mobile', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ isMaximized: true }),
        isMobile: false,
      });
      render(<Window {...props} />);

      const windowElement = screen.getByTestId('window-about');
      expect(windowElement).toHaveStyle({ position: 'absolute' });
    });

    it('should apply active titlebar gradient when isActive is true', () => {
      const props = createDefaultProps({ isActive: true });
      render(<Window {...props} />);

      const titlebar = screen.getByTestId('window-titlebar-about');
      expect(titlebar.className).toContain('window-title-active');
    });

    it('should apply inactive titlebar style when isActive is false', () => {
      const props = createDefaultProps({ isActive: false });
      render(<Window {...props} />);

      const titlebar = screen.getByTestId('window-titlebar-about');
      expect(titlebar.className).toContain('window-title-inactive');
    });
  });

  // ==========================================================================
  // [click] Button Click Handlers
  // ==========================================================================

  describe('[click] Button Click Handlers', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      const props = createDefaultProps({ onClose });
      render(<Window {...props} />);

      fireEvent.click(screen.getByTestId('window-close-about'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onMinimize when minimize button is clicked', () => {
      const onMinimize = vi.fn();
      const props = createDefaultProps({ onMinimize });
      render(<Window {...props} />);

      fireEvent.click(screen.getByTestId('window-minimize-about'));
      expect(onMinimize).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleMaximize when maximize button is clicked', () => {
      const onToggleMaximize = vi.fn();
      const props = createDefaultProps({ onToggleMaximize });
      render(<Window {...props} />);

      fireEvent.click(screen.getByTestId('window-maximize-about'));
      expect(onToggleMaximize).toHaveBeenCalledTimes(1);
    });

    it('should call onBringToFront when window container is mousedown-ed', () => {
      const onBringToFront = vi.fn();
      const props = createDefaultProps({ onBringToFront });
      render(<Window {...props} />);

      fireEvent.mouseDown(screen.getByTestId('window-about'));
      expect(onBringToFront).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // [drag] Drag Handlers
  // ==========================================================================

  describe('[drag] Drag Handlers', () => {
    it('should call onDragMouseDown on titlebar mousedown when not maximized', () => {
      const onDragMouseDown = vi.fn();
      const props = createDefaultProps({ onDragMouseDown });
      render(<Window {...props} />);

      fireEvent.mouseDown(screen.getByTestId('window-titlebar-about'));
      expect(onDragMouseDown).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onDragMouseDown on titlebar mousedown when maximized', () => {
      const onDragMouseDown = vi.fn();
      const props = createDefaultProps({
        onDragMouseDown,
        window: createDefaultWindow({ isMaximized: true }),
      });
      render(<Window {...props} />);

      fireEvent.mouseDown(screen.getByTestId('window-titlebar-about'));
      expect(onDragMouseDown).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // [double-click] TitleBar Double Click
  // ==========================================================================

  describe('[double-click] TitleBar Double Click', () => {
    it('should call handleDoubleClick on titlebar click when canMaximize is true', () => {
      const props = createDefaultProps();
      render(<Window {...props} />);

      fireEvent.click(screen.getByTestId('window-titlebar-about'));
      expect(mockHandleDoubleClick).toHaveBeenCalledTimes(1);
      expect(mockHandleDoubleClick).toHaveBeenCalledWith(
        expect.any(Object),
        'Test Window',
        expect.any(Function),
      );
    });

    it('should NOT call handleDoubleClick on titlebar click when canMaximize is false', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ canMaximize: false }),
      });
      render(<Window {...props} />);

      fireEvent.click(screen.getByTestId('window-titlebar-about'));
      expect(mockHandleDoubleClick).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // [control-buttons] Event Propagation
  // ==========================================================================

  describe('[control-buttons] Mouse event behavior', () => {
    it('should stop propagation on control buttons mousedown', () => {
      const onDragMouseDown = vi.fn();
      const props = createDefaultProps({ onDragMouseDown });
      render(<Window {...props} />);

      // mouseDown on control buttons container should stop propagation
      // so that drag does not start when clicking buttons
      const closeButton = screen.getByTestId('window-close-about');
      const controlContainer = closeButton.parentElement as HTMLElement;

      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      const stopPropSpy = vi.spyOn(mouseDownEvent, 'stopPropagation');
      controlContainer.dispatchEvent(mouseDownEvent);

      expect(stopPropSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // [window-id] Uses correct window ID in test IDs
  // ==========================================================================

  describe('[window-id] Dynamic test IDs based on window ID', () => {
    it('should use window ID in container test ID', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ id: 'blog' }),
      });
      render(<Window {...props} />);

      expect(screen.getByTestId('window-blog')).toBeInTheDocument();
    });

    it('should use window ID in titlebar test ID', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ id: 'blog' }),
      });
      render(<Window {...props} />);

      expect(screen.getByTestId('window-titlebar-blog')).toBeInTheDocument();
    });

    it('should use window ID in control button test IDs', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ id: 'blog' }),
      });
      render(<Window {...props} />);

      expect(screen.getByTestId('window-close-blog')).toBeInTheDocument();
      expect(screen.getByTestId('window-minimize-blog')).toBeInTheDocument();
      expect(screen.getByTestId('window-maximize-blog')).toBeInTheDocument();
    });

    it('should use window ID in resize handle test IDs', () => {
      const props = createDefaultProps({
        window: createDefaultWindow({ id: 'blog' }),
      });
      render(<Window {...props} />);

      expect(screen.getByTestId('resize-handle-nw-blog')).toBeInTheDocument();
    });
  });
});
