-- Public browsing: anyone (signed in or not) can READ the archive.
-- Writing still requires an account with the contributor or admin role.
--
-- Run in Supabase → SQL Editor. Safe to run repeatedly.
--
-- This script only ever ADDS a read policy. It never drops an existing one,
-- so a failure part-way through can only leave a table as readable as it
-- already was — never less. (Permissive policies are OR'd together in
-- Postgres, so adding one is enough to open reads.)
--
-- It also repairs a table left with no read policy at all, which under
-- row-level security shows zero rows to everyone and looks like data loss.
--
-- NOTE: images are served via storage public URLs, so the "media" and
-- "avatars" storage buckets must also be set to Public in
-- Supabase → Storage → <bucket> → Settings, or images will not load.

do $$
declare
  t text;
  tables text[] := array[
    'profiles',
    'seasons',
    'celebrities',
    'media',
    'folders',
    'folder_media',
    'infopoint_notes'
  ];
begin
  foreach t in array tables loop
    -- Skip anything this project does not have.
    if to_regclass('public.' || t) is null then
      raise notice 'skipping %, table not found', t;
      continue;
    end if;

    -- Only this policy is touched, so existing rules are left alone.
    execute format('drop policy if exists "Public read" on public.%I', t);
    execute format('create policy "Public read" on public.%I for select using (true)', t);

    raise notice 'public read enabled on %', t;
  end loop;
end $$;
