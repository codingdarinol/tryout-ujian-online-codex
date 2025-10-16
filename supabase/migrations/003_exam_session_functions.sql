-- Helper functions to manage participant exam sessions.

create or replace function public.start_exam_session(exam_id_in uuid)
returns public.exam_sessions
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_row public.profiles%rowtype;
  exam_row public.exams%rowtype;
  reusable_session public.exam_sessions%rowtype;
  attempt_count integer;
  duration_minutes integer;
  expires_at_ts timestamptz;
begin
  select *
  into profile_row
  from public.profiles
  where id = auth.uid();

  if not found then
    raise exception 'Profil peserta tidak ditemukan.';
  end if;

  select *
  into exam_row
  from public.exams
  where id = exam_id_in;

  if not found then
    raise exception 'Tryout tidak ditemukan.';
  end if;

  if not exam_row.is_published then
    raise exception 'Tryout belum dipublikasikan.';
  end if;

  if exam_row.package_id is not null
     and (profile_row.purchased_packages is null
          or not profile_row.purchased_packages @> array[exam_row.package_id]) then
    raise exception 'Tryout ini tidak termasuk paket aktif Anda.';
  end if;

  update public.exam_sessions
  set status = 'expired',
      updated_at = now()
  where exam_id = exam_id_in
    and user_id = profile_row.id
    and status = 'in_progress'
    and expires_at <= now();

  select *
  into reusable_session
  from public.exam_sessions
  where exam_id = exam_id_in
    and user_id = profile_row.id
    and status = 'in_progress'
  order by created_at desc
  limit 1;

  if found then
    return reusable_session;
  end if;

  if coalesce(exam_row.max_attempts, 0) > 0 then
    select count(*)
    into attempt_count
    from public.exam_sessions
    where exam_id = exam_id_in
      and user_id = profile_row.id
      and status in ('completed', 'expired');

    if attempt_count >= coalesce(exam_row.max_attempts, 0) then
      raise exception 'Kesempatan tryout sudah habis.';
    end if;
  end if;

  duration_minutes := greatest(exam_row.duration_in_minutes, 1);
  expires_at_ts := now() + make_interval(mins => duration_minutes);

  insert into public.exam_sessions (exam_id, user_id, status, started_at, expires_at)
  values (exam_row.id, profile_row.id, 'in_progress', now(), expires_at_ts)
  returning * into reusable_session;

  return reusable_session;
end;
$$;

create or replace function public.record_exam_answer(
  session_id_in uuid,
  question_id_in uuid,
  option_id_in uuid
)
returns public.exam_sessions
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  session_row public.exam_sessions%rowtype;
  answer_key text := question_id_in::text;
  updated_answers jsonb;
  valid_question boolean;
  valid_option boolean;
begin
  select *
  into session_row
  from public.exam_sessions
  where id = session_id_in
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Sesi ujian tidak ditemukan.';
  end if;

  if session_row.status <> 'in_progress' then
    raise exception 'Sesi ujian sudah tidak aktif.';
  end if;

  if session_row.expires_at <= now() then
    update public.exam_sessions
    set status = 'expired',
        updated_at = now()
    where id = session_row.id;
    raise exception 'Waktu ujian telah habis.';
  end if;

  select exists (
    select 1
    from public.questions
    where id = question_id_in
      and exam_id = session_row.exam_id
  )
  into valid_question;

  if not valid_question then
    raise exception 'Soal tidak valid untuk sesi ini.';
  end if;

  if option_id_in is not null then
    select exists (
      select 1
      from public.question_options
      where id = option_id_in
        and question_id = question_id_in
    )
    into valid_option;

    if not valid_option then
      raise exception 'Pilihan jawaban tidak valid.';
    end if;

    updated_answers := jsonb_set(
      coalesce(session_row.user_answers, '{}'::jsonb),
      array[answer_key],
      to_jsonb(option_id_in::text),
      true
    );
  else
    updated_answers := coalesce(session_row.user_answers, '{}'::jsonb) - answer_key;
  end if;

  update public.exam_sessions
  set user_answers = updated_answers,
      updated_at = now()
  where id = session_row.id
  returning * into session_row;

  return session_row;
end;
$$;

create or replace function public.complete_exam_session(session_id_in uuid)
returns public.exam_results
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  session_row public.exam_sessions%rowtype;
  result_row public.exam_results%rowtype;
begin
  select *
  into session_row
  from public.exam_sessions
  where id = session_id_in
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Sesi ujian tidak ditemukan.';
  end if;

  if session_row.status = 'expired' then
    -- Ensure final scoring reflects the answers before expiry.
    perform public.finalize_exam_session(session_row.id);
  elsif session_row.status = 'completed' then
    null;
  else
    if session_row.expires_at <= now() then
      perform public.finalize_exam_session(session_row.id);
    else
      perform public.finalize_exam_session(session_row.id);
    end if;
  end if;

  select *
  into result_row
  from public.exam_results
  where session_id = session_row.id;

  if not found then
    raise exception 'Hasil ujian belum tersedia.';
  end if;

  return result_row;
end;
$$;
