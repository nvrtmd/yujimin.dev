import { z } from 'zod';
import { createResponseSchema } from './api';

const MAX_NICKNAME_LENGTH = 50;
const MAX_LOCATION_LENGTH = 50;
const MAX_WEBSITE_LENGTH = 200;
const MIN_TEXT_LENGTH = 1;

const nonEmptyText = (fieldName: string) =>
  z.string().refine((val) => val.trim().length >= MIN_TEXT_LENGTH, {
    message: `${fieldName} requires at least ${MIN_TEXT_LENGTH} character.`,
  });

export const guestbookEntrySchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  nickname: z.string(),
  location: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  message: z.string(),
});

export const guestbookFormSchema = z.object({
  nickname: nonEmptyText('Nickname').max(MAX_NICKNAME_LENGTH, {
    message: `Nickname must be less than ${MAX_NICKNAME_LENGTH} characters.`,
  }),
  location: z
    .string()
    .max(MAX_LOCATION_LENGTH, {
      message: `Location must be less than ${MAX_LOCATION_LENGTH} characters.`,
    })
    .optional(),
  // Allow empty string as a valid value for optional website field
  website: z
    .union([
      z.literal(''),
      z.url('Please enter a valid URL.').max(MAX_WEBSITE_LENGTH, {
        message: `Website must be less than ${MAX_WEBSITE_LENGTH} characters.`,
      }),
    ])
    .optional(),
  message: nonEmptyText('Message'),
});

export const guestbookListSchema = z.object({
  entries: z.array(guestbookEntrySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const guestbookListResponseSchema =
  createResponseSchema(guestbookListSchema);
export const guestbookEntryResponseSchema =
  createResponseSchema(guestbookEntrySchema);

export type GuestbookEntry = z.infer<typeof guestbookEntrySchema>;
export type GuestbookForm = z.infer<typeof guestbookFormSchema>;
export type GuestbookList = z.infer<typeof guestbookListSchema>;
export type GuestbookListResponse = z.infer<typeof guestbookListResponseSchema>;
export type GuestbookEntryResponse = z.infer<
  typeof guestbookEntryResponseSchema
>;
