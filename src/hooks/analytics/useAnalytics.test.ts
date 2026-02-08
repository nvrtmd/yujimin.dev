import { renderHook, waitFor } from '@testing-library/react';
import { useAnalytics } from './useAnalytics';
import { ANALYTICS_CACHE_KEY } from './trackVisit';
import { SchemaParseError } from '@/libs/parseWithZod';
import { ZodError } from 'zod';

const CACHE_DURATION = 1 * 60 * 1000;

vi.mock('@/libs/parseWithZod', async () => {
  const actual = await vi.importActual('@/libs/parseWithZod');
  return {
    ...actual,
    parseWithZod: vi.fn(),
  };
});

import { parseWithZod } from '@/libs/parseWithZod';
const mockParseWithZod = vi.mocked(parseWithZod);

describe('useAnalytics', () => {
  let mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };
  let mockFetch: ReturnType<typeof vi.fn>;

  const mockAnalyticsData = {
    todaysViews: 100,
    totalViews: 5000,
    totalCountries: 25,
    topCountry: 'South Korea',
    lastVisitor: '2024-01-15T10:30:00Z',
  };

  const setupMocks = () => {
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    mockFetch = vi.fn();
    global.fetch = mockFetch as typeof fetch;

    vi.spyOn(console, 'error').mockImplementation(() => {});
  };

  const mockSuccessResponse = () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockAnalyticsData }),
    });
    mockParseWithZod.mockReturnValue({
      success: true,
      data: mockAnalyticsData,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ==========================================================================
  // [cache] Cache Hit/Miss Logic
  // ==========================================================================

  it('[cache-hit] should return cached data without fetch when cache is valid', async () => {
    // Arrange
    const now = Date.now();
    const cachedData = {
      data: mockAnalyticsData,
      timestamp: now - CACHE_DURATION + 10000, // cache set 10s before expiry (still valid)
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

    // Act
    const { result } = renderHook(() => useAnalytics());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.metrics).toEqual(mockAnalyticsData);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('[cache-miss] should fetch from API when cache is expired', async () => {
    // Arrange
    const now = Date.now();
    const expiredCache = {
      data: { ...mockAnalyticsData, todaysViews: 50 },
      timestamp: now - CACHE_DURATION - 1000, // past expiry by 1s
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredCache));
    mockSuccessResponse();

    // Act
    const { result } = renderHook(() => useAnalytics());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics');
    expect(result.current.metrics).toEqual(mockAnalyticsData);
  });

  it('[cache-miss] should fetch from API when no cache exists', async () => {
    // Arrange
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSuccessResponse();

    // Act
    const { result } = renderHook(() => useAnalytics());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics');
    expect(result.current.metrics).toEqual(mockAnalyticsData);
  });

  it('[cache-update] should update localStorage after successful fetch', async () => {
    // Arrange
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSuccessResponse();

    // Act
    const { result } = renderHook(() => useAnalytics());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      ANALYTICS_CACHE_KEY,
      expect.stringContaining('"todaysViews":100'),
    );
  });

  // ==========================================================================
  // [error] Error Handling
  // ==========================================================================

  it('[error] should set error state when fetch fails', async () => {
    // Arrange
    const networkError = new Error('Network failed');
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockRejectedValue(networkError);

    // Act
    const { result } = renderHook(() => useAnalytics());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBe('Network failed');
    expect(result.current.metrics).toBeNull();
  });

  it('[error] should handle SchemaParseError with specific message', async () => {
    // Arrange
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'string',
        path: ['todaysViews'],
        message: 'Expected number',
      } as ZodError['issues'][0],
    ]);
    const schemaError = new SchemaParseError(zodError);
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ invalid: 'data' }),
    });
    mockParseWithZod.mockImplementation(() => {
      throw schemaError;
    });

    // Act
    const { result } = renderHook(() => useAnalytics());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBe(zodError.message);
  });

  // ==========================================================================
  // [interval] Auto-refresh Interval
  // ==========================================================================

  it('[interval] should setup interval and cleanup on unmount', async () => {
    // Arrange
    vi.useFakeTimers();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSuccessResponse();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    // Act
    const { unmount } = renderHook(() => useAnalytics());

    // Assert - interval should be set
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('[interval] should call setInterval with CACHE_DURATION', async () => {
    // Arrange
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSuccessResponse();

    // Act
    renderHook(() => useAnalytics());

    // Assert
    expect(setIntervalSpy).toHaveBeenCalledWith(
      expect.any(Function),
      CACHE_DURATION,
    );
  });
});
