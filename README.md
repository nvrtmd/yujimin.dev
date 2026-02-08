# yujimin.dev

> A personal portfolio website with a retro Windows 95-style OS interface

**Live Site:** [yujimin.dev](https://yujimin.dev)

## Overview

This is Yuji Min's personal portfolio website, designed as an interactive retro operating system that recreates the nostalgic Windows 95 desktop experience. Visitors can explore different "applications" by clicking desktop icons, each revealing different aspects of my work and personality.

## Features

### 🖥️ Retro OS Experience

The entire website is designed as a Windows 95-style operating system with:

- **Desktop Environment**: Classic desktop with draggable icons
- **Window System**: Fully functional windows that can be:
  - Dragged and repositioned
  - Resized (where applicable)
  - Minimized to the taskbar
  - Maximized to fullscreen
  - Closed
- **Taskbar**: Classic bottom taskbar showing open windows
- **Start Menu**: Access all available applications
- **Mobile Support**: Optimized full-screen window mode for mobile devices

### 📱 Available Applications

Click on desktop icons to launch these applications:

#### 📝 Blog

A technical blog featuring posts about software development, organized in a Windows Explorer-style interface.

**Features:**

- Browse posts by category using folder tree navigation
- Switch between List View and Gallery View
- Sort by title, date, summary, or category
- Syntax-highlighted code blocks
- MDX support for rich content

#### 👤 About Me

Learn more about me with a terminal-style profile page.

**Contents:**

- Personal introduction
- Contact information
- Links to GitHub, LinkedIn, and email

#### 💬 Guestbook

A classic web guestbook where visitors can leave messages.

**Features:**

- Submit messages with name and content
- Browse messages from other visitors
- Infinite scroll for older entries
- Real-time updates

#### 📊 Analytics

View real-time site statistics in a compact dashboard.

**Metrics:**

- Today's page views
- Total page views
- Visitor countries count
- Top visiting country
- Most recent visitor location

#### 📄 Resume

My professional resume, dynamically fetched and parsed from Google Docs.

**Features:**

- Clean, modern resume layout
- Sections: Skills, Experience, Open Source, Leadership & Community, Education
- PDF download option
- Auto-sync from source document

## Tech Stack

Built with modern web technologies:

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS v4 with custom retro theme
- **Content**: MDX blog posts with Velite
- **Database**: Drizzle ORM + Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers (serverless)

For detailed technical documentation, see [CLAUDE.md](./CLAUDE.md).

---

## 🚀 Getting Started

Want to use this project as a template for your own portfolio? Follow these steps:

### Prerequisites

- **Node.js** 20+ and npm
- **Cloudflare account** (free tier works fine)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/nvrtmd/yujimin.dev-dev.git
cd yujimin.dev-dev
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Cloudflare Configuration
CLOUDFLARE_D1_TOKEN=your-cloudflare-d1-token
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id

# Cron Job Authentication
CRON_SECRET=your-random-secret-key

# Resume Feature (OPTIONAL - see "Resume Feature" section below)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# GOOGLE_DOC_ID=your-google-doc-id
# NEXT_PUBLIC_API_URL=/api/resume
```

**How to get your Cloudflare credentials:**

1. **Account ID**:
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Copy the Account ID from the right sidebar

2. **D1 Token**:
   - Dashboard → My Profile → API Tokens → Create Token
   - Use "Edit Cloudflare Workers" template
   - Add "Account.D1" permission

3. **CRON_SECRET**:
   - Generate with: `openssl rand -hex 32`

### 4. Initialize Database

```bash
# Create local D1 database and run migrations
npm run db:migrate:local
```

This creates `.wrangler/state/v3/d1/` with a SQLite database containing:

- `guestbook` table - for visitor messages
- `analytics` table - for page view tracking
- `resume_cache` table - for cached resume data

### 5. Customize Content

#### Update Personal Information

Edit `src/components/about/AboutApp.tsx` to add your own info:

```tsx
const PERSONAL_INFO = {
  name: 'Your Name',
  email: 'your.email@example.com',
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  bio: 'Your introduction here...',
};
```

#### Write Your First Blog Post

Create a new MDX file in `src/posts/`:

```
src/posts/
└── my-first-post/
    ├── my-first-post.mdx
    └── cover.png (optional)
```

Example post format:

```mdx
---
title: My First Blog Post
description: A short description
date: 2026-02-07
tags: [nextjs, typescript]
---

# Hello World

Your content here...
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site!

**Note:** You may see a warning about missing D1 path on first run - this is normal. The database will be created automatically.

---

## 📄 Resume Feature (Optional)

The Resume app fetches data from Google Docs using [`@yuji-min/google-docs-parser`](https://www.npmjs.com/package/@yuji-min/google-docs-parser). This is **completely optional** - you can use it or remove it.

### Option A: Use Resume Feature

If you want to keep the Resume app and sync it from Google Docs:

#### 1. Set Up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Docs API**:
   - APIs & Services → Library → Search "Google Docs API" → Enable
4. Create a **Service Account**:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Download the JSON key file
5. Share your Google Doc with the service account email:
   - Open your Google Doc
   - Click "Share" → Add service account email (looks like `xxx@xxx.iam.gserviceaccount.com`)
   - Give "Viewer" permission

#### 2. Configure Environment Variables

Add to your `.env.local`:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account.json
GOOGLE_DOC_ID=1Pd_vr6HTAuQDmsGCnBdQb2_ciKAhNIbXXzYaWbTEA1A
NEXT_PUBLIC_API_URL=/api/resume
```

**Get your Google Doc ID:**

- Open your Google Doc
- Copy the ID from URL: `https://docs.google.com/document/d/YOUR_DOC_ID_HERE/edit`

#### 3. Format Your Google Doc

The parser expects a specific structure:

- **Heading 1** for main sections (e.g., "Experience", "Education")
- **Heading 2** for subsections (e.g., job titles, company names)
- **Bullet points** for details

See [`@yuji-min/google-docs-parser` documentation](https://www.npmjs.com/package/@yuji-min/google-docs-parser) for more details.

#### 4. Test It

```bash
npm run dev
```

Open the Resume app - your data should load from Google Docs!

---

### Option B: Remove Resume Feature

If you don't need the Resume functionality:

#### 1. Remove from App List

Edit `src/libs/contentProvider.tsx`:

```diff
export const APP_LIST: App[] = [
  BLOG_APP,
  ABOUT_APP,
  GUESTBOOK_APP,
  ANALYTICS_APP,
- RESUME_APP,
];

export function getContent(id: Omit<AppId, 'blog'>): ReactNode {
  switch (id) {
    case 'about':
      return <AboutApp />;
    case 'guestbook':
      return <GuestbookApp />;
    case 'analytics':
      return <AnalyticsApp />;
-   case 'resume':
-     return <ResumeApp />;
    default:
      return null;
  }
}
```

#### 2. Delete Resume Files

```bash
# Component files
rm -rf src/components/resume/

# API routes
rm -rf src/app/api/resume/

# Utility functions
rm -rf src/libs/resume/

# Icons
rm -rf src/components/icons/resume/
rm public/images/icons/resume_img.png
```

#### 3. Remove Dependencies (Optional)

Edit `package.json` and remove:

```diff
- "@yuji-min/google-docs-parser": "^1.0.3",
- "googleapis": "^164.1.0",
```

Then reinstall:

```bash
npm install
```

#### 4. Clean Environment Variables

Remove from `.env.local`:

```diff
- GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
- GOOGLE_DOC_ID=your-google-doc-id
- NEXT_PUBLIC_API_URL=/api/resume
```

That's it! The Resume app is now completely removed.

---

## 🎨 Customization Tips

### Change Theme Colors

Edit `src/app/globals.css`:

```css
:root {
  --color-desktop: #008080; /* Teal desktop background */
  --color-taskbar: #c0c0c0; /* Gray taskbar */
  --color-window-title-active: #000080; /* Blue active window title */
  /* ... more variables ... */
}
```

### Modify Window Behavior

Edit `src/libs/contentProvider.tsx` to change default window sizes:

```tsx
export const ABOUT_APP: App = {
  id: 'about',
  title: 'About Me',
  iconSrc: '/images/icons/about_me_img.png',
  renderType: 'csr',
  size: { width: 600, height: 500 }, // ← Change this
  canMaximize: false, // ← Or this
  canMinimize: true,
};
```

### Add Your Own Apps

1. Create a new component in `src/components/your-app/`
2. Add app definition in `src/libs/contentProvider.tsx`
3. Add icon image to `public/images/icons/`
4. Register in `APP_LIST` and `getContent()` function

---

## 🚀 Deployment to Cloudflare Workers

### 1. Create Cloudflare D1 Database

```bash
wrangler d1 create yujimin-dev-db
```

Copy the `database_id` from output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "yujimin-dev-db"
database_id = "paste-your-database-id-here"
```

### 2. Run Production Migrations

```bash
npm run db:migrate:prod
```

### 3. Set Production Secrets

```bash
wrangler secret put CLOUDFLARE_D1_TOKEN
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CRON_SECRET

# If using Resume feature:
wrangler secret put GOOGLE_APPLICATION_CREDENTIALS
wrangler secret put GOOGLE_DOC_ID
wrangler secret put NEXT_PUBLIC_API_URL
```

### 4. Deploy!

```bash
npm run deploy
```

Your site will be live at: `https://your-project.workers.dev`

### 5. Add Custom Domain (Optional)

Via CLI:

```bash
wrangler domains add yourdomain.com
```

Or via Dashboard:

- Workers & Pages → Your Worker → Settings → Domains & Routes → Add Custom Domain

---

## 📝 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:cf           # Dev with Cloudflare Workers runtime

# Database
npm run db:generate      # Generate migrations
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:prod  # Apply migrations to production
npm run db:studio        # Open Drizzle Studio

# Build & Deploy
npm run build:deploy     # Full production build
npm run deploy           # Build and deploy to Workers

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # TypeScript type checking
```

For a complete list of commands and detailed architecture information, see [CLAUDE.md](./CLAUDE.md).

---

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router (pages, API routes)
├── components/       # React components
│   ├── layout/       # RetroOS shell, Taskbar, Desktop
│   ├── common/       # Shared components (Window, Button)
│   ├── blog/         # Blog app
│   ├── about/        # About Me app
│   ├── guestbook/    # Guestbook app
│   ├── analytics/    # Analytics app
│   └── resume/       # Resume app (optional)
├── hooks/            # Custom React hooks
├── libs/             # Utilities and helpers
├── models/           # TypeScript types and Zod schemas
├── db/               # Database schema
└── posts/            # MDX blog posts
```

---

## 🤝 Contributing

This is a personal portfolio project, but feel free to:

- Fork and customize for your own use
- Open issues for bugs or suggestions
- Submit pull requests for improvements

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

**Developer Documentation**: For technical implementation details, coding standards, and architectural decisions, see [CLAUDE.md](./CLAUDE.md).
