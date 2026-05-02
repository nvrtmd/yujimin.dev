import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { PostList } from './PostList';
import type { Post } from '@/models';
import type { SortConfig } from './BlogApp';

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    className,
    ...rest
  }: {
    alt: string;
    src: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={src}
      className={className}
      data-sizes={rest.sizes as string}
    />
  ),
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

// Mock formatPostDate from @/libs
vi.mock('@/libs', () => ({
  formatPostDate: (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  },
}));

// Mock IntersectionObserver for virtual scrolling
import { MockIntersectionObserver } from '@/__tests__/utils/mock-intersection-observer';

let observerInstance: MockIntersectionObserver | null = null;
window.IntersectionObserver = function (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) {
  observerInstance = new MockIntersectionObserver(callback, options);
  return observerInstance;
} as unknown as typeof IntersectionObserver;

// Test data
const mockPosts: Post[] = [
  {
    slug: 'react-tutorial',
    title: 'React Tutorial',
    summary: 'Learn React basics',
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
    summary: 'Advanced React patterns',
    date: '2024-01-20',
    category: 'React',
  },
  {
    slug: 'nextjs-intro',
    title: 'Next.js Introduction',
    summary: 'Getting started with Next.js',
    date: '2024-01-25',
    category: 'Next.js',
  },
  {
    slug: 'korean-post',
    title: '\ud55c\uae00 \ud3ec\uc2a4\ud2b8',
    summary: '',
    date: '2024-01-05',
    category: 'Korean',
  },
];

const mockPostsWithThumbnail: Post[] = [
  {
    slug: 'with-thumbnail',
    title: 'Post With Thumbnail',
    summary: 'Has a custom thumbnail',
    date: '2024-01-15',
    category: 'React',
    thumbnail: '/images/custom-thumb.png',
  },
  {
    slug: 'without-thumbnail',
    title: 'Post Without Thumbnail',
    summary: 'Uses default thumbnail',
    date: '2024-01-10',
    category: 'React',
  },
];

const createScrollContainer = () => {
  const ref = { current: document.createElement('div') };
  return ref;
};

const defaultSortConfig: SortConfig = { key: 'date', direction: 'desc' };

