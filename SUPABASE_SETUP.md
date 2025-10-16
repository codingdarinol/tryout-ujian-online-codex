# Supabase Setup Guide

This document describes how to provision and manage the Supabase environment for the PahamPajak Tryout Admin project.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`npm install -g supabase`)
- Docker (for local development) or a hosted Supabase project
- Access to the Supabase SQL editor or `psql` for running ad-hoc statements

## 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and populate the Supabase credentials:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional: used only for local migrations/seeding
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 2. Apply Database Schema

The full schema (tables, enums, RLS, and RPC functions) lives in `supabase/migrations/001_init_admin_schema.sql`.

### Local development

```bash
supabase start            # boot Supabase locally (first run only)
supabase db reset         # apply migrations from the repo
```

> ℹ️ **Windows port note**  
> The Supabase services run on custom ports defined in `supabase/config.toml` to avoid the OS-reserved `5432x` range.  
> - API/REST/GraphQL: http://127.0.0.1:55431  
> - Postgres: `postgresql://postgres:postgres@127.0.0.1:55432/postgres`  
> - Supabase Studio: http://127.0.0.1:55433  
> - Mail viewer (Mailpit): http://127.0.0.1:55434  
> - Analytics is disabled locally (`[analytics] enabled = false`) to skip the Docker-on-TCP requirement on Windows.  
> Update any local tooling or environment variables to use these port values.

### Remote project

```bash
supabase link --project-ref your-project-ref
supabase db push
```

After the migration runs you should see the following resources:

- Tables: `profiles`, `exams`, `questions`, `question_options`, `exam_sessions`, `exam_results`
- Types: `user_role`, `option_input`
- Functions: `get_my_role`, `create_question_with_options`, `update_question_with_options`, `delete_question`, `finalize_exam_session`
- Trigger: `on_auth_user_created` keeps new `auth.users` rows in sync with `public.profiles`
- RLS policies restricting write access to admins

## 3. Create an Admin User

1. In Supabase Dashboard open **Authentication → Users**.
2. Create a new user with email/password (or invite yourself).
3. Insert a matching row inside `public.profiles` and set `role = 'admin'`:

```sql
insert into public.profiles (id, full_name, role)
values ('<auth_user_uuid>', 'Super Admin', 'admin')
on conflict (id) do update set role = 'admin';
```

Now you can sign into `/login` with those credentials.

## 4. Testing RPC Functions

### Create question with options

```sql
select public.create_question_with_options(
  '<exam_uuid>',
  'Apa dasar hukum PPh Badan?',
  'Dasar hukum utama adalah UU PPh No. 7/1983 beserta perubahannya.',
  array[
    ('UU PPh No. 7/1983', true),
    ('UU PPN No. 8/1983', false),
    ('UU Kepabeanan', false),
    ('UU KUP', false)
  ]::public.option_input[]
);
```

### Finalise a session

```sql
select public.finalize_exam_session('<session_uuid>');
```

The function calculates the score, writes to `exam_results`, and marks the session as `completed`.

## 5. RLS Overview

- **Admin access**: validated through `public.get_my_role()`. Admins can fully manage `exams`, `questions`, `question_options`, and inspect `exam_results`.
- **Regular users**: can only manage their profiles and read their own `exam_sessions`/`exam_results`.
- **Future student flows**: the policies allow published exams to be visible (`published exams readable`). Additional policies or RPC functions can be added when the frontend exam experience is implemented.

## 6. Resetting State

To reset the local database:

```bash
supabase db reset
```

To truncate exam content while keeping admin profiles:

```sql
truncate table public.questions cascade;
truncate table public.exams cascade;
truncate table public.exam_sessions cascade;
truncate table public.exam_results cascade;
```

---

With Supabase configured, you can log into the admin panel, create exams, author questions, and manage publication status in real time.
