# Contributing to PahamPajak Tryout Admin

Thank you for your interest in improving the PahamPajak Tryout Admin project. This document outlines how to work on the codebase efficiently and safely.

## Getting Started

1. **Fork and clone**
   ```bash
   git clone <your-fork>
   cd tryout-ujian-online-codex
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in Supabase credentials
4. **Run Supabase migrations**
   ```bash
   supabase db reset
   ```
5. **Start the dev server**
   ```bash
   npm run dev
   ```

## Branch & Commit Workflow

```bash
git checkout -b feature/descriptive-name
# implement your change
npm run lint
git commit -m "feat: concise summary"
git push origin feature/descriptive-name
```

Keep commits focused and descriptive.

## Coding Standards

- **TypeScript**: strict mode, no `any`. Use types defined in `src/lib/supabase/types`.
- **React / Next.js**:
  - App Router conventions (`src/app`).
  - Client components only when required (`"use client"`).
  - Prefer composition and small components.
- **State & data**:
  - Auth state via `useAuthStore`.
  - Data fetching/mutations through hooks in `src/features/**/hooks.ts`.
  - Always invalidate relevant TanStack Query keys after mutations.
- **Styling**:
  - Tailwind utility classes.
  - Reuse shadcn/ui primitives from `src/components/ui`.
  - Keep layouts responsive and accessible.
- **Database**:
  - Add new SQL inside `supabase/migrations/`.
  - Maintain RLS using `public.get_my_role()` where appropriate.
  - Update `src/lib/supabase/types.ts` when schema changes.

## Testing & Validation

Before submitting a pull request:

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual QA of changed flows (create/edit/delete exams or questions as relevant)
- [ ] Update documentation (README, SUPABASE_SETUP.md, tech notes) if behaviour changes

## Pull Request Guidelines

Include in the PR description:

- Summary of the change
- Relevant screenshots (UI changes)
- Notes about migrations or manual steps
- Any known limitations or follow-up tasks

PRs require at least one review. Address all feedback before merging.

## Directory Overview

- `src/app` — Next.js routes (login, admin dashboard, exam/question flows)
- `src/components` — layout primitives, providers, protected route
- `src/features` — domain-specific logic (exams, questions)
- `src/stores` — Zustand stores
- `supabase/migrations` — SQL migrations, enums, functions, RLS

## Documentation

- Update `README.md` for high-level project changes.
- `SUPABASE_SETUP.md` documents database provisioning.
- Add inline comments only when necessary to explain non-obvious logic.

## Support

Questions? Open a GitHub issue or start a discussion in your fork. We appreciate clear bug reports and well-reasoned feature proposals.

Happy shipping! 🚀
