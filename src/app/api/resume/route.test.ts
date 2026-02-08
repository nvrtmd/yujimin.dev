import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { GET } from './route';
import { getParsedDocument } from '@yuji-min/google-docs-parser/edge';

// Mock the /edge subpath (used in route.ts)
vi.mock('@yuji-min/google-docs-parser/edge', () => ({
  getParsedDocument: vi.fn(),
}));

// Mock cache layer to avoid Cloudflare context dependency in tests
vi.mock('./cacheUtils', () => ({
  getResumeFromCache: vi.fn().mockResolvedValue(null),
  upsertResumeCache: vi.fn().mockResolvedValue(undefined),
  saveCacheError: vi.fn().mockResolvedValue(undefined),
}));

const originalEnv = process.env;

interface ApiResponse {
  data?: { pdfUrl?: string; [key: string]: unknown };
  error?: string;
}

describe('Resume API Route', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.GOOGLE_DOC_ID = 'test-doc-id';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test-creds';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('[config] should return 500 if env vars are missing', async () => {
    // Arrange
    process.env.GOOGLE_DOC_ID = '';

    // Act
    const res = await GET();
    const body: ApiResponse = await res.json();

    // Assert
    expect(res.status).toBe(500);
    expect(body.error).toBe('Server configuration error');
    expect(getParsedDocument).not.toHaveBeenCalled();
  });

  it('[success] should return parsed data with generated pdfUrl', async () => {
    // Arrange
    const mockParsedData = { sections: [{ title: 'Intro' }] };
    (getParsedDocument as Mock).mockResolvedValue(mockParsedData);

    // Act
    const res = await GET();
    const body: ApiResponse = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(body.data).toMatchObject(mockParsedData);
    expect(body.data?.pdfUrl).toBe(
      'https://docs.google.com/document/d/test-doc-id/export?format=pdf',
    );
  });

  it('[error] should return 500 when library throws error', async () => {
    // Arrange
    (getParsedDocument as Mock).mockRejectedValue(
      new Error('Google API Error'),
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const res = await GET();
    const body: ApiResponse = await res.json();

    // Assert
    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal server error');

    consoleSpy.mockRestore();
  });
});
