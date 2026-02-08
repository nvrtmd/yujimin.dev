import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/db';
import { SchemaParseError } from '@/libs/parseWithZod';

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_SERVER_ERROR = 500;

const ERROR_INVALID_INPUT = 'Invalid input data';
const ERROR_DB_CONFIG = 'Database configuration error';
const ERROR_INTERNAL = 'Internal server error';
const ERROR_INVALID_JSON = 'Invalid JSON body';
const ERROR_DB_BINDING_NOT_FOUND = 'Database binding not found';

export function jsonResponse<T>(data: T, status = HTTP_OK) {
  return NextResponse.json(data, { status });
}

export function successResponse<T>(data: T, status = HTTP_OK) {
  return jsonResponse({ success: true, data }, status);
}

export function messageResponse(message: string, status = HTTP_OK) {
  return jsonResponse({ success: true, message }, status);
}

export function errorResponse(error: string, status: number) {
  return jsonResponse({ success: false, error }, status);
}

export function validationErrorResponse(
  error: string,
  details?: string[],
  status = HTTP_BAD_REQUEST,
) {
  return jsonResponse({ success: false, error, details }, status);
}

export function getDbInstance() {
  const { env, ctx } = getCloudflareContext();

  if (!env.DB) {
    throw new DbConfigError(ERROR_DB_BINDING_NOT_FOUND);
  }

  return { db: getDb(env.DB), ctx };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly name: string,
  ) {
    super(message);
  }
}

export class DbConfigError extends ApiError {
  constructor(message: string) {
    super(message, 'DbConfigError');
  }
}

export class JsonParseError extends ApiError {
  constructor(message: string) {
    super(message, 'JsonParseError');
  }
}

export function handleApiError(e: unknown, context: string) {
  if (e instanceof JsonParseError) {
    return errorResponse(ERROR_INVALID_JSON, HTTP_BAD_REQUEST);
  }

  if (e instanceof SchemaParseError) {
    const details = e.originalError.issues.map((issue) => issue.message);
    return validationErrorResponse(ERROR_INVALID_INPUT, details);
  }

  if (e instanceof DbConfigError) {
    console.error(`${context}: ${e.message}`);
    return errorResponse(ERROR_DB_CONFIG, HTTP_INTERNAL_SERVER_ERROR);
  }

  console.error(
    `${context}:`,
    e instanceof Error ? e.message : 'Unknown error',
  );
  return errorResponse(ERROR_INTERNAL, HTTP_INTERNAL_SERVER_ERROR);
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new JsonParseError(ERROR_INVALID_JSON);
  }
}
