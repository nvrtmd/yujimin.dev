import { GET, POST } from './route';
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
import { SchemaParseError } from '@/libs/parseWithZod';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiMessageResponse,
} from '@/models/api';
import type { Analytics } from '@/models/analytics';

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
  groupBy: Mock;
  orderBy: Mock;
  limit: Mock;
}

interface MockDb {
  insert: Mock;
  select: Mock;
  batch: Mock;
}

interface MockCtx {
  waitUntil: Mock;
}

const createMockSelectChain = (): MockChain => ({
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  groupBy: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
});

describe('API Route: /api/analytics', () => {
  let mockDb: MockDb;
  let mockCtx: MockCtx;

  beforeEach(() => {
    mockCtx = { waitUntil: vi.fn() };
    const mockSelectChain = createMockSelectChain();
    mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      select: vi.fn().mockReturnValue(mockSelectChain),
      batch: vi.fn(),
    };

    (getDbInstance as Mock).mockReturnValue({ db: mockDb, ctx: mockCtx });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    const createRequest = (headers?: Record<string, string>, cf?: object) => {
      const req = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
        headers,
      });
      if (cf) {
        Object.defineProperty(req, 'cf', { value: cf, writable: false });
      }
      return req;
    };

    it('[success] should track visit and return success message', async () => {
      // Arrange
      const validPayload = {
        path: '/blog/test',
        referrer: 'https://google.com',
      };
      (parseJsonBody as Mock).mockResolvedValue(validPayload);
      (parseWithZod as Mock).mockReturnValue(validPayload);
      const req = createRequest({}, { country: 'KR' });

      // Act
      const res = await POST(req);
      const body = (await res.json()) as Extract<
        ApiMessageResponse,
        { success: true }
      >;

      // Assert
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Visit tracked');
      expect(mockCtx.waitUntil).toHaveBeenCalled();
    });

    it('[validation] should return 400 if JSON body is invalid', async () => {
      // Arrange
      (parseJsonBody as Mock).mockRejectedValue(
        new JsonParseError('Invalid JSON'),
      );
      const req = createRequest();

      // Act
      const res = await POST(req);
      const body: ApiErrorResponse = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(body.error).toBe('Invalid JSON body');
    });

    it('[validation] should return 400 if schema validation fails', async () => {
      // Arrange
      (parseJsonBody as Mock).mockResolvedValue({ path: '' });
      (parseWithZod as Mock).mockImplementation(() => {
        const zodError = {
          issues: [{ message: 'path is required' }],
        };
        throw new SchemaParseError(zodError as never);
      });
      const req = createRequest();

      // Act
      const res = await POST(req);
      const body: ApiErrorResponse = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(body.error).toBe('Invalid input data');
    });

    it('[defaults] should use default values when referrer and country are missing', async () => {
      // Arrange
      const payload = { path: '/home' };
      (parseJsonBody as Mock).mockResolvedValue(payload);
      (parseWithZod as Mock).mockReturnValue(payload);
      const req = createRequest();

      // Act
      await POST(req);

      // Assert
      const insertCall = mockDb.insert.mock.results[0].value.values;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/home',
          referer: 'Direct',
          country: 'etc',
        }),
      );
    });

    it('[non-blocking] should return 200 even if DB insert fails', async () => {
      // Arrange
      const validPayload = { path: '/blog/safe', referrer: 'direct' };
      (parseJsonBody as Mock).mockResolvedValue(validPayload);
      (parseWithZod as Mock).mockReturnValue(validPayload);
      mockDb.insert.mockReturnValue({
        values: vi
          .fn()
          .mockReturnValue(Promise.reject(new Error('DB Connection Timeout'))),
      });
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const req = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
      });

      // Act
      const res = await POST(req);
      const body = (await res.json()) as Extract<
        ApiMessageResponse,
        { success: true }
      >;

      // Assert
      expect(res.status).toBe(200);
      expect(body.message).toBe('Visit tracked');
      expect(mockCtx.waitUntil).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('[missing-header] should handle missing User-Agent header gracefully', async () => {
      // Arrange
      const validPayload = { path: '/blog/no-ua' };
      (parseJsonBody as Mock).mockResolvedValue(validPayload);
      (parseWithZod as Mock).mockReturnValue(validPayload);
      const req = new NextRequest('http://localhost:3000/api/analytics', {
        method: 'POST',
      });

      // Act
      await POST(req);

      // Assert
      const insertCall = mockDb.insert.mock.results[0].value.values;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/blog/no-ua',
          userAgent: null,
        }),
      );
    });
  });

  describe('GET', () => {
    it('[success] should return all analytics metrics', async () => {
      // Arrange
      const mockTimestamp = '2026-01-29 10:00:00';
      mockDb.batch.mockResolvedValue([
        [{ value: 100 }],
        [{ value: 15 }],
        [{ country: 'US', count: 50 }],
        [{ country: 'KR', timestamp: mockTimestamp }],
        [{ value: 10 }],
      ]);

      // Act
      const res = await GET();
      const body = (await res.json()) as ApiSuccessResponse<Analytics>;

      // Assert
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        totalViews: 100,
        totalCountries: 15,
        topCountry: 'US',
        todaysViews: 10,
      });
      expect(body.data.lastVisitor).toBeDefined();
    });

    it('[defaults] should return default values when no data exists', async () => {
      // Arrange
      mockDb.batch.mockResolvedValue([
        [{ value: 0 }],
        [{ value: 0 }],
        [],
        [],
        [{ value: 0 }],
      ]);

      // Act
      const res = await GET();
      const body = (await res.json()) as ApiSuccessResponse<Analytics>;

      // Assert
      expect(res.status).toBe(200);
      expect(body.data).toEqual({
        totalViews: 0,
        totalCountries: 0,
        topCountry: '--',
        lastVisitor: '--',
        todaysViews: 0,
      });
    });

    it('[error] should return 500 when DB query fails', async () => {
      // Arrange
      mockDb.batch.mockRejectedValue(new Error('DB Connection Failed'));

      // Act
      const res = await GET();

      // Assert
      expect(res.status).toBe(500);
    });
  });
});
