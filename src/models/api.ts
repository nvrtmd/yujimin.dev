import { z, type ZodType } from 'zod';

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export const apiSuccessMessageSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export const apiMessageResponseSchema = z.discriminatedUnion('success', [
  apiSuccessMessageSchema,
  apiErrorResponseSchema,
]);

export function createSuccessResponseSchema<T extends ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
}

export function createResponseSchema<T extends ZodType>(dataSchema: T) {
  return z.discriminatedUnion('success', [
    createSuccessResponseSchema(dataSchema),
    apiErrorResponseSchema,
  ]);
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ApiMessageResponse = z.infer<typeof apiMessageResponseSchema>;
