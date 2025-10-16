-- Automatically keep public.profiles in sync with new auth users.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  meta_username text := nullif(trim(meta->>'username'), '');
  meta_full_name text := nullif(trim(meta->>'full_name'), '');
  initial_role public.user_role :=
    case meta->>'role'
      when 'admin' then 'admin'
      when 'user' then 'user'
      else 'user'
    end;
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    meta_username,
    coalesce(meta_full_name, new.email),
    coalesce(initial_role, 'user')
  )
  on conflict (id) do update
    set username = coalesce(excluded.username, public.profiles.username),
        full_name = excluded.full_name,
        role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, username, full_name, role, created_at, updated_at)
select
  u.id,
  nullif(trim(u.raw_user_meta_data->>'username'), ''),
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), u.email),
  case u.raw_user_meta_data->>'role'
    when 'admin' then 'admin'::public.user_role
    when 'user' then 'user'::public.user_role
    else 'user'::public.user_role
  end,
  coalesce(u.created_at, now()),
  coalesce(u.updated_at, now())
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
