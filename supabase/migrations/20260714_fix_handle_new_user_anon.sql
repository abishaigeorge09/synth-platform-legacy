-- Fix: anonymous sign-in was failing with "Database error saving new user".
--
-- handle_new_user() (the AFTER INSERT trigger on auth.users) unconditionally
-- inserted into public.users(id, email). Anonymous sign-ins have email = NULL,
-- which violates public.users.email's NOT NULL constraint and aborts the
-- entire auth.users insert transaction inside GoTrue.
--
-- Fix: skip the public.users provisioning row for anonymous users. They get
-- a real profile row once they convert (sign up with real credentials), same
-- as any other identity-linking flow. Keeps email NOT NULL meaningful for
-- actual accounts instead of loosening it project-wide.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.users (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
  return new;
end;
$function$;
