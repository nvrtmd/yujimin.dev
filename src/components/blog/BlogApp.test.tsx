import { render, screen, within } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { BlogApp } from './BlogApp';
import type { Post } from '@/models';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/blog',
  useSearchParams: () => mockSearchParams,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock useMobile - will be overridden in specific tests
let mockIsMobile = false;
vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => mockIsMobile,
}));

// Mock useSelectedStyle
vi.mock('@/hooks/useSelectedStyle', () => ({
  useSelectedStyle: (isSelected: boolean) => ({
    container: isSelected
      ? 'bg-[var(--color-window-title-active)] text-white border-gray-200 border-dotted'
      : 'text-black border-transparent border-dotted',
    thumbnailWrapper: isSelected
      ? 'border-[var(--color-window-title-active)] bg-[var(--color-selection-overlay)]'
      : 'border-gray-400 bg-gray-200',
    imageTint: isSelected ? 'opacity-90 mix-blend-hard-light' : '',
    iconFill: isSelected ? 'text-white' : 'text-gray-500',
    textSecondary: isSelected ? 'text-gray-200' : 'text-gray-500',
  }),
}));

// Mock PostList component to verify filtering/sorting output
vi.mock('./PostList', () => ({
  PostList: ({
    posts,
    sortConfig,
    viewMode,
  }: {
    posts: Post[];
    sortConfig: { key: string; direction: string };
    viewMode: string;
  }) => (
    <div data-testid='post-list'>
      <span data-testid='post-count'>{posts.length}</span>
      <span data-testid='sort-key'>{sortConfig.key}</span>
      <span data-testid='sort-direction'>{sortConfig.direction}</span>
      <span data-testid='view-mode'>{viewMode}</span>
      {posts.map((post) => (
        <div key={post.slug} data-testid={`post-${post.slug}`}>
          {post.title}
        </div>
      ))}
    </div>
  ),
}));

// Test data
const mockPosts: Post[] = [
  {
    slug: 'react-tutorial',
    title: 'React Tutorial',
    summary: 'Learn React',
    date: '2024-01-15',
    category: 'React',
  },
  {
    slug: 'typescript-guide',
    title: 'TypeScript Guide',
    summary: 'Learn TypeScript',
    date: '2024-01-10',
    category: 'TypeScript',
  },
  {
    slug: 'advanced-react',
    title: 'Advanced React',
    summary: 'Advanced topics',
    date: '2024-01-20',
    category: 'React',
  },
];

const mockCategories = ['React', 'TypeScript'];

