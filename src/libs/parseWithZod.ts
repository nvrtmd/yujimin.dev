import type { ZodType, infer as ZodInfer } from 'zod';
import { ZodError } from 'zod';

export class SchemaParseError extends Error {
  public readonly originalError: ZodError;

  constructor(error: ZodError) {
    super('Schema validation failed');
    this.originalError = error;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchemaParseError);
    }
    this.name = 'SchemaParseError';
  }
}

export function parseWithZod<Schema extends ZodType>(
  response: unknown,
  schema: Schema,
): ZodInfer<Schema> {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new SchemaParseError(error);
    }
    throw new Error('An unexpected error occurred during parsing.');
  }
}
