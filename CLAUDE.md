# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website (yujimin.dev) with a retro Windows 95-style OS interface. Built with Next.js 15 (React 19) and deployed to Cloudflare Workers with D1 database.

## Development Commands

```bash
# Development (runs typegen, db generate, velite build, then next dev)
npm run dev

# Local development with Cloudflare Workers runtime
npm run dev:cf

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test          # Unit/Integration tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)

# Database
npm run db:generate         # Generate Drizzle migrations
npm run db:migrate:local    # Apply migrations locally
npm run db:migrate:prod     # Apply migrations to production
npm run db:studio           # Open Drizzle Studio

# Build & Deploy
npm run build:deploy        # Full build for Cloudflare
npm run deploy              # Build and deploy to Cloudflare Workers
```

## Architecture

### Stack

- **Framework:** Next.js 15.5 with App Router
- **Content:** Velite for MDX blog posts (built at compile time)
- **Database:** Drizzle ORM + Cloudflare D1 (SQLite)
- **Styling:** Tailwind CSS v4 with custom retro OS theme
- **Deployment:** OpenNext adapter for Cloudflare Workers
- **Testing:** Vitest + React Testing Library (unit/integration), Playwright (E2E)

### Directory Structure

```
src/
├── app/           # Next.js App Router (pages, API routes)
├── components/    # React components organized by feature
│   ├── layout/    # RetroOS shell, Taskbar, DesktopIcon, StartMenu
│   ├── common/    # Shared components (Window, Button)
│   └── [feature]/ # Feature-specific components
├── hooks/         # Custom hooks (window management, drag/resize)
├── libs/          # Utilities (analytics, contentProvider, Zod parsing)
├── models/        # TypeScript types and Zod schemas
├── db/            # Drizzle schema and database setup
├── posts/         # MDX blog posts
└── __tests__/     # Test utilities, mocks, setup
e2e/               # Playwright E2E tests
```

### Key Patterns

**Window System:** The UI is a desktop environment with draggable/resizable windows. Window state management is in `src/hooks/window/`. Each "app" (Blog, Guestbook, About, etc.) renders inside a Window component.

**Content:** Blog posts are MDX files in `src/posts/`, processed by Velite with rehype plugins for syntax highlighting. Access via `#site/content` import alias.

**Database:** Two Drizzle configs exist - `drizzle.config.ts` for production (D1 HTTP) and `drizzle.local.config.ts` for local dev (better-sqlite3).

**Mobile:** Full-screen window mode on mobile with safe area insets. Check `useMobile` hook.

**Resume API:** Fetches Google Docs content via `@yuji-min/google-docs-parser/edge`. Requires `GOOGLE_APPLICATION_CREDENTIALS` as a JSON string (not a file path) because Edge Runtime has no filesystem access.

### Path Aliases

- `@/*` → `./src/*`
- `@/posts/*` → `./posts/*`
- `#site/content` → `./.velite/index.js` (generated blog content)

---

## Performance Guidelines

1. **Eliminate Waterfalls (CRITICAL):** Parallelize independent async operations. Use `Promise.all()` for concurrent fetches. Defer `await` until actually needed.

2. **Bundle Size (CRITICAL):** Avoid barrel file imports. Use dynamic imports for heavy components. Prefer direct file imports.

3. **Server Performance:** Use `React.cache()` for per-request deduplication. Minimize serialization at RSC boundaries.

4. **Database:** Use `db.batch()` for parallel independent queries. Use `db.transaction()` only when atomicity is required. Use `ctx.waitUntil()` for non-critical background writes (e.g., analytics).

---

## Code Style

- ESLint with Next.js core-web-vitals + Prettier integration
- Prettier: single quotes, JSX single quotes, trailing commas, 2-space tabs
- Strict TypeScript with Zod validation for API inputs

---

## 🛠️ Refactoring Guidelines

### Core Philosophy (MANDATORY)

Refactoring is about **improving the internal structure without changing the external behavior**.

#### 1. Behavior Preservation (Safety First)

- **The Golden Rule**: If the tests fail or the build breaks, the refactoring is wrong. Revert immediately.
- ✅ All existing Unit/Integration/E2E tests must pass 100%.
- ✅ No TypeScript errors, build errors, or ESLint warnings.
- ✅ If you modify a file that has pre-existing warnings (e.g., `exhaustive-deps`), **fix them** as part of the refactoring.

#### 2. Readability over Cleverness

- Prioritize clarity for a new junior developer.
- **Comment Policy:**
  - **English Only.** All comments must be in English.
  - **"Why" over "How":** Explain the rationale, not the mechanics.
  - **Minimize:** Only add comments when the reason is not obvious from the code.
  - **Delete Obvious Comments:** Remove comments that restate what the code does.
- ❌ Avoid one-liners if they obscure meaning.
- ✅ Prefer explicit variable names and structured logic.

### Structural Improvements

#### 1. Reduce Complexity & Cognitive Load

- **Early Returns:** Use guard clauses to eliminate nested `if/else`.
- **Extract Magic Values:** Replace hardcoded strings/numbers with named `UPPER_SNAKE_CASE` constants at the top of the file.

#### 2. High Cohesion & Low Coupling

- **Single Responsibility:** Extract complex logic into Custom Hooks or Utility Functions.
- **Functional State Updates:** Use a separate helper (e.g., `createNextState`) for complex state creation logic.
- **Co-location First (CRITICAL):**
  - ✅ Keep constants, helpers, and types used **only in one file** inside that file.
  - ✅ Extract to a separate file only when used by **2+ files** or the file exceeds 200 lines.
  - ❌ Never create `ComponentName.constants.ts` for constants used only in `ComponentName.tsx`.
  - **Placement Priority:** Same File → Same Directory → Global (`@/libs`, only if 3+ unrelated modules use it)

