import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const guestbookTable = sqliteTable('guestbook', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  nickname: text('nickname').notNull(),
  location: text('location'),
  website: text('website'),
  message: text('message').notNull(),
  // IP address for rate limiting
  ipAddress: text('ip_address'),
});

export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: text('timestamp')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  path: text('path').notNull(),
  userAgent: text('user_agent'),
  referer: text('referer'),
  country: text('country'),
});

export const resumeCache = sqliteTable('resume_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cacheKey: text('cache_key').notNull().unique(),
  content: text('content', { mode: 'json' }).notNull(),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  docId: text('doc_id'),
  status: text('status').notNull().default('success'),
  errorMessage: text('error_message'),
});
