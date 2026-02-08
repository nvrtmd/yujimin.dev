import { render, screen } from '@/__tests__/utils/test-utils';
import { GuestbookList } from './GuestbookList';
import type { GuestbookEntry } from '@/models';

vi.mock('react-infinite-scroll-hook', () => ({
  default: vi.fn(() => [{ current: null }]),
}));

vi.mock('./GuestbookItem', () => ({
  GuestbookItem: ({ entry }: { entry: GuestbookEntry }) => (
    <div data-testid={`guestbook-item-${entry.id}`}>{entry.nickname}</div>
  ),
}));

function createMockEntry(
  overrides: Partial<GuestbookEntry> = {},
): GuestbookEntry {
  return {
    id: 1,
    nickname: 'TestUser',
    message: 'Test message',
    createdAt: '2024-01-15T10:00:00Z',
    location: null,
    website: null,
    ...overrides,
  };
}

function createMockEntries(count: number): GuestbookEntry[] {
  return Array.from({ length: count }, (_, i) =>
    createMockEntry({
      id: i + 1,
      nickname: `User${i + 1}`,
    }),
  );
}

describe('GuestbookList', () => {
  const mockFetchEntries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading Indicator', () => {
    it('[loading] should show loading when isLoading is true', () => {
      // Arrange & Act
      render(
        <GuestbookList
          entries={[]}
          fetchEntries={mockFetchEntries}
          isLoading={true}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(screen.getByText('-- Loading... --')).toBeInTheDocument();
    });

    it('[loading] should show loading when hasNextPage is true', () => {
      // Arrange
      const entries = createMockEntries(3);

      // Act
      render(
        <GuestbookList
          entries={entries}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={true}
        />,
      );

      // Assert
      expect(screen.getByText('-- Loading... --')).toBeInTheDocument();
    });

    it('[loading] should hide loading when both isLoading and hasNextPage are false', () => {
      // Arrange
      const entries = createMockEntries(3);

      // Act
      render(
        <GuestbookList
          entries={entries}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(screen.queryByText('-- Loading... --')).not.toBeInTheDocument();
    });
  });

  describe('End Message', () => {
    it('[end] should show end message when hasNextPage is false and entries exist', () => {
      // Arrange
      const entries = createMockEntries(3);

      // Act
      render(
        <GuestbookList
          entries={entries}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(screen.getByText('-- End of messages --')).toBeInTheDocument();
    });

    it('[end] should hide end message when hasNextPage is true', () => {
      // Arrange
      const entries = createMockEntries(3);

      // Act
      render(
        <GuestbookList
          entries={entries}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={true}
        />,
      );

      // Assert
      expect(
        screen.queryByText('-- End of messages --'),
      ).not.toBeInTheDocument();
    });

    it('[end] should hide end message when entries array is empty', () => {
      // Arrange & Act
      render(
        <GuestbookList
          entries={[]}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(
        screen.queryByText('-- End of messages --'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('[empty] should show empty message when entries is empty and not loading', () => {
      // Arrange & Act
      render(
        <GuestbookList
          entries={[]}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(
        screen.getByText('Be the first to leave a message!'),
      ).toBeInTheDocument();
    });

    it('[empty] should hide empty message when isLoading is true', () => {
      // Arrange & Act
      render(
        <GuestbookList
          entries={[]}
          fetchEntries={mockFetchEntries}
          isLoading={true}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(
        screen.queryByText('Be the first to leave a message!'),
      ).not.toBeInTheDocument();
    });

    it('[empty] should hide empty message when entries exist', () => {
      // Arrange
      const entries = createMockEntries(1);

      // Act
      render(
        <GuestbookList
          entries={entries}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={false}
        />,
      );

      // Assert
      expect(
        screen.queryByText('Be the first to leave a message!'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('[edge] should show both empty message and loading when hasNextPage is true with empty entries', () => {
      // Arrange & Act
      render(
        <GuestbookList
          entries={[]}
          fetchEntries={mockFetchEntries}
          isLoading={false}
          hasNextPage={true}
        />,
      );

      // Assert
      expect(
        screen.getByText('Be the first to leave a message!'),
      ).toBeInTheDocument();
      expect(screen.getByText('-- Loading... --')).toBeInTheDocument();
    });
  });
});
