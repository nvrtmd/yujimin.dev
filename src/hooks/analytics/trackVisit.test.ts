import { trackVisit, ANALYTICS_CACHE_KEY } from './trackVisit';
import { SchemaParseError } from '@/libs/parseWithZod';
import { ZodError } from 'zod';

const ANALYTICS_COOL_DOWN = 3 * 60 * 1000;
const STORAGE_KEY = 'analytics_last_tracked';

vi.mock('@/libs/parseWithZod', async () => {
  const actual = await vi.importActual('@/libs/parseWithZod');
  return {
    ...actual,
    parseWithZod: vi.fn(),
  };
});

import { parseWithZod } from '@/libs/parseWithZod';
const mockParseWithZod = vi.mocked(parseWithZod);

describe('trackVisit', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;

  let mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockConsoleError: ReturnType<typeof vi.fn>;

  const setupWindow = (value: unknown) => {
    Object.defineProperty(global, 'window', {
      value,
      writable: true,
      configurable: true,
    });
  };

  const setupDocument = (referrer: string) => {
    Object.defineProperty(global, 'document', {
      value: { referrer },
      writable: true,
      configurable: true,
    });
  };

  const mockSuccessResponse = () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, message: 'Visit tracked' }),
    });
    mockParseWithZod.mockReturnValue({
      success: true,
      message: 'Visit tracked',
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    mockFetch = vi.fn();
    global.fetch = mockFetch as typeof fetch;

    mockConsoleError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(mockConsoleError);

    setupWindow({ localStorage: mockLocalStorage });

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    setupDocument('');
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('[guard] should skip tracking in SSR or when localStorage unavailable', async () => {
    // Arrange & Act - SSR (window undefined)
    setupWindow(undefined);
    await trackVisit('/test');

    // Assert
    expect(mockFetch).not.toHaveBeenCalled();

    // Arrange & Act - localStorage unavailable
    setupWindow({ localStorage: null });
    await trackVisit('/test');

    // Assert
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each([
    [ANALYTICS_COOL_DOWN - 1, false, 'before cooldown expires'],
    [ANALYTICS_COOL_DOWN, true, 'at cooldown boundary'],
    [ANALYTICS_COOL_DOWN + 1, true, 'after cooldown expires'],
  ])(
    '[cooldown] should fetch=%s when %dms elapsed (%s)',
    async (elapsed, shouldFetch) => {
      // Arrange
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mockLocalStorage.getItem.mockReturnValue((now - elapsed).toString());
      if (shouldFetch) mockSuccessResponse();

      // Act
      await trackVisit('/test');

      // Assert
      if (shouldFetch) {
        expect(mockFetch).toHaveBeenCalled();
      } else {
        expect(mockFetch).not.toHaveBeenCalled();
      }
    },
  );

  it('[success] should send request and update localStorage on valid response', async () => {
    // Arrange
    const now = 1704067200000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    mockLocalStorage.getItem.mockReturnValue(null);
    setupDocument('https://google.com');
    mockSuccessResponse();

    // Act
    await trackVisit('/blog/test-post');

    // Assert
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: 'https://google.com',
        path: '/blog/test-post',
      }),
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      now.toString(),
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      ANALYTICS_CACHE_KEY,
    );
  });

  it('[success] should use "Direct" as referrer when document.referrer is empty', async () => {
    // Arrange
    mockLocalStorage.getItem.mockReturnValue(null);
    setupDocument('');
    mockSuccessResponse();

    // Act
    await trackVisit('/test');

    // Assert
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.referrer).toBe('Direct');
  });

  it('[error] should log API error and skip localStorage update', async () => {
    // Arrange
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: 'Rate limited' }),
    });
    mockParseWithZod.mockReturnValue({ success: false, error: 'Rate limited' });

    // Act
    await trackVisit('/test');

    // Assert
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[Analytics] API Error:',
      'Rate limited',
    );
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('[error] should catch network errors gracefully', async () => {
    // Arrange
    const networkError = new Error('Network failed');
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockRejectedValue(networkError);

    // Act
    await trackVisit('/test');

    // Assert
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[Analytics] Fetch Error:',
      networkError,
    );
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('[error] should handle SchemaParseError from invalid response', async () => {
    // Arrange
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'boolean',
        path: ['success'],
        message: 'Expected boolean',
        received: 'string',
      },
    ]);
    const schemaError = new SchemaParseError(zodError);
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ invalid: 'response' }),
    });
    mockParseWithZod.mockImplementation(() => {
      throw schemaError;
    });

    // Act
    await trackVisit('/test');

    // Assert
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[Analytics] Validation Error:',
      zodError.message,
    );
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });
});
