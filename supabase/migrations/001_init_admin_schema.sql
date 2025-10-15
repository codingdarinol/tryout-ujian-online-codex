-- PahamPajak Tryout Admin Schema
-- Generated according to tech_doc.md

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'user');

create type public.option_input as (
  option_text text,
  is_correct boolean
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  role public.user_role not null default 'user',
  purchased_packages text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_in_minutes integer not null,
  is_published boolean not null default false,
  passing_score integer not null default 70,
  max_attempts integer default 1,
  package_id text,
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_text text not null,
  explanation text,
  "order" integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed','expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  user_answers jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  detailed_breakdown jsonb,
  unique(session_id)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_exams_updated_at
  before update on public.exams
  for each row execute function public.set_updated_at();

create trigger set_questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

create trigger set_question_options_updated_at
  before update on public.question_options
  for each row execute function public.set_updated_at();

create trigger set_exam_sessions_updated_at
  before update on public.exam_sessions
  for each row execute function public.set_updated_at();

create trigger set_exam_results_updated_at
  before update on public.exam_results
  for each row execute function public.set_updated_at();

create or replace function public.get_my_role()
returns public.user_role
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  result public.user_role;
begin
  select role into result
  from public.profiles
  where id = auth.uid();

  return coalesce(result, 'user');
end;
$$;

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_results enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users manage own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "Admins manage profiles" on public.profiles
  for all using (public.get_my_role() = 'admin') with check (true);

create policy "Admins full access to exams" on public.exams
  for all using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "Published exams readable" on public.exams
  for select using (is_published = true);

create policy "Admins full access to questions" on public.questions
  for all using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "Admins full access to question options" on public.question_options
  for all using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "Users manage own sessions" on public.exam_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users read own results" on public.exam_results
  for select using (user_id = auth.uid());

create policy "Admins manage results" on public.exam_results
  for all using (public.get_my_role() = 'admin');

create or replace function public.create_question_with_options(
  exam_id_in uuid,
  question_text_in text,
  explanation_in text,
  options_in public.option_input[]
) returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_question_id uuid;
  option_rec public.option_input;
begin
  insert into public.questions (exam_id, question_text, explanation)
  values (exam_id_in, question_text_in, explanation_in)
  returning id into new_question_id;

  foreach option_rec in array options_in loop
    insert into public.question_options (question_id, option_text, is_correct)
    values (new_question_id, option_rec.option_text, option_rec.is_correct);
  end loop;

  return new_question_id;
end;
$$;

create or replace function public.update_question_with_options(
  question_id_in uuid,
  question_text_in text,
  explanation_in text,
  options_in public.option_input[]
) returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  option_rec public.option_input;
begin
  update public.questions
  set question_text = question_text_in,
      explanation = explanation_in,
      updated_at = now()
  where id = question_id_in;

  delete from public.question_options where question_id = question_id_in;

  foreach option_rec in array options_in loop
    insert into public.question_options (question_id, option_text, is_correct)
    values (question_id_in, option_rec.option_text, option_rec.is_correct);
  end loop;
end;
$$;

create or replace function public.delete_question(question_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from public.questions where id = question_id_in;
end;
$$;

create or replace function public.finalize_exam_session(session_id_in uuid)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  session_row public.exam_sessions%rowtype;
  total_questions integer;
  correct_answers integer := 0;
  answer_record record;
  calculated_score integer := 0;
  question_uuid uuid;
  option_uuid uuid;
begin
  select * into session_row
  from public.exam_sessions
  where id = session_id_in
  for update;

  if not found then
    raise exception 'Exam session % tidak ditemukan', session_id_in;
  end if;

  select count(*) into total_questions
  from public.questions
  where exam_id = session_row.exam_id;

  if total_questions = 0 then
    calculated_score := 0;
  else
    for answer_record in
      select key, value
      from jsonb_each_text(coalesce(session_row.user_answers, '{}'::jsonb))
    loop
      question_uuid := answer_record.key::uuid;
      option_uuid := answer_record.value::uuid;

      if exists (
        select 1 from public.question_options
        where question_id = question_uuid
          and id = option_uuid
          and is_correct = true
      ) then
        correct_answers := correct_answers + 1;
      end if;
    end loop;

    calculated_score := (correct_answers * 100) / total_questions;
  end if;

  insert into public.exam_results (
    session_id,
    exam_id,
    user_id,
    score,
    total_questions,
    correct_count,
    incorrect_count,
    detailed_breakdown
  ) values (
    session_row.id,
    session_row.exam_id,
    session_row.user_id,
    calculated_score,
    total_questions,
    correct_answers,
    greatest(total_questions - correct_answers, 0),
    session_row.user_answers
  )
  on conflict (session_id) do update
  set score = excluded.score,
      total_questions = excluded.total_questions,
      correct_count = excluded.correct_count,
      incorrect_count = excluded.incorrect_count,
      detailed_breakdown = excluded.detailed_breakdown,
      updated_at = now();

  update public.exam_sessions
  set status = 'completed',
      completed_at = now(),
      updated_at = now()
  where id = session_row.id;

  return calculated_score;
end;
$$;

create index if not exists idx_exams_is_published on public.exams(is_published);
create index if not exists idx_questions_exam_id on public.questions(exam_id);
create index if not exists idx_question_options_question_id on public.question_options(question_id);
create index if not exists idx_exam_sessions_user_id on public.exam_sessions(user_id);
create index if not exists idx_exam_results_user_id on public.exam_results(user_id);
