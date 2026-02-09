import { z } from 'zod';
import { parseWithZod, SchemaParseError } from './parseWithZod';

describe('parseWithZod', () => {
  const userSchema = z.object({
    name: z.string(),
    age: z.number().int().min(0),
    email: z.string().email(),
  });

  it('[valid] should parse valid data successfully', () => {
    const validData = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    };

    const result = parseWithZod(validData, userSchema);

    expect(result).toEqual(validData);
  });

  it.each([
    [
      'invalid field values',
      {
        name: 'John',
        age: -5,
        email: 'invalid-email',
      },
    ],
    [
      'wrong types',
      {
        name: 123,
        age: 'not a number',
      },
    ],
    [
      'missing required fields',
      {
        name: 'John',
      },
    ],
  ])('[invalid] should throw SchemaParseError for %s', (_, invalidData) => {
    expect(() => parseWithZod(invalidData, userSchema)).toThrow(
      SchemaParseError,
    );
  });

  it('[invalid] should throw SchemaParseError with correct structure', () => {
    const invalidData = {
      name: 123,
      age: 'not a number',
    };

    try {
      parseWithZod(invalidData, userSchema);
      expect.fail('Should have thrown SchemaParseError');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SchemaParseError);
      expect((error as SchemaParseError).name).toBe('SchemaParseError');
      expect((error as SchemaParseError).message).toBe(
        'Schema validation failed',
      );
      expect((error as SchemaParseError).originalError).toBeDefined();
    }
  });

  it('should throw generic error for non-ZodError exceptions', () => {
    const mockSchema = {
      parse: vi.fn(() => {
        throw new Error('Unexpected error');
      }),
    } as unknown as z.ZodType;

    expect(() => parseWithZod({}, mockSchema)).toThrow(
      'An unexpected error occurred during parsing.',
    );
  });

  it('[valid] should return transformed data, not just original input', () => {
    // Schema with transformation logic (String -> Number)
    const transformSchema = z.object({
      id: z.string().transform((val) => Number(val)),
    });

    // Input is a string
    const input = { id: '42' };

    // Execution
    const result = parseWithZod(input, transformSchema);

    // Validation: return value should be the number 42.
    // If there's a bug returning the original object, it would be the string '42' and the test would fail.
    expect(result.id).toBe(42);
    expect(typeof result.id).toBe('number');
  });
});