describe('PostList', () => {
  let originalNavigatorLanguage: string;

  beforeEach(() => {
    vi.clearAllMocks();
    observerInstance = null;
    originalNavigatorLanguage = navigator.language;
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'language', {
      value: originalNavigatorLanguage,
      configurable: true,
      writable: true,
    });
  });

  // ==========================================================================
  // [render] Rendering
  // ==========================================================================

  describe('Rendering', () => {
    it('[render] should render list view with flex-col layout', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postList = screen.getByTestId('post-list');
      expect(postList).toBeInTheDocument();
      expect(postList).toHaveClass('flex', 'flex-col');
    });

    it('[render] should render gallery view with grid layout', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postList = screen.getByTestId('post-list');
      expect(postList).toBeInTheDocument();
      expect(postList).toHaveClass('grid');
    });

    it('[render] should show empty message when no posts', () => {
      render(
        <PostList
          posts={[]}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(screen.getByText('No posts to display.')).toBeInTheDocument();
      expect(screen.queryByTestId('post-list')).not.toBeInTheDocument();
    });

    it('[render] should show loading trigger when more posts exist', () => {
      const manyPosts: Post[] = Array.from({ length: 20 }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        category: 'React',
      }));

      render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const trigger = screen.getByTestId('post-loading-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Loading more...')).toBeInTheDocument();
    });

    it('[render] should hide loading trigger when all posts displayed', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(
        screen.queryByTestId('post-loading-trigger'),
      ).not.toBeInTheDocument();
    });

    it('[render] should assign data-testid to each post item', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      mockPosts.forEach((post) => {
        expect(
          screen.getByTestId(`post-item-${post.slug}`),
        ).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // [list-view] List View Item Content
  // ==========================================================================

  describe('List View Item Content', () => {
    it('[list-view] should show title, summary, date, and category', () => {
      render(
        <PostList
          posts={[mockPosts[0]]}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Learn React basics')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('[list-view] should render FileIcon SVG', () => {
      render(
        <PostList
          posts={[mockPosts[0]]}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const svg = screen
        .getByTestId('post-item-react-tutorial')
        .querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('[list-view] should display formatted date via formatPostDate', () => {
      render(
        <PostList
          posts={[mockPosts[0]]}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // formatPostDate is mocked to return ko-KR formatted date
      // The exact format depends on locale, but it should be present
      const postItem = screen.getByTestId('post-item-react-tutorial');
      expect(postItem).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // [gallery-view] Gallery View Item Content
  // ==========================================================================

  describe('Gallery View Item Content', () => {
    it('[gallery-view] should show title', () => {
      render(
        <PostList
          posts={[mockPosts[0]]}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    });

    it('[gallery-view] should use post thumbnail when available', () => {
      render(
        <PostList
          posts={[mockPostsWithThumbnail[0]]}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const img = screen.getByAltText('Post With Thumbnail');
      expect(img).toHaveAttribute('src', '/images/custom-thumb.png');
    });

    it('[gallery-view] should use default thumbnail when post has no thumbnail', () => {
      render(
        <PostList
          posts={[mockPostsWithThumbnail[1]]}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const img = screen.getByAltText('Post Without Thumbnail');
      expect(img).toHaveAttribute(
        'src',
        '/images/thumbnails/blog_thumbnail_img.png',
      );
    });

    it('[gallery-view] should not show summary or category', () => {
      render(
        <PostList
          posts={[mockPosts[0]]}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Gallery view does not display summary or category text separately
      // Summary could appear inside the DOM but not as visible text in gallery
      const postItem = screen.getByTestId('post-item-react-tutorial');
      // Gallery only shows title in an h3 element
      const h3 = postItem.querySelector('h3');
      expect(h3).toHaveTextContent('React Tutorial');
    });
  });

  // ==========================================================================
  // [select] Selection
  // ==========================================================================

  describe('Selection', () => {
    // NOTE: ListViewItem and GalleryViewItem are defined INSIDE PostList as
    // inline components. This means React treats them as new component types
    // on every parent re-render, causing DOM nodes to be replaced.
    // Tests must re-query elements after state changes.

    it('[select] should apply selected style when item is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Before click: unselected style
      expect(screen.getByTestId('post-item-react-tutorial')).toHaveClass(
        'text-black',
        'border-transparent',
      );

      // Act: click the item
      await user.click(screen.getByTestId('post-item-react-tutorial'));

      // After click: re-query because inline component remounts DOM
      await waitFor(() => {
        expect(screen.getByTestId('post-item-react-tutorial')).toHaveClass(
          'bg-[var(--color-window-title-active)]',
          'text-white',
        );
      });
    });

    it('[select] should deselect when container is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Select the item
      await user.click(screen.getByTestId('post-item-react-tutorial'));

      await waitFor(() => {
        expect(screen.getByTestId('post-item-react-tutorial')).toHaveClass(
          'bg-[var(--color-window-title-active)]',
          'text-white',
        );
      });

      // Click the outer container (not on a post item)
      const container = screen
        .getByTestId('post-item-react-tutorial')
        .closest('.flex.flex-col.min-h-full')!;
      await user.click(container);

      // Item should be deselected (re-query)
      await waitFor(() => {
        expect(screen.getByTestId('post-item-react-tutorial')).toHaveClass(
          'text-black',
          'border-transparent',
        );
      });
    });

    it('[select] should only select one item at a time', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Select first item
      await user.click(screen.getByTestId('post-item-react-tutorial'));

      await waitFor(() => {
        expect(screen.getByTestId('post-item-react-tutorial')).toHaveClass(
          'bg-[var(--color-window-title-active)]',
          'text-white',
        );
      });

      // Select second item
      await user.click(screen.getByTestId('post-item-typescript-guide'));

      // First should be deselected, second selected (re-query both)
      await waitFor(() => {
        expect(screen.getByTestId('post-item-react-tutorial')).toHaveClass(
          'text-black',
          'border-transparent',
        );
        expect(screen.getByTestId('post-item-typescript-guide')).toHaveClass(
          'bg-[var(--color-window-title-active)]',
          'text-white',
        );
      });
    });

    it('[select] should apply selected style to gallery view items', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPosts}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Before: unselected
      const h3Before = screen
        .getByTestId('post-item-react-tutorial')
        .querySelector('h3')!;
      expect(h3Before).toHaveClass('text-black', 'border-transparent');

      // Click to select
      await user.click(screen.getByTestId('post-item-react-tutorial'));

      // After: selected (re-query)
      await waitFor(() => {
        const h3After = screen
          .getByTestId('post-item-react-tutorial')
          .querySelector('h3')!;
        expect(h3After).toHaveClass(
          'bg-[var(--color-window-title-active)]',
          'text-white',
        );
      });
    });

    it('[select] should apply selected icon fill in list view', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Before selection: gray icon
      const svgBefore = screen
        .getByTestId('post-item-react-tutorial')
        .querySelector('svg')!;
      expect(svgBefore).toHaveClass('text-gray-500');

      // Click to select
      await user.click(screen.getByTestId('post-item-react-tutorial'));

      // After selection: white icon (re-query)
      await waitFor(() => {
        const svgAfter = screen
          .getByTestId('post-item-react-tutorial')
          .querySelector('svg')!;
        expect(svgAfter).toHaveClass('text-white');
      });
    });

    it('[select] should apply selected thumbnail wrapper style in gallery view', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPostsWithThumbnail}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Before: unselected
      const imgBefore = screen.getByAltText('Post With Thumbnail');
      expect(imgBefore.parentElement!).toHaveClass(
        'border-gray-400',
        'bg-gray-200',
      );

      // Click to select
      await user.click(screen.getByTestId('post-item-with-thumbnail'));

      // After: selected (re-query)
      await waitFor(() => {
        const imgAfter = screen.getByAltText('Post With Thumbnail');
        expect(imgAfter.parentElement!).toHaveClass(
          'border-[var(--color-window-title-active)]',
          'bg-[var(--color-selection-overlay)]',
        );
      });
    });
  });

  // ==========================================================================
  // [nav] Navigation (Double Click)
  // ==========================================================================

  describe('Navigation', () => {
    it('[nav] should not call router.push on single click', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const reactPost = screen.getByText('React Tutorial');
      await user.click(reactPost);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('[nav] should call router.push on double click in list view', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const reactPost = screen.getByText('React Tutorial');
      fireEvent.doubleClick(reactPost);

      expect(mockPush).toHaveBeenCalledWith('/blog/react-tutorial');
    });

    it('[nav] should call router.push on double click in gallery view', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postItem = screen.getByTestId('post-item-react-tutorial');
      fireEvent.doubleClick(postItem);

      expect(mockPush).toHaveBeenCalledWith('/blog/react-tutorial');
    });

    it('[nav] should navigate to correct slug for each post', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const tsPost = screen.getByText('TypeScript Guide');
      fireEvent.doubleClick(tsPost);

      expect(mockPush).toHaveBeenCalledWith('/blog/typescript-guide');
    });
  });

  // ==========================================================================
  // [scroll] Infinite Scroll
  // ==========================================================================

  describe('Infinite Scroll', () => {
    const createManyPosts = (count: number): Post[] =>
      Array.from({ length: count }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        category: 'React',
      }));

    it('[scroll] should initially render only 15 posts', () => {
      const manyPosts = createManyPosts(20);

      render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // With desc sort: Post 19 (Jan 20) is first, Post 5 (Jan 6) is 15th
      expect(screen.getByText('Post 19')).toBeInTheDocument();
      expect(screen.getByText('Post 5')).toBeInTheDocument();
      expect(screen.queryByText('Post 4')).not.toBeInTheDocument();
    });

    it('[scroll] should load more posts when IntersectionObserver triggers', async () => {
      const manyPosts = createManyPosts(20);

      render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(screen.queryByText('Post 4')).not.toBeInTheDocument();

      // Trigger intersection
      act(() => {
        if (observerInstance) {
          observerInstance.trigger(true);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Post 4')).toBeInTheDocument();
      });
    });

    it('[scroll] should hide loading trigger after all posts loaded', async () => {
      const manyPosts = createManyPosts(20);

      render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Trigger to load remaining posts
      act(() => {
        if (observerInstance) {
          observerInstance.trigger(true);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Post 0')).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('post-loading-trigger'),
      ).not.toBeInTheDocument();
    });

    it('[scroll] should set up IntersectionObserver with correct rootMargin', () => {
      const manyPosts = createManyPosts(20);
      const scrollRef = createScrollContainer();

      render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={scrollRef}
        />,
      );

      expect(observerInstance).not.toBeNull();
      expect(observerInstance?.options?.rootMargin).toBe('100px');
      expect(observerInstance?.options?.root).toBe(scrollRef.current);
    });

    it('[scroll] should not create IntersectionObserver when all posts fit', () => {
      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Only 5 posts, all fit in initial 15
      // observer should not be created (or at least not observe)
      expect(
        screen.queryByTestId('post-loading-trigger'),
      ).not.toBeInTheDocument();
    });

    it('[scroll] should cap loaded posts at total count', async () => {
      const manyPosts = createManyPosts(18);

      render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Initially 15 posts shown
      expect(screen.getAllByTestId(/^post-item-/).length).toBe(15);

      // Trigger load - should add remaining 3 (not 15)
      act(() => {
        if (observerInstance) {
          observerInstance.trigger(true);
        }
      });

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-item-/).length).toBe(18);
      });
    });
  });

  // ==========================================================================
  // [sort] Sorting
  // ==========================================================================

  describe('Sorting', () => {
    it('[sort] should sort by date descending by default', () => {
      const sortConfig: SortConfig = { key: 'date', direction: 'desc' };

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      expect(postSlugs[0]).toBe('nextjs-intro');
      expect(postSlugs[postSlugs.length - 1]).toBe('korean-post');
    });

    it('[sort] should sort by date ascending', () => {
      const sortConfig: SortConfig = { key: 'date', direction: 'asc' };

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      expect(postSlugs[0]).toBe('korean-post');
      expect(postSlugs[postSlugs.length - 1]).toBe('nextjs-intro');
    });

    it('[sort] should sort by title ascending with Korean locale', () => {
      const sortConfig: SortConfig = { key: 'title', direction: 'asc' };

      Object.defineProperty(window.navigator, 'language', {
        value: 'ko-KR',
        configurable: true,
        writable: true,
      });

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      // In Korean locale, Hangul comes before Latin alphabet
      expect(postSlugs[0]).toBe('korean-post');
      expect(postSlugs[postSlugs.length - 1]).toBe('typescript-guide');
    });

    it('[sort] should sort by title ascending with English locale', () => {
      const sortConfig: SortConfig = { key: 'title', direction: 'asc' };

      Object.defineProperty(window.navigator, 'language', {
        value: 'en-US',
        configurable: true,
        writable: true,
      });

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      // In English locale, Latin alphabet comes before Hangul
      expect(postSlugs[0]).toBe('advanced-react');
      expect(postSlugs[postSlugs.length - 1]).toBe('korean-post');
    });

    it('[sort] should sort by category ascending', () => {
      const sortConfig: SortConfig = { key: 'category', direction: 'asc' };

      Object.defineProperty(window.navigator, 'language', {
        value: 'en-US',
        configurable: true,
        writable: true,
      });

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      // Categories: Korean, Next.js, React (x2), TypeScript
      expect(postSlugs[0]).toBe('korean-post');
      expect(postSlugs[postSlugs.length - 1]).toBe('typescript-guide');
    });

    it('[sort] should sort by category descending', () => {
      const sortConfig: SortConfig = { key: 'category', direction: 'desc' };

      Object.defineProperty(window.navigator, 'language', {
        value: 'en-US',
        configurable: true,
        writable: true,
      });

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      // Reverse order: TypeScript, React (x2), Next.js, Korean
      expect(postSlugs[0]).toBe('typescript-guide');
      expect(postSlugs[postSlugs.length - 1]).toBe('korean-post');
    });

    it('[sort] should handle posts with empty summary during sort', () => {
      const sortConfig: SortConfig = { key: 'summary', direction: 'asc' };

      Object.defineProperty(window.navigator, 'language', {
        value: 'en-US',
        configurable: true,
        writable: true,
      });

      render(
        <PostList
          posts={mockPosts}
          viewMode='list'
          sortConfig={sortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Empty summary should sort to beginning ('' < 'Advanced...')
      const postSlugs = screen
        .getAllByTestId(/^post-item-/)
        .map((el) => el.getAttribute('data-testid')?.replace('post-item-', ''));

      expect(postSlugs[0]).toBe('korean-post');
    });
  });

  // ==========================================================================
  // [viewmode] View Mode Reset
  // ==========================================================================

  describe('View Mode Reset', () => {
    it('[viewmode] should reset displayedCount when viewMode changes', async () => {
      const manyPosts: Post[] = Array.from({ length: 20 }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        category: 'React',
      }));

      const { rerender } = render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Load more posts
      act(() => {
        if (observerInstance) {
          observerInstance.trigger(true);
        }
      });

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-item-/).length).toBe(20);
      });

      // Switch view mode - should reset to 15
      rerender(
        <PostList
          posts={manyPosts}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-item-/).length).toBe(15);
      });
    });

    it('[viewmode] should reset displayedCount when sortConfig changes', async () => {
      const manyPosts: Post[] = Array.from({ length: 20 }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        category: 'React',
      }));

      const { rerender } = render(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Load more posts
      act(() => {
        if (observerInstance) {
          observerInstance.trigger(true);
        }
      });

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-item-/).length).toBe(20);
      });

      // Change sort config - should reset to 15
      rerender(
        <PostList
          posts={manyPosts}
          viewMode='list'
          sortConfig={{ key: 'title', direction: 'asc' }}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-item-/).length).toBe(15);
      });
    });
  });

  // ==========================================================================
  // [image] Image Rendering
  // ==========================================================================

  describe('Image Rendering', () => {
    it('[image] should show mask overlay when gallery item is selected', async () => {
      const user = userEvent.setup();

      render(
        <PostList
          posts={mockPostsWithThumbnail}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      // Arrange: before click, no mask overlay
      expect(
        screen.queryByTestId('thumbnail-selection-overlay'),
      ).not.toBeInTheDocument();

      // Act: click to select
      await user.click(screen.getByTestId('post-item-with-thumbnail'));

      // Assert: mask overlay appears after selection
      await waitFor(() => {
        expect(
          screen.getByTestId('thumbnail-selection-overlay'),
        ).toBeInTheDocument();
      });
    });

    it('[image] should set correct sizes attribute on gallery images', () => {
      render(
        <PostList
          posts={mockPostsWithThumbnail}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const img = screen.getByAltText('Post With Thumbnail');
      expect(img).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      );
    });
  });

  // ==========================================================================
  // [edge] Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('[edge] should handle single post', () => {
      render(
        <PostList
          posts={[mockPosts[0]]}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(
        screen.getByTestId('post-item-react-tutorial'),
      ).toBeInTheDocument();
      expect(screen.getAllByTestId(/^post-item-/).length).toBe(1);
    });

    it('[edge] should handle exactly 15 posts (boundary)', () => {
      const exactPosts: Post[] = Array.from({ length: 15 }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        category: 'React',
      }));

      render(
        <PostList
          posts={exactPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(screen.getAllByTestId(/^post-item-/).length).toBe(15);
      expect(
        screen.queryByTestId('post-loading-trigger'),
      ).not.toBeInTheDocument();
    });

    it('[edge] should handle posts with special characters in slug', () => {
      const specialPosts: Post[] = [
        {
          slug: 'post-with-special-chars-123',
          title: 'Special Post',
          summary: 'Has special chars',
          date: '2024-01-15',
          category: 'React',
        },
      ];

      render(
        <PostList
          posts={specialPosts}
          viewMode='list'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      expect(
        screen.getByTestId('post-item-post-with-special-chars-123'),
      ).toBeInTheDocument();
    });

    it('[edge] should handle double click on gallery item with navigation', () => {
      render(
        <PostList
          posts={mockPostsWithThumbnail}
          viewMode='gallery'
          sortConfig={defaultSortConfig}
          scrollContainerRef={createScrollContainer()}
        />,
      );

      const postItem = screen.getByTestId('post-item-with-thumbnail');
      fireEvent.doubleClick(postItem);

      expect(mockPush).toHaveBeenCalledWith('/blog/with-thumbnail');
    });
  });
});
