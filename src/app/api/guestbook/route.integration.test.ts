import { POST } from './route';
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
// @ts-expect-error - better-sqlite3 has no type declarations
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { parseWithZod } from '@/libs/parseWithZod';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite);

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>();
  return {
    ...actual,
    getDbInstance: vi.fn(() => ({ db })),
  };
});

vi.mock('@/libs/parseWithZod', () => ({
  parseWithZod: vi.fn(),
}));

function toSqliteDatetime(date: Date): string {
  return date
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');
}

function insertPreviousEntry(ip: string, createdAt: string): void {
  sqlite
    .prepare(
      'INSERT INTO guestbook (nickname, message, ip_address, created_at) VALUES (?, ?, ?, ?)',
    )
    .run('Prev User', 'Prev Msg', ip, createdAt);
}

function createPostRequest(ip: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/guestbook', {
    method: 'POST',
    headers: { 'cf-connecting-ip': ip },
    body: JSON.stringify({ nickname: 'New', message: 'New' }),
  });
}

function getEntryCount(): number {
  const result = sqlite
    .prepare('SELECT count(*) as count FROM guestbook')
    .get() as { count: number };
  return result.count;
}

describe('Integration: Rate Limiting (1 Minute Rule)', () => {
  const TEST_IP = '1.2.3.4';

  beforeEach(() => {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS guestbook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL,
        message TEXT NOT NULL,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        location TEXT,
        website TEXT
      );
    `);

    (parseWithZod as Mock).mockReturnValue({
      nickname: 'Tester',
      message: 'Hello',
    });
  });

  afterEach(() => {
    sqlite.exec('DELETE FROM guestbook');
  });

  it('[rate-limit] should return 429 when last post was less than 60 seconds ago', async () => {
    // Arrange
    // 58 seconds ago: within rate limit window (safety margin for execution latency)
    const fiftyEightSecondsAgo = toSqliteDatetime(
      new Date(Date.now() - 58 * 1000),
    );
    insertPreviousEntry(TEST_IP, fiftyEightSecondsAgo);
    const req = createPostRequest(TEST_IP);

    // Act
    const res = await POST(req);
    const body = (await res.json()) as { error: string };

    // Assert
    expect(res.status).toBe(429);
    expect(body.error).toMatch(/wait 1 minute/i);
    expect(getEntryCount()).toBe(1);
  });

  it('[rate-limit] should return 201 when last post was more than 60 seconds ago', async () => {
    // Arrange
    // 62 seconds ago: outside rate limit window (safety margin for execution latency)
    const sixtyTwoSecondsAgo = toSqliteDatetime(
      new Date(Date.now() - 62 * 1000),
    );
    insertPreviousEntry(TEST_IP, sixtyTwoSecondsAgo);
    const req = createPostRequest(TEST_IP);

    // Act
    const res = await POST(req);

    // Assert
    expect(res.status).toBe(201);
    expect(getEntryCount()).toBe(2);
  });
});