#### 3. File Splitting (When Necessary)

Only extract to a separate file when:

- The file exceeds **200 lines** AND the extracted logic is complex (>30 lines), OR
- The logic is **shared by 2+ files**.

### Next.js & React/TypeScript Best Practices

- **Strict Typing:** Never use `any`. Use `unknown` for uncertain types.
- **Memoization:** Wrap event handler props with `useCallback`. Functions in `useEffect` dependency arrays **must** be memoized.
- **Dependency Arrays:** Strictly adhere to `react-hooks/exhaustive-deps`. Never suppress with `// eslint-disable`.
- **Server Components:** Default to server-side. Use `'use client'` only when necessary.

### API Route-Specific Patterns

#### Input Validation (MANDATORY)

Always validate with Zod before processing. Use `parseWithZod` helper.

```typescript
const postSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const data = parseWithZod(body, postSchema);
  } catch (e) {
    return handleApiError(e, 'Route POST');
  }
}
```

#### Error Handling (3-Layer Strategy)

- **Layer 1 (Input):** `JsonParseError` → 400, `SchemaParseError` → 400
- **Layer 2 (Business):** Custom errors (`RateLimitError`, `AuthError`) → 4xx
- **Layer 3 (Unexpected):** All others → 500, never expose internals

#### Response Formatting

Always use `successResponse`, `errorResponse`, `messageResponse` from `src/app/api/helpers.ts`. Never return raw JSON.

#### Security Checklist

- [ ] Rate limiting on POST/PUT/DELETE
- [ ] Input sanitization via Zod (trim + max length)
- [ ] Never log or return sensitive data in responses

### AI & Developer Protocol (CRITICAL)

**For every file refactored, follow this process:**

1. **Analyze & Plan:** State your plan before writing code.
2. **Atomic Execution:** Refactor one file/module at a time.
3. **Mandatory Report:** After each file, provide:
   - What Changed?
   - How is it Improved? (Readability / Maintainability / Performance / Reliability)
   - Why this Approach?
   - Verification: [ ] No TS errors [ ] No ESLint warnings [ ] Tests passing
4. **Verification:** Run lint, build, unit tests, and confirm E2E flows are unbroken.

### Anti-Patterns

- **Shotgun Surgery:** Small changes to many files at once.
- **Silent Failures:** Empty `try/catch` blocks.
- **Over-abstraction:** Generic wrappers used only once.
- **Premature File Splitting:** Extracting constants/utils used in only one file.
- **Non-English Comments.**
- **Obvious Comments** that restate what the code does.
- **Sequential DB queries** when `db.batch()` would suffice.
- **Blocking on non-critical ops** instead of `ctx.waitUntil()`.
- **Inconsistent response formats** (raw JSON instead of helpers).

---

## 🧪 Test Rules

### Naming & Structure Conventions (MANDATORY)

- **Language:** English ONLY.
- **Pattern:** `[Action/Feature] Expected behavior`
  - ✅ `it('[init] should initialize with correct default state')`
  - ❌ `it('should work')` (too vague)
- **AAA Pattern:** All tests must follow Arrange-Act-Assert with explicit comments.

```ts
it('[calculation] should return correct sum', () => {
  // Arrange
  const a = 5;
  const b = 10;

  // Act
  const result = add(a, b);

  // Assert
  expect(result).toBe(15);
});
```

### Hybrid Testing Strategy

#### Unit/Integration Tests (Verification-focused — "Contracts")

- Sorting & filtering algorithms
- State transitions
- Business logic (pure functions, reducers, utilities)
- Network contracts (correct payloads sent, errors handled — use MSW)

#### E2E Tests (Experience-focused — "Connections")

- User flows (Click → URL change → List update)
- Responsive layout
- Actual page navigation
- Accessibility (basic a11y on critical paths)

#### What to Avoid

- Re-verifying algorithm logic in E2E if covered in unit tests.
- Testing implementation details (internal state, private methods).
- Manual `global.fetch` mocks — use MSW instead.

### Advanced Strategies

- **Network Testing:** Use MSW for integration tests. Real backend for E2E where possible.
- **Deterministic Environment:** Freeze time with `vi.setSystemTime`. Reset global state in `afterEach`.
- **Coverage as Radar, Not Target:** Use coverage to find missing business logic, not to hit 80% with meaningless tests.

### Unit Tests

- Framework: `Vitest` + React Testing Library
- Use `user-event` instead of `fireEvent` for realistic interactions.

### E2E Tests

- Framework: `Playwright`
- Use `retries` only on CI. Enable `trace: 'on-first-retry'`.
- Include basic a11y checks on critical pages.

### Element Selector Priority

1. **Accessibility Role & Text** (recommended): `getByRole('button', { name: 'Save' })`
2. **Label & Placeholder** (forms): `getByLabel('Email')`
3. **Test ID** (escape hatch): `getByTestId('complex-wrapper')`

### Robustness Rules

- **No fixed waits:** Never `waitForTimeout(1000)`. Use `expect(...).toBeVisible()`.
- **Factories over fixtures:** Use factory functions for test data.
- **Limited snapshots:** `toMatchInlineSnapshot` for small objects only. No full page screenshots.

### Test File Location

- Unit tests: `.test.ts` / `.test.tsx` — next to the source file
- Integration tests: `.integration.test.ts` — next to the source file
- E2E tests: `e2e/` directory

---

## Current Status

The project has an established test suite (Vitest + Playwright) and is actively being refactored for improved maintainability. Key areas to be mindful of:

- **Refactoring in progress:** Some components still mix business logic with UI. Extract to hooks when encountered.
- **Docs Update:** If you discover hidden logic or edge cases during refactoring, update this `CLAUDE.md` to document them.