describe('BlogApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockIsMobile = false;
  });

  // ==========================================================================
  // [render] Initial Rendering
  // ==========================================================================

  describe('Initial Rendering', () => {
    it('[render] should render the Blog root node in sidebar', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      expect(within(sidebar).getByText('Blog')).toBeInTheDocument();
    });

    it('[render] should render categories with counts', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByText('React (2)')).toBeInTheDocument();
      expect(screen.getByText('TypeScript (1)')).toBeInTheDocument();
    });

    it('[render] should render PostList with correct props', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-list')).toBeInTheDocument();
      expect(screen.getByTestId('post-count')).toHaveTextContent('3');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('gallery');
    });

    it('[render] should render status bar with object count', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByText('3 object(s)')).toBeInTheDocument();
    });

    it('[render] should render "Blog" label in status bar', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const statusBar = screen.getByText('Blog', {
        selector: 'span.border',
      });
      expect(statusBar).toBeInTheDocument();
    });

    it('[render] should render Categories toggle button', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(
        screen.getByRole('button', { name: 'Toggle Sidebar' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('[render] should render view mode toggle buttons', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('view-list-button')).toBeInTheDocument();
      expect(screen.getByTestId('view-gallery-button')).toBeInTheDocument();
    });

    it('[render] should not render sort headers in gallery mode (default)', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.queryByTestId('sort-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sort-date')).not.toBeInTheDocument();
    });

    it('[render] should render sort headers in list mode', () => {
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('sort-title')).toBeInTheDocument();
      expect(screen.getByTestId('sort-summary')).toBeInTheDocument();
      expect(screen.getByTestId('sort-date')).toBeInTheDocument();
      expect(screen.getByTestId('sort-category')).toBeInTheDocument();
    });

    it('[render] should render 4 sort headers with correct labels', () => {
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('[render] should handle empty posts array', () => {
      render(<BlogApp posts={[]} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('0');
      expect(screen.getByText('0 object(s)')).toBeInTheDocument();
      expect(screen.getByText('React (0)')).toBeInTheDocument();
      expect(screen.getByText('TypeScript (0)')).toBeInTheDocument();
    });

    it('[render] should handle empty categories array', () => {
      render(<BlogApp posts={mockPosts} initialCategories={[]} />);

      // Blog root still renders in sidebar
      const sidebar = screen.getByTestId('blog-sidebar');
      expect(within(sidebar).getByText('Blog')).toBeInTheDocument();
      // No category items in sidebar (posts still render with their data)
      expect(within(sidebar).queryByText(/React/)).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [view] View Mode Toggle
  // ==========================================================================

  describe('View Mode Toggle', () => {
    it('[view] should default to gallery mode when no view param', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('view-mode')).toHaveTextContent('gallery');
    });

    it('[view] should read list mode from searchParams', () => {
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
    });

    it('[view] should treat any non-list view param as gallery', () => {
      mockSearchParams = new URLSearchParams('view=invalid');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('view-mode')).toHaveTextContent('gallery');
    });

    it('[view] should push list view URL when list button clicked', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      await user.click(screen.getByTestId('view-list-button'));

      expect(mockPush).toHaveBeenCalledWith('/blog?view=list');
    });

    it('[view] should push gallery view URL when gallery button clicked', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      await user.click(screen.getByTestId('view-gallery-button'));

      expect(mockPush).toHaveBeenCalledWith('/blog?view=gallery');
    });

    it('[view] should preserve category param when changing view', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('category=react');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      await user.click(screen.getByTestId('view-list-button'));

      expect(mockPush).toHaveBeenCalledWith('/blog?category=react&view=list');
    });
  });

  // ==========================================================================
  // [filter] Category Filtering Algorithm
  // ==========================================================================

  describe('Filtering Logic', () => {
    it('[filter] should show all posts when category is "all"', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('3');
    });

    it('[filter] should filter posts by selected category', () => {
      mockSearchParams = new URLSearchParams('category=react');

      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('2');
      expect(screen.getByTestId('post-react-tutorial')).toBeInTheDocument();
      expect(screen.getByTestId('post-advanced-react')).toBeInTheDocument();
      expect(
        screen.queryByTestId('post-typescript-guide'),
      ).not.toBeInTheDocument();
    });

    it('[filter] should filter case-insensitively', () => {
      mockSearchParams = new URLSearchParams('category=TYPESCRIPT');

      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('1');
      expect(screen.getByTestId('post-typescript-guide')).toBeInTheDocument();
    });

    it('[filter] should update status bar count after filtering', () => {
      const { rerender } = render(
        <BlogApp posts={mockPosts} initialCategories={mockCategories} />,
      );
      expect(screen.getByText('3 object(s)')).toBeInTheDocument();

      mockSearchParams = new URLSearchParams('category=react');
      rerender(
        <BlogApp posts={mockPosts} initialCategories={mockCategories} />,
      );

      expect(screen.getByText('2 object(s)')).toBeInTheDocument();
    });

    it('[filter] should return empty when category matches nothing', () => {
      mockSearchParams = new URLSearchParams('category=nonexistent');

      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('0');
      expect(screen.getByText('0 object(s)')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [sort] Sorting Algorithm
  // ==========================================================================

  describe('Sorting Logic', () => {
    it('[sort] should default to date descending', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('sort-key')).toHaveTextContent('date');
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('desc');
    });

    it('[sort] should toggle sort direction when clicking same header', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('sort-key')).toHaveTextContent('date');
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('desc');

      const dateHeader = screen.getByText('Date');

      // First click: desc -> asc
      await user.click(dateHeader);
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('asc');

      // Second click: asc -> desc
      await user.click(dateHeader);
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('desc');
    });

    it('[sort] should reset to asc when clicking different header', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('sort-key')).toHaveTextContent('date');
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('desc');

      const titleHeader = screen.getByText('Title');
      await user.click(titleHeader);

      expect(screen.getByTestId('sort-key')).toHaveTextContent('title');
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('asc');
    });

    it('[sort] should maintain sort state across re-renders', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('view=list');
      const { rerender } = render(
        <BlogApp posts={mockPosts} initialCategories={mockCategories} />,
      );

      const titleHeader = screen.getByText('Title');
      await user.click(titleHeader);

      expect(screen.getByTestId('sort-key')).toHaveTextContent('title');
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('asc');

      rerender(
        <BlogApp posts={mockPosts} initialCategories={mockCategories} />,
      );

      expect(screen.getByTestId('sort-key')).toHaveTextContent('title');
      expect(screen.getByTestId('sort-direction')).toHaveTextContent('asc');
    });

    it('[sort] should handle all 4 sort headers', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Click Title
      await user.click(screen.getByText('Title'));
      expect(screen.getByTestId('sort-key')).toHaveTextContent('title');

      // Click Summary
      await user.click(screen.getByText('Summary'));
      expect(screen.getByTestId('sort-key')).toHaveTextContent('summary');

      // Click Category
      await user.click(screen.getByText('Category'));
      expect(screen.getByTestId('sort-key')).toHaveTextContent('category');

      // Click Date
      await user.click(screen.getByText('Date'));
      expect(screen.getByTestId('sort-key')).toHaveTextContent('date');
    });
  });

  // ==========================================================================
  // [sidebar] 3-State Sidebar State Transition
  // ==========================================================================

  describe('Sidebar State Transition', () => {
    it('[sidebar] should have sidebar visible by default on desktop (via CSS)', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      // null state: desktop uses 'hidden sm:flex' (shown on sm+)
      expect(sidebar.className).toContain('hidden sm:flex');
    });

    it('[sidebar] should have sidebar hidden by default on mobile (via CSS)', () => {
      mockIsMobile = true;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      // null state: mobile uses 'hidden sm:flex' (hidden on small screens)
      expect(sidebar.className).toContain('hidden sm:flex');
    });

    it('[sidebar] should have aria-hidden based on isSidebarVisible', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      // On desktop, null state => isSidebarVisible = !isMobile = true
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    });

    it('[sidebar] should have aria-hidden true on mobile by default', () => {
      mockIsMobile = true;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      // On mobile, null state => isSidebarVisible = !isMobile = false
      expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    });

    it('[sidebar] should toggle to visible when clicked from null on mobile', async () => {
      const user = userEvent.setup();
      mockIsMobile = true;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });

      await user.click(toggleButton);

      const sidebar = screen.getByTestId('blog-sidebar');
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('[sidebar] should toggle to hidden when clicked from null on desktop', async () => {
      const user = userEvent.setup();
      mockIsMobile = false;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });

      await user.click(toggleButton);

      const sidebar = screen.getByTestId('blog-sidebar');
      expect(sidebar).toHaveAttribute('aria-hidden', 'true');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('[sidebar] should toggle between visible and hidden after initial click', async () => {
      const user = userEvent.setup();
      mockIsMobile = true;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });
      const sidebar = screen.getByTestId('blog-sidebar');

      // null -> visible (mobile)
      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // visible -> hidden
      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('aria-hidden', 'true');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // hidden -> visible
      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('[sidebar] should use correct CSS class after toggling (not CSS-based)', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });
      const sidebar = screen.getByTestId('blog-sidebar');

      // Before click: CSS-based (null state)
      expect(sidebar.className).toContain('hidden sm:flex');

      // After click: explicit state
      await user.click(toggleButton);
      expect(sidebar.className).toContain('hidden');
      expect(sidebar.className).not.toContain('sm:flex');
    });

    it('[sidebar] should have aria-controls linking to blog-sidebar', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });
      expect(toggleButton).toHaveAttribute('aria-controls', 'blog-sidebar');
    });

    it('[sidebar] should have blog-sidebar id on sidebar element', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      expect(sidebar).toHaveAttribute('id', 'blog-sidebar');
    });
  });

  // ==========================================================================
  // [tree] Tree Expansion
  // ==========================================================================

  describe('Tree Expansion', () => {
    it('[tree] should start with blog root expanded (categories visible)', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Categories should be visible since root is expanded
      expect(screen.getByText('React (2)')).toBeInTheDocument();
      expect(screen.getByText('TypeScript (1)')).toBeInTheDocument();
    });

    it('[tree] should show "-" toggle when root is expanded', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // The TreeToggle for root shows "-" when expanded
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('[tree] should collapse categories when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Click the "-" toggle to collapse
      const toggle = screen.getByText('-');
      await user.click(toggle);

      // Categories should be hidden
      expect(screen.queryByText('React (2)')).not.toBeInTheDocument();
      expect(screen.queryByText('TypeScript (1)')).not.toBeInTheDocument();
    });

    it('[tree] should show "+" toggle when root is collapsed', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Collapse
      await user.click(screen.getByText('-'));

      // Should show "+"
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.queryByText('-')).not.toBeInTheDocument();
    });

    it('[tree] should re-expand when toggle is clicked again', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Collapse
      await user.click(screen.getByText('-'));
      expect(screen.queryByText('React (2)')).not.toBeInTheDocument();

      // Re-expand
      await user.click(screen.getByText('+'));
      expect(screen.getByText('React (2)')).toBeInTheDocument();
      expect(screen.getByText('TypeScript (1)')).toBeInTheDocument();
    });

    it('[tree] should not collapse root when clicking Blog text (only toggle)', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Click "Blog" text in the sidebar (not the toggle)
      const sidebar = screen.getByTestId('blog-sidebar');
      await user.click(within(sidebar).getByText('Blog'));

      // Categories should still be visible (clicking Blog selects all, doesn't collapse)
      expect(screen.getByText('React (2)')).toBeInTheDocument();
      expect(screen.getByText('TypeScript (1)')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [category] Category Selection
  // ==========================================================================

  describe('Category Selection', () => {
    it('[category] should select "all" by default (Blog root)', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Blog root should have selected style (checked via useSelectedStyle mock)
      const sidebar = screen.getByTestId('blog-sidebar');
      const blogRoot = within(sidebar)
        .getByText('Blog')
        .closest('div[class*="flex items-center"]');
      expect(blogRoot?.className).toContain(
        'bg-[var(--color-window-title-active)]',
      );
    });

    it('[category] should navigate when category is clicked', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      await user.click(screen.getByText('React (2)'));

      expect(mockPush).toHaveBeenCalledWith('/blog?category=react');
    });

    it('[category] should delete category param when "all" (Blog root) is selected', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('category=react');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Click Blog root in sidebar to select "all"
      const sidebar = screen.getByTestId('blog-sidebar');
      await user.click(within(sidebar).getByText('Blog'));

      // Should push URL without category param
      expect(mockPush).toHaveBeenCalledWith('/blog?');
    });

    it('[category] should preserve view param when selecting category', async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams('view=list');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      await user.click(screen.getByText('TypeScript (1)'));

      expect(mockPush).toHaveBeenCalledWith(
        '/blog?view=list&category=typescript',
      );
    });

    it('[category] should highlight selected category', () => {
      mockSearchParams = new URLSearchParams('category=react');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // React category should be selected
      const reactCategory = screen
        .getByText('React (2)')
        .closest('div[class*="flex items-center"]');
      expect(reactCategory?.className).toContain(
        'bg-[var(--color-window-title-active)]',
      );

      // TypeScript should NOT be selected
      const tsCategory = screen
        .getByText('TypeScript (1)')
        .closest('div[class*="flex items-center"]');
      expect(tsCategory?.className).not.toContain(
        'bg-[var(--color-window-title-active)]',
      );
    });

    it('[category] should close sidebar on mobile when category is clicked', async () => {
      const user = userEvent.setup();
      mockIsMobile = true;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // First open sidebar
      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });
      await user.click(toggleButton);

      const sidebar = screen.getByTestId('blog-sidebar');
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');

      // Click a category
      await user.click(screen.getByText('React (2)'));

      // Sidebar should close on mobile
      expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    });

    it('[category] should NOT close sidebar on desktop when category is clicked', async () => {
      const user = userEvent.setup();
      mockIsMobile = false;
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const sidebar = screen.getByTestId('blog-sidebar');
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');

      // Click a category
      await user.click(screen.getByText('React (2)'));

      // Sidebar should remain open on desktop
      expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    });
  });

  // ==========================================================================
  // [icon] Icon Rendering
  // ==========================================================================

  describe('Icon Rendering', () => {
    it('[icon] should render folder images for category items', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Each category TreeItem uses folder_img.png
      const folderImgs = document.querySelectorAll(
        'img[src="/images/icons/folder_img.png"]',
      );
      expect(folderImgs.length).toBeGreaterThan(0);
    });

    it('[icon] should render folder image for Blog root node', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // Blog root TreeItem uses folder_img.png
      const folderImgs = document.querySelectorAll(
        'img[src="/images/icons/folder_img.png"]',
      );
      // Blog root + each category all use the same folder image
      expect(folderImgs.length).toBeGreaterThanOrEqual(1);
    });

    it('[icon] should render SVG icons in view toggle buttons', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const listButton = screen.getByTestId('view-list-button');
      const galleryButton = screen.getByTestId('view-gallery-button');

      expect(listButton.querySelector('svg')).toBeInTheDocument();
      expect(galleryButton.querySelector('svg')).toBeInTheDocument();
    });

    it('[icon] should render FolderIcon with toggle variant in Categories button', () => {
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const foldersButton = screen.getByRole('button', {
        name: 'Toggle Sidebar',
      });
      expect(foldersButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [url] URL Parameter Generation
  // ==========================================================================

  describe('URL Parameter Generation', () => {
    it('[url] should generate correct URL when category selected', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const reactCategory = screen.getByText('React (2)');
      await user.click(reactCategory);

      expect(mockPush).toHaveBeenCalledWith('/blog?category=react');
    });

    it('[url] should generate correct URL when view mode changed', async () => {
      const user = userEvent.setup();
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      const galleryButton = screen.getByTestId('view-gallery-button');
      await user.click(galleryButton);

      expect(mockPush).toHaveBeenCalledWith('/blog?view=gallery');
    });

    it('[url] should read initial category from searchParams', () => {
      mockSearchParams = new URLSearchParams('category=typescript');

      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('1');
    });

    it('[url] should read initial view mode from searchParams', () => {
      mockSearchParams = new URLSearchParams('view=list');

      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [edge] Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('[edge] should handle category with zero posts', () => {
      const categories = ['React', 'TypeScript', 'Rust'];
      render(<BlogApp posts={mockPosts} initialCategories={categories} />);

      expect(screen.getByText('Rust (0)')).toBeInTheDocument();
    });

    it('[edge] should handle single post', () => {
      const singlePost: Post[] = [
        {
          slug: 'single',
          title: 'Single Post',
          summary: 'One post',
          date: '2024-01-01',
          category: 'React',
        },
      ];
      render(<BlogApp posts={singlePost} initialCategories={mockCategories} />);

      expect(screen.getByTestId('post-count')).toHaveTextContent('1');
      expect(screen.getByText('1 object(s)')).toBeInTheDocument();
      expect(screen.getByText('React (1)')).toBeInTheDocument();
      expect(screen.getByText('TypeScript (0)')).toBeInTheDocument();
    });

    it('[edge] should handle multiple searchParams together', () => {
      mockSearchParams = new URLSearchParams('view=list&category=react');
      render(<BlogApp posts={mockPosts} initialCategories={mockCategories} />);

      // List mode active
      expect(screen.getByText('Title')).toBeInTheDocument();
      // React filtered
      expect(screen.getByTestId('post-count')).toHaveTextContent('2');
    });
  });
});
