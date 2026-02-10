# yujimin.dev

> A personal portfolio website with a retro Windows 95-style OS interface

**Live Site:** [yujimin.dev](https://yujimin.dev)

## Overview

This is Yuji Min's personal portfolio website, designed as an interactive retro operating system that recreates the nostalgic Windows 95 desktop experience. Visitors can explore different "applications" by clicking desktop icons, each revealing different aspects of my work and personality.

## Features

### 🖥️ Retro OS Experience

The entire website is designed as a Windows 95-style operating system with:

- **Desktop Environment**: Classic desktop with draggable icons
- **Window System**: Fully functional windows that can be dragged, resized, minimized, maximized, and closed
- **Taskbar**: Classic bottom taskbar showing open windows
- **Start Menu**: Access all available applications
- **Mobile Support**: Optimized full-screen window mode for mobile devices

### 📱 Available Applications

Click on desktop icons to launch these applications:

#### 📝 Blog

A technical blog featuring posts about software development, organized in a Windows Explorer-style interface.

- Browse posts by category using folder tree navigation
- Switch between List View and Gallery View
- Sort by title, date, summary, or category
- Syntax-highlighted code blocks with copy button
- MDX support for rich content

#### 👤 About Me

Terminal-style profile page with personal introduction and contact links.

#### 💬 Guestbook

A classic web guestbook where visitors can leave messages with infinite scroll.

#### 📊 Analytics

Real-time site statistics: page views, visitor countries, and more.

#### 📄 Resume

Professional resume dynamically fetched and parsed from Google Docs, with automatic caching for instant loading.

## Tech Stack

- **Framework**: Next.js 15.5 (React 19.1)
- **Styling**: Tailwind CSS v4 with custom retro theme
- **Content**: MDX blog posts with Velite (compile-time)
- **Database**: Drizzle ORM + Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers via OpenNext adapter
- **Cron Jobs**: Cloudflare Cron Triggers (resume cache refresh)
- **Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

For detailed technical documentation, architecture, and coding guidelines, see [CLAUDE.md](./CLAUDE.md).

---

## 🚀 Getting Started

Want to use this project as a template for your own portfolio? Follow these steps.

### Prerequisites

- **Node.js** 20+ and npm
- **Cloudflare account** (free tier works fine)

### 1. Clone the Repository

```bash
git clone https://github.com/nvrtmd/yujimin.dev.git
cd yujimin.dev
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Cron Job Authentication (Required only if using Resume feature)
# Authenticates periodic cache refresh from Google Docs via @yuji-min/google-docs-parser
CRON_SECRET=your-random-secret-key

# Resume Feature (optional — see "Resume Feature" section below)
# GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}
# GOOGLE_DOC_ID=your-google-doc-id
```

**How to generate credentials:**

- **CRON_SECRET**: Generate with `openssl rand -base64 32` or `openssl rand -hex 32`
  - Used to authenticate the cron job that periodically fetches resume data from Google Docs
  - **Only required if you're using the Resume feature** with Google Docs integration (see below)
  - If you remove the Resume feature or use a different implementation, this is not needed

> ℹ️ **Note:** Cloudflare D1 Token and Account ID are only needed for production deployment, not for local development. The local D1 database is automatically managed by Wrangler.

### 4. Initialize Database

```bash
npm run db:migrate:local
```

This creates `.wrangler/state/v3/d1/` with a SQLite database containing:

- `guestbook` — visitor messages
- `analytics` — page view tracking
- `resume_cache` — cached resume data

### 5. Customize Content

#### Update Personal Information

Edit `src/components/about/AboutApp.tsx` to update the `CONTACT_LINKS` array and your bio text. The component includes email, GitHub, and LinkedIn links by default.

#### Write Your First Blog Post

Create a new `.mdx` file in `src/posts/`:

```mdx
---
title: My First Blog Post
date: 2026-02-08
summary: A short description of the post
category: Development
---

# Hello World

Your content here...
```

The required frontmatter fields are: `title`, `date`, `summary`, `category`. `thumbnail` is optional.

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site!

---

## 📄 Resume Feature (Optional)

> ⚠️ **This feature is entirely optional.** If you don't need it or want to implement your own resume page, skip to [Option B: Remove Resume Feature](#option-b-remove-resume-feature).

### Why This Setup?

This project uses a unique approach for the Resume app:

- Fetches structured data from **Google Docs** using [`@yuji-min/google-docs-parser`](https://www.npmjs.com/package/@yuji-min/google-docs-parser)
- **Problem**: Direct Google API calls take 3-5 seconds per request
- **Solution**: Cloudflare Cron Trigger + D1 caching strategy

### How It Works

1. **Cron Job** (every 5 min) refreshes the cache by fetching from Google Docs
2. **D1 Database** stores the parsed resume data
3. **API Route** serves cached data instantly (~10-50ms)
4. **Background updates** keep data fresh without user-facing delays

**If you're building your own resume implementation or don't need this feature**, you can safely remove all resume-related components (cron job, database cache, Google Docs parser). See Option B below.

### Option A: Use Resume Feature

#### 1. Set Up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Docs API**: APIs & Services → Library → Search "Google Docs API" → Enable
3. Create a **Service Account**: APIs & Services → Credentials → Create Credentials → Service Account → download the JSON key file
4. Share your Google Doc with the service account email (`xxx@xxx.iam.gserviceaccount.com`) as Viewer

#### 2. Configure Environment Variables

> ⚠️ **Important:** The app runs on Cloudflare Workers (Edge Runtime), which has no filesystem access. `GOOGLE_APPLICATION_CREDENTIALS` must be the **JSON content as a string**, not a file path.

```bash
# Convert your service account JSON file to a single-line string:
cat your-service-account.json | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), separators=(',',':')))"
```

Add to `.env.local`:

```env
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...@....iam.gserviceaccount.com",...}
GOOGLE_DOC_ID=your-google-doc-id
```

**Get your Google Doc ID:** Open your Google Doc → copy the ID from the URL: `https://docs.google.com/document/d/YOUR_DOC_ID_HERE/edit`

#### 3. Format Your Google Doc

The parser expects specific heading styles. Check `src/app/api/resume/schema.ts` for the exact schema:

- **Heading 2** for main sections (e.g., "Skills", "Experience", "Education")
- **Heading 3** for subsections (e.g., job titles with format: `role | company | period`)
- **Bullet lists** for details

See [`@yuji-min/google-docs-parser` docs](https://www.npmjs.com/package/@yuji-min/google-docs-parser) for more details.

#### 4. Adjust Cron Schedule (Optional)

The default is every 5 minutes (`*/5 * * * *`) for quick testing. For production, consider changing to every hour to reduce API calls:

```toml
[triggers]
crons = ["0 * * * *"]  # Every hour (recommended for production)
```

Other options:

- `*/15 * * * *` - Every 15 minutes
- `*/30 * * * *` - Every 30 minutes
- `0 */6 * * *` - Every 6 hours

### Option B: Remove Resume Feature

If you don't need the Resume app or want to implement your own solution:

1. **Remove from app list**: Delete `RESUME_APP` from `APP_LIST` and the `'resume'` case from `getContent()` in `src/libs/contentProvider.tsx`
2. **Delete components**: Remove `src/components/resume/` and `src/app/api/resume/`
3. **Remove dependencies**: Uninstall `@yuji-min/google-docs-parser` and `googleapis` from `package.json`
4. **Remove cron trigger**: Delete the `[triggers]` section from `wrangler.toml`
5. **Revert worker config**: Change `main = "./worker-wrapper.js"` back to `main = ".open-next/worker.js"` in `wrangler.toml`
6. **Delete wrapper**: Remove `worker-wrapper.js` from the root directory
7. **Skip CRON_SECRET**: No need to set `CRON_SECRET` in `.env.local` or production secrets

After these changes, you won't need Google Docs credentials, cron jobs, or the resume cache table. Build your own resume component however you like!

---

## 🎨 Customization Tips

### Change Theme Colors

Edit the CSS variables in `src/app/globals.css`:

```css
:root {
  --color-desktop: #008080; /* Teal desktop background */
  --color-taskbar: #c0c0c0; /* Gray taskbar */
  --color-window-title-active: #000080; /* Blue active window title */
  /* ... */
}
```

### Modify Window Behavior

Edit `src/libs/contentProvider.tsx` to change default window sizes or capabilities:

```tsx
export const ABOUT_APP: App = {
  id: 'about',
  title: 'About Me',
  iconSrc: '/images/icons/about_me_img.png',
  renderType: 'csr',
  size: { width: 600, height: 500 },
  canMaximize: false,
  canMinimize: true,
};
```

### Add Your Own Apps

1. Create a new component in `src/components/your-app/`
2. Add an app definition in `src/libs/contentProvider.tsx`
3. Add an icon image to `public/images/icons/`
4. Register in `APP_LIST` and `getContent()`

---

## 🚀 Deployment to Cloudflare Workers

### 1. Create Cloudflare D1 Database

```bash
wrangler d1 create yujimin-dev-db
```

Copy the `database_id` from the output and update `wrangler.toml`.

### 2. Run Production Migrations

```bash
npm run db:migrate:prod
```

### 3. Set Production Secrets

```bash
wrangler secret put CRON_SECRET

# If using Resume feature:
wrangler secret put GOOGLE_APPLICATION_CREDENTIALS
wrangler secret put GOOGLE_DOC_ID
```

> ℹ️ **Note:** After deployment, manually trigger the first resume cache creation:
>
> ```bash
> curl -X POST https://your-site.com/api/resume/refresh \
>   -H "Authorization: Bearer YOUR_CRON_SECRET"
> ```

### 4. Deploy

```bash
npm run deploy
```

This command will:

1. Clean previous builds
2. Build Velite content (MDX blog posts)
3. Build with OpenNext for Cloudflare Workers
4. Copy static assets
5. Deploy to Cloudflare (uses `worker-wrapper.js` from `wrangler.toml`)

Your site will be live at `https://your-project.workers.dev`.

### 5. Verify Cron Trigger (If Using Resume Feature)

Check that the Cron Trigger is working:

```bash
# View real-time logs
wrangler tail --format=pretty

# Expected output every 5 minutes:
# [Cron] Resume cache refresh triggered at: 2026-02-09T02:40:32.000Z
# [Cron] ✅ Resume cache refreshed successfully: { duration: 1231, ... }

# Or check in Dashboard:
# Workers & Pages → your-worker → Triggers → Cron Triggers
```

### 6. Add Custom Domain (Optional)

```bash
wrangler domains add yourdomain.com
```

Or via Dashboard: Workers & Pages → Your Worker → Settings → Domains & Routes → Add Custom Domain

---

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server (includes typegen, db:generate, velite build)
npm run dev:cf           # Dev with Cloudflare Workers runtime
npm run preview          # Same as dev:cf

# Database
npm run db:generate      # Generate migrations
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:prod  # Apply migrations to production
npm run db:studio        # Open Drizzle Studio

# Build & Deploy
npm run build:deploy     # Full production build
npm run deploy           # Build and deploy to Workers (deploys worker-wrapper.js)

# Testing
npm run test             # Run unit/integration tests (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run Vitest with UI
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run Playwright with UI
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # TypeScript type checking

# Utilities
npm run cf-typegen       # Generate Cloudflare Worker types
npm run wrangler         # Run Wrangler CLI

# Debugging
wrangler tail            # View real-time Worker logs
wrangler tail --format=pretty  # Pretty formatted logs
```

---

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router (pages, API routes)
│   ├── api/          # API routes (resume, guestbook, analytics)
│   ├── blog/         # Blog pages (SSG)
│   └── [...rest]/    # Catch-all for desktop apps
├── components/       # React components
│   ├── layout/       # RetroOS shell, Taskbar, Desktop, StartMenu
│   ├── common/       # Shared components (Window, Button)
│   ├── blog/         # Blog app
│   ├── about/        # About Me app
│   ├── guestbook/    # Guestbook app
│   ├── analytics/    # Analytics app
│   ├── resume/       # Resume app (with D1 caching)
│   ├── icons/        # Icon components
│   └── mdx/          # MDX components
├── hooks/            # Custom React hooks
│   ├── window/       # Window management hooks
│   └── ...           # Other hooks
├── libs/             # Utilities and helpers
├── models/           # TypeScript types and Zod schemas
├── config/           # Personal configuration
├── db/               # Drizzle ORM schema
├── posts/            # MDX blog posts
└── __tests__/        # Test utilities and mocks
e2e/                  # Playwright E2E tests
worker-wrapper.js     # Cloudflare Worker with Cron support
```

---

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork and customize for your own use, open issues for bugs or suggestions, or submit pull requests.

---

## 📄 License

© 2024-2026 Yuji Min. All rights reserved.

Feel free to use this project as inspiration or a template for your own portfolio!

---

## 🙏 Acknowledgments

- Retro UI inspired by Windows 95
- Syntax highlighting: [Shiki](https://shiki.matsu.io/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Resume parsing: [`@yuji-min/google-docs-parser`](https://www.npmjs.com/package/@yuji-min/google-docs-parser)

---

**Developer Documentation:** For technical implementation details, coding standards, and architectural decisions, see [CLAUDE.md](./CLAUDE.md).
