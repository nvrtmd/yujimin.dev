import { z } from 'zod';
import { createResponseSchema, apiMessageResponseSchema } from './api';

export const analyticsVisitSchema = z.object({
  path: z.string(),
  referrer: z.string().optional(),
});

export const analyticsSchema = z.object({
  todaysViews: z.number().int().nonnegative(),
  totalViews: z.number().int().nonnegative(),
  totalCountries: z.number().int().nonnegative(),
  topCountry: z.string(),
  lastVisitor: z.string(),
});

export const analyticsResponseSchema = createResponseSchema(analyticsSchema);
export const analyticsSubmitResponseSchema = apiMessageResponseSchema;

export type AnalyticsVisit = z.infer<typeof analyticsVisitSchema>;
export type Analytics = z.infer<typeof analyticsSchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
