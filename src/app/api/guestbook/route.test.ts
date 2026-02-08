import { GET, POST } from './route';
import { ENTRIES_PER_PAGE } from '@/models/constants';
import { NextRequest } from 'next/server';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { getDbInstance, parseJsonBody, JsonParseError } from '../helpers';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/models/api';
import type { GuestbookEntry, GuestbookList } from '@/models/guestbook';

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>();
  return {
    ...actual,
    getDbInstance: vi.fn(),
    parseJsonBody: vi.fn(),
  };
});

vi.mock('@/libs/parseWithZod', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs/parseWithZod')>();
  return {
    ...actual,
    parseWithZod: vi.fn(),
  };
});
import { parseWithZod } from '@/libs/parseWithZod';

interface MockChain {
  from: Mock;
  where: Mock;
  orderBy: Mock;
  limit: Mock;
  offset: Mock;
  values: Mock;
  returning: Mock;
}

interface MockDb {
  select: Mock;
  insert: Mock;
  batch: Mock;
}

function createMockChain(): MockChain {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  };
}

function createGetRequest(params?: string): NextRequest {
  const url = params
    ? `http://localhost:3000/api/guestbook?${params}`
    : 'http://localhost:3000/api/guestbook';
  return new NextRequest(url);
}

function createPostRequest(ip?: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/guestbook', {
    method: 'POST',
    headers: ip ? { 'cf-connecting-ip': ip } : undefined,
  });
}

describe('API Route: /api/guestbook', () => {
  let mockDb: MockDb;
  let mockChain: MockChain;

  beforeEach(() => {
    mockChain = createMockChain();
    mockDb = {
      select: vi.fn().mockReturnValue(mockChain),
      insert: vi.fn().mockReturnValue(mockChain),
      batch: vi.fn(),
    };

    (getDbInstance as Mock).mockReturnValue({ db: mockDb });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('[pagination] should use default page/limit and calculate correct offset', async () => {
      // Arrange
      const mockEntries = [{ id: 1, message: 'Test' }];
      mockDb.batch.mockResolvedValueOnce([[{ count: 20 }], mockEntries]);
      const req = createGetRequest();

      // Act
      const res = await GET(req);
      const body: ApiSuccessResponse<GuestbookList> = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(body.data.pagination).toEqual({
        page: 1,
        limit: ENTRIES_PER_PAGE,
        total: 20,
        totalPages: 4,
      });
      expect(body.data.entries).toEqual(mockEntries);
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockChain.limit).toHaveBeenCalledWith(ENTRIES_PER_PAGE);
      expect(mockChain.offset).toHaveBeenCalledWith(0);
    });

    it('[pagination] should calculate offset correctly with custom page/limit', async () => {
      // Arrange
      mockDb.batch.mockResolvedValueOnce([[{ count: 50 }], []]);
      const req = createGetRequest('page=3&limit=10');

      // Act
      await GET(req);

      // Assert: offset = (page - 1) * limit = (3 - 1) * 10 = 20
      expect(mockChain.limit).toHaveBeenCalledWith(10);
      expect(mockChain.offset).toHaveBeenCalledWith(20);
    });

    it('[pagination] should return zero totals when no entries exist', async () => {
      // Arrange
      mockDb.batch.mockResolvedValueOnce([[], []]);
      const req = createGetRequest();

      // Act
      const res = await GET(req);
      const body: ApiSuccessResponse<GuestbookList> = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(body.data.pagination).toEqual({
        page: 1,
        limit: ENTRIES_PER_PAGE,
        total: 0,
        totalPages: 0,
      });
      expect(body.data.entries).toEqual([]);
    });

    it('[query] should order entries by createdAt descending', async () => {
      // Arrange
      mockDb.batch.mockResolvedValueOnce([
        [{ count: 1 }],
        [{ id: 1, message: 'Test' }],
      ]);
      const req = createGetRequest();

      // Act
      await GET(req);

      // Assert
      expect(mockChain.orderBy).toHaveBeenCalledTimes(1);
    });

    it('[error] should return 500 when DB throws error', async () => {
      // Arrange
      mockDb.batch.mockRejectedValueOnce(new Error('DB Connection Failed'));
      const req = createGetRequest();

      // Act
      const res = await GET(req);

      // Assert
      expect(res.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validPayload = { nickname: 'Tester', message: 'Hello World' };

    function mockRateLimitPass(): void {
      mockChain.where.mockResolvedValueOnce([{ count: 0 }]);
    }

    function mockValidPayload(): void {
      (parseJsonBody as Mock).mockResolvedValue(validPayload);
      (parseWithZod as Mock).mockReturnValue(validPayload);
    }

    it('[validation] should return 400 when JSON body is invalid', async () => {
      // Arrange
      mockRateLimitPass();
      (parseJsonBody as Mock).mockRejectedValue(
        new JsonParseError('Invalid JSON'),
      );
      const req = createPostRequest();

      // Act
      const res = await POST(req);
      const body: ApiErrorResponse = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(body.error).toBe('Invalid JSON body');
    });

    it('[success] should insert entry and return 201 when all checks pass', async () => {
      // Arrange
      const testIp = '10.0.0.1';
      mockRateLimitPass();
      mockValidPayload();
      const insertedEntry = { id: 100, ...validPayload, ipAddress: testIp };
      mockChain.returning.mockResolvedValueOnce([insertedEntry]);
      const req = createPostRequest(testIp);

      // Act
      const res = await POST(req);
      const body: ApiSuccessResponse<GuestbookEntry> = await res.json();

      // Assert
      expect(res.status).toBe(201);
      expect(body.data).toEqual(insertedEntry);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockChain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          nickname: 'Tester',
          message: 'Hello World',
          ipAddress: testIp,
        }),
      );
    });

    it('[validation] should return error when Zod validation fails', async () => {
      // Arrange
      mockRateLimitPass();
      (parseJsonBody as Mock).mockResolvedValue({});
      (parseWithZod as Mock).mockImplementation(() => {
        throw new Error('Zod Validation Error');
      });
      const req = createPostRequest();

      // Act
      const res = await POST(req);

      // Assert
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('[ip] should use default IP (127.0.0.1) when header is missing', async () => {
      // Arrange
      mockRateLimitPass();
      (parseJsonBody as Mock).mockResolvedValue({
        nickname: 'A',
        message: 'B',
      });
      (parseWithZod as Mock).mockReturnValue({ nickname: 'A', message: 'B' });
      mockChain.returning.mockResolvedValueOnce([
        { id: 1, nickname: 'A', message: 'B', ipAddress: '127.0.0.1' },
      ]);
      const req = createPostRequest();

      // Act
      const res = await POST(req);

      // Assert
      expect(res.status).toBe(201);
      expect(mockChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '127.0.0.1' }),
      );
    });

    it('[payload] should persist location/website as null when omitted', async () => {
      // Arrange
      const testIp = '10.0.0.1';
      mockRateLimitPass();
      (parseJsonBody as Mock).mockResolvedValue({
        nickname: 'Tester',
        message: 'Hello',
      });
      (parseWithZod as Mock).mockReturnValue({
        nickname: 'Tester',
        message: 'Hello',
        location: undefined,
        website: undefined,
      });
      mockChain.returning.mockResolvedValueOnce([
        {
          id: 2,
          nickname: 'Tester',
          message: 'Hello',
          ipAddress: testIp,
          location: null,
          website: null,
        },
      ]);
      const req = createPostRequest(testIp);

      // Act
      const res = await POST(req);

      // Assert
      expect(res.status).toBe(201);
      expect(mockChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ location: null, website: null }),
      );
    });
  });
});
