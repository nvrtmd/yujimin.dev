import { render, screen } from '@/__tests__/utils/test-utils';
import { GuestbookItem } from './GuestbookItem';
import type { GuestbookEntry } from '@/models';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

vi.mock('@/libs', () => ({
  getTimeAgo: vi.fn(() => '5 minutes ago'),
}));

function createMockEntry(
  overrides: Partial<GuestbookEntry> = {},
): GuestbookEntry {
  return {
    id: 1,
    nickname: 'TestUser',
    message: 'This is a test message.',
    createdAt: '2024-01-15T10:30:00',
    location: null,
    website: null,
    ...overrides,
  };
}

describe('GuestbookItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Rendering', () => {
    it('[render] should not display location section when location is null', () => {
      // Arrange
      const entry = createMockEntry({ location: null });

      // Act
      render(<GuestbookItem entry={entry} />);

      // Assert
      expect(screen.queryByAltText('location')).not.toBeInTheDocument();
    });

    it('[render] should not display link when website is null', () => {
      // Arrange
      const entry = createMockEntry({ website: null });

      // Act
      render(<GuestbookItem entry={entry} />);

      // Assert
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('URL Processing', () => {
    it('[url] should prepend https:// when website lacks protocol', () => {
      // Arrange
      const entry = createMockEntry({ website: 'example.com' });

      // Act
      render(<GuestbookItem entry={entry} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('[url] should preserve original URL when it starts with http or https', () => {
      // Arrange
      const httpEntry = createMockEntry({ website: 'http://example.com' });

      // Act
      const { rerender } = render(<GuestbookItem entry={httpEntry} />);

      // Assert
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'http://example.com',
      );

      // Arrange - https case
      const httpsEntry = createMockEntry({
        website: 'https://secure.example.com',
      });

      // Act
      rerender(<GuestbookItem entry={httpsEntry} />);

      // Assert
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://secure.example.com',
      );
    });

    it('[url] should apply security attributes for external links', () => {
      // Arrange
      const entry = createMockEntry({ website: 'example.com' });

      // Act
      render(<GuestbookItem entry={entry} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
