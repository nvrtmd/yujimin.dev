import { renderHook, act, waitFor } from '@/__tests__/utils/test-utils';
import { useGuestbook } from './useGuestbook';
import { GuestbookEntry } from '@/models';
import { parseWithZod } from '@/libs/parseWithZod';
import type { Mock } from 'vitest';

// Mock constants & Dependencies
vi.mock('@/app/api/guestbook/route', () => ({
  ENTRIES_PER_PAGE: 5,
}));

vi.mock('@/libs/parseWithZod', () => ({
  parseWithZod: vi.fn(),
  SchemaParseError: class SchemaParseError extends Error {
    constructor() {
      super('Schema Error');
      this.name = 'SchemaParseError';
    }
  },
}));

// Mock Data & Helpers
const MOCK_ENTRIES_PER_PAGE = 5;

const createMockEntries = (count: number, startIndex = 0): GuestbookEntry[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: startIndex + i + 1,
    nickname: `User ${startIndex + i + 1}`,
    message: `Message ${startIndex + i + 1}`,
    createdAt: new Date().toISOString(),
    location: null,
    website: null,
  }));
};

const mockZodSuccess = (entries: GuestbookEntry[]) => {
  (parseWithZod as Mock).mockReturnValue({
    success: true,
    data: { entries },
  });
};

const mockZodFail = (issues: string[]) => {
  (parseWithZod as Mock).mockReturnValue({
    success: false,
    error: { issues },
  });
};

describe('useGuestbook', () => {
  const fetchMock = vi.fn();
  global.fetch = fetchMock;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({}),
    });
  });

  it('[init] should initialize with default states', () => {
    const { result } = renderHook(() => useGuestbook());

    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('[pagination] should determine hasNextPage based on response size', async () => {
    const { result } = renderHook(() => useGuestbook());

    // Full page: hasNextPage should be true
    mockZodSuccess(createMockEntries(MOCK_ENTRIES_PER_PAGE));
    await act(async () => {
      await result.current.fetchEntries();
    });
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.entries).toHaveLength(MOCK_ENTRIES_PER_PAGE);

    // Partial page: hasNextPage should be false
    mockZodSuccess(createMockEntries(2, MOCK_ENTRIES_PER_PAGE));
    await act(async () => {
      await result.current.fetchEntries();
    });
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.entries).toHaveLength(MOCK_ENTRIES_PER_PAGE + 2);
  });

  it('[fetch] should append entries on subsequent pages', async () => {
    const firstPageData = createMockEntries(MOCK_ENTRIES_PER_PAGE);
    const secondPageData = createMockEntries(MOCK_ENTRIES_PER_PAGE, 5);

    mockZodSuccess(firstPageData);
    const { result } = renderHook(() => useGuestbook());

    await act(async () => {
      await result.current.fetchEntries();
    });

    mockZodSuccess(secondPageData);
    await act(async () => {
      await result.current.fetchEntries();
    });

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('page=2'));
    expect(result.current.entries).toHaveLength(10);
    expect(result.current.entries[9].message).toBe('Message 10');
  });

  it('[guard] should prevent duplicate fetches while loading', async () => {
    mockZodSuccess([]);

    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                json: () => Promise.resolve({}),
              }),
            50,
          ),
        ),
    );

    const { result } = renderHook(() => useGuestbook());

    act(() => {
      result.current.fetchEntries();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      await result.current.fetchEntries();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('[refresh] should reset and fetch page 1', async () => {
    const { result } = renderHook(() => useGuestbook());

    // Initial fetch
    mockZodSuccess(createMockEntries(MOCK_ENTRIES_PER_PAGE));
    await act(async () => {
      await result.current.fetchEntries();
    });
    expect(result.current.entries).toHaveLength(MOCK_ENTRIES_PER_PAGE);

    // Refresh with new data
    const newData = createMockEntries(3, 100);
    mockZodSuccess(newData);

    await act(async () => {
      await result.current.refreshEntries();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('page=1'),
    );
    expect(result.current.entries).toHaveLength(3);
    expect(result.current.entries[0].id).toBe(101);
  });

  it('[error] should handle fetch failures gracefully', async () => {
    const { result } = renderHook(() => useGuestbook());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Network failure
    fetchMock.mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      await result.current.fetchEntries();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch'),
      expect.anything(),
    );

    // Schema validation failure
    consoleSpy.mockClear();
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve({}) });
    mockZodFail(['Invalid data']);

    await act(async () => {
      await result.current.fetchEntries(1);
    });

    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('API Error'),
      expect.anything(),
    );

    consoleSpy.mockRestore();
  });
});
