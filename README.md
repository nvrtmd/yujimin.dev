# yujimin.dev

> A retro desktop-inspired personal site by Yuji Min

**Live Site:** [yujimin.dev](https://yujimin.dev)

## Overview

A personal portfolio site designed as an interactive retro desktop environment. Visitors can explore different apps by clicking desktop icons, each revealing different aspects of my work and personality.

## Key Features

### 🖥️ Windowed Apps

The site runs as a retro desktop where every section is its own window:

- **Desktop Environment**: Classic desktop with draggable icons
- **Window System**: Fully functional windows that can be dragged, resized, minimized, maximized, and closed
- **Taskbar**: Bottom taskbar showing open windows with a Start menu
- **Mobile Support**: Optimized full-screen window mode for mobile devices

### 📱 Available Apps

Click on desktop icons to launch these apps:

#### 📝 Blog

Notes on software engineering, organized in a file explorer-style interface.

- Browse posts by category using folder tree navigation
- Switch between List View and Gallery View
- Sort by title, date, summary, or category
- Syntax-highlighted code blocks with copy button
- MDX support for rich content

#### 👤 About

Profile page with personal introduction and contact links.

#### 💬 Guestbook

Leave a message or browse messages left by others.

#### 📊 Analytics

View live visitor stats, including page views and where visitors are coming from.

#### 📄 Resume

Resume that fetches content from Google Docs and keeps it cached for fast delivery.

## Built With

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4 with custom retro theme
- **Content**: MDX blog posts with Velite (compile-time)
- **Database**: Drizzle ORM + Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers via OpenNext adapter
- **Cron Jobs**: Cloudflare Cron Triggers (resume cache refresh)
- **Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

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
│   ├── layout/       # Desktop shell, Taskbar, Desktop, StartMenu
│   ├── common/       # Shared components (Window, Button)
│   ├── blog/         # Blog app
│   ├── about/        # About app
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

## 📄 License

© 2024-2026 Yuji Min. All rights reserved.

---

## 🙏 Acknowledgments

- Retro desktop UI aesthetic
- Syntax highlighting: [Prism](https://prismjs.com/) (via rehype-prism-plus)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Resume parsing: [`@yuji-min/google-docs-parser`](https://www.npmjs.com/package/@yuji-min/google-docs-parser)
