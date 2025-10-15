# PahamPajak Tryout Admin

PahamPajak Tryout Admin is a secure administrative console for managing online tax examination content. The application follows the architecture defined in `tech_doc.md`, focusing on robust authentication, granular RBAC enforcement, and a productive authoring workflow for exams and questions.

## Key Features

- **Supabase Auth + RBAC** with session persistence and role verification against `public.profiles`.
- **Protected admin routes** guarded via a client-side `ProtectedRoute` and typed Supabase context.
- **Single login experience** that redirects admins to `/admin` and participants to `/dashboard`, with content filtered by purchased packages.
- **Exam management (CRUD)** including metadata editing, draft/publish toggles, and deletion safeguards.
- **Question management (CRUD)** with modal-based authoring backed by transactional PostgreSQL RPC functions.
- **Reactive data layer** powered by TanStack Query with optimistic refresh behaviour.
- **State management** handled through Zustand to keep auth/session context deterministic.
- **Tailwind & shadcn/ui** design system for accessible, responsive layouts.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) (Auth, Postgres, RPC)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Sonner](https://sonner.emilkowal.ski/) notifications

## Prerequisites

- Node.js 18 or later
- Supabase project (local via `supabase start` or hosted)
- Supabase CLI for applying migrations (recommended)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the Supabase credentials in `.env.local`.

3. **Run database migrations**
   ```bash
   supabase db reset
   ```
   This applies `supabase/migrations/001_init_admin_schema.sql`, creating tables, RLS policies, enums, and RPC helpers defined in the spec.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000). Authenticated admins are redirected to `/admin`; unauthenticated users are sent to `/login`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=optional_for_local_migrations
```

## Project Structure

```
src/
  app/
    admin/
      layout.tsx                # Protected admin shell (sidebar + header)
      page.tsx                  # Admin dashboard
      exams/
        page.tsx                # Exam list with publish toggle + actions
        new/page.tsx            # Create exam
        [id]/
          edit/page.tsx         # Update exam metadata
          questions/page.tsx    # Manage questions for a single exam
    dashboard/
      layout.tsx                # Protected participant shell
      page.tsx                  # Participant dashboard with published exams
    login/page.tsx              # Supabase login portal
    page.tsx                    # Session-aware landing redirector
  components/
    layout/admin-shell.tsx      # Sidebar + header layout
    protected-route.tsx         # Client-only guard for /admin routes
    providers/                  # Supabase + QueryClient + auth bootstrap
  features/
    exams/                      # Exam domain (api, hooks, form component)
    questions/                  # Question domain (api, hooks, modal form)
  lib/
    supabase/                   # Typed Supabase client & Database types
  stores/
    auth-store.ts               # Zustand store handling session/profile
supabase/
  migrations/001_init_admin_schema.sql
```

## Database & Security

- `public.user_role` enum and `public.option_input` composite type
- Tables: `profiles`, `exams`, `questions`, `question_options`, `exam_sessions`, `exam_results`
- RLS policies enforce admin-only write access while preserving future student access patterns
- RPC functions:
  - `create_question_with_options`
  - `update_question_with_options`
  - `delete_question`
  - `get_my_role`
  - `finalize_exam_session`

## Development Workflow

- Authentication state initializes via `AuthInitializer`, calling Supabase `checkUser` on load.
- TanStack Query handles data fetching/mutation and automatically invalidates affected caches.
- Question authoring uses modal dialogs and server-side RPCs to keep options and questions in sync.
- ESLint (`npm run lint`) keeps the codebase aligned with Next.js standards.

## Next Steps

- Implement the timed exam-taking experience leveraging `exam_sessions` and `finalize_exam_session`.
- Build analytics dashboards on top of `exam_sessions` and `exam_results`.

---

Refer to `tech_doc.md` for the complete product specification driving this implementation.
