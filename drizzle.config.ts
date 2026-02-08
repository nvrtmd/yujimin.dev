import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: '644edefb-ec4d-4143-ad0b-93f885d7ac1c',
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config;
