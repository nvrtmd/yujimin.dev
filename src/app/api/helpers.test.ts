import { ZodError, z } from 'zod';
import {
  jsonResponse,
  successResponse,
  messageResponse,
  errorResponse,
  validationErrorResponse,
  handleApiError,
  parseJsonBody,
  DbConfigError,
  JsonParseError,
} from './helpers';
import { SchemaParseError } from '@/libs/parseWithZod';

interface ErrorBody {
  success: false;
  error: string;
  details?: string[];
}

describe('jsonResponse', () => {
  it('[default] should return JSON response with status 200', async () => {
    // Arrange
    const data = { key: 'value' };

    // Act
    const response = jsonResponse(data);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body).toEqual({ key: 'value' });
  });

  it('[status] should return JSON response with custom status', async () => {
    // Arrange
    const data = { error: 'not found' };

    // Act
    const response = jsonResponse(data, 404);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'not found' });
  });
});

describe('successResponse', () => {
  it('[default] should wrap data in success structure', async () => {
    // Arrange
    const data = { id: 1, name: 'Test' };

    // Act
    const response = successResponse(data);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data });
  });
});

describe('messageResponse', () => {
  it('[default] should return success with message', async () => {
    // Act
    const response = messageResponse('Operation completed');
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      message: 'Operation completed',
    });
  });
});

describe('errorResponse', () => {
  it('[default] should return error structure with status', async () => {
    // Act
    const response = errorResponse('Something went wrong', 500);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });
});

describe('validationErrorResponse', () => {
  it('[details] should return validation error with details array', async () => {
    // Arrange
    const details = ['Field is required', 'Invalid format'];

    // Act
    const response = validationErrorResponse('Validation failed', details);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: 'Validation failed',
      details: ['Field is required', 'Invalid format'],
    });
  });
});

describe('DbConfigError', () => {
  it('[create] should create error with correct name and message', () => {
    // Act
    const error = new DbConfigError('Database connection failed');

    // Assert
    expect(error.name).toBe('DbConfigError');
    expect(error.message).toBe('Database connection failed');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof DbConfigError).toBe(true);
  });
});

describe('JsonParseError', () => {
  it('[create] should create error with correct name and message', () => {
    // Act
    const error = new JsonParseError('Invalid JSON');

    // Assert
    expect(error.name).toBe('JsonParseError');
    expect(error.message).toBe('Invalid JSON');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof JsonParseError).toBe(true);
  });
});

describe('handleApiError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('[schema-error] should return 400 for SchemaParseError', async () => {
    // Arrange
    const schema = z.object({ name: z.string() });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ name: 123 });
    } catch (e) {
      zodError = e as ZodError;
    }
    const schemaError = new SchemaParseError(zodError!);

    // Act
    const response = handleApiError(schemaError, 'TestContext');
    const body = (await response.json()) as ErrorBody;

    // Assert
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid input data');
    expect(Array.isArray(body.details)).toBe(true);
  });

  it('[db-error] should return 500 for DbConfigError', async () => {
    // Arrange
    const dbError = new DbConfigError('DB not configured');

    // Act
    const response = handleApiError(dbError, 'TestContext');
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: 'Database configuration error',
    });
    expect(console.error).toHaveBeenCalledWith(
      'TestContext: DB not configured',
    );
  });

  it('[generic-error] should return 500 for generic Error', async () => {
    // Arrange
    const genericError = new Error('Something went wrong');

    // Act
    const response = handleApiError(genericError, 'TestContext');
    const body = (await response.json()) as ErrorBody;

    // Assert
    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: 'Internal server error',
    });
    expect(console.error).toHaveBeenCalledWith(
      'TestContext:',
      'Something went wrong',
    );
  });
});

describe('parseJsonBody', () => {
  it('[success] should parse valid JSON body', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockResolvedValue({ name: 'John', age: 30 }),
    } as unknown as Request;

    // Act
    const result = await parseJsonBody<{ name: string; age: number }>(
      mockRequest,
    );

    // Assert
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('[error] should throw JsonParseError for invalid JSON', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Unexpected token')),
    } as unknown as Request;

    // Act & Assert
    await expect(parseJsonBody(mockRequest)).rejects.toThrow(JsonParseError);
    await expect(parseJsonBody(mockRequest)).rejects.toThrow(
      'Invalid JSON body',
    );
  });
});
