-- Public browsing: anyone (signed in or not) can READ the archive.
-- Writing still requires an account with the contributor or admin role.
--
-- Run this once in the Supabase dashboard → SQL Editor.
-- Safe to re-run: every policy is dropped before being recreated.
--
-- NOTE: images are served via storage public URLs, so the "media" and
-- "avatars" storage buckets must also be set to Public in
-- Supabase → Storage → <bucket> → Settings, or thumbnails will 400.

-- Profiles: usernames and avatars are shown next to folders and uploads.
drop policy if exists "Approved users can read profiles" on public.profiles;
drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
  on public.profiles for select
  using (true);

-- Seasons
drop policy if exists "Approved users can read seasons" on public.seasons;
drop policy if exists "Public can read seasons" on public.seasons;
create policy "Public can read seasons"
  on public.seasons for select
  using (true);

-- Celebrities
drop policy if exists "Approved users can read celebrities" on public.celebrities;
drop policy if exists "Public can read celebrities" on public.celebrities;
create policy "Public can read celebrities"
  on public.celebrities for select
  using (true);

-- Media
drop policy if exists "Approved users can read media" on public.media;
drop policy if exists "Public can read media" on public.media;
create policy "Public can read media"
  on public.media for select
  using (true);

-- Folders and their contents (added after the original schema.sql).
drop policy if exists "Approved users can read folders" on public.folders;
drop policy if exists "Public can read folders" on public.folders;
create policy "Public can read folders"
  on public.folders for select
  using (true);

drop policy if exists "Approved users can read folder_media" on public.folder_media;
drop policy if exists "Public can read folder_media" on public.folder_media;
create policy "Public can read folder_media"
  on public.folder_media for select
  using (true);

-- Infopoint bulletin board notes.
drop policy if exists "Approved users can read infopoint_notes" on public.infopoint_notes;
drop policy if exists "Public can read infopoint_notes" on public.infopoint_notes;
create policy "Public can read infopoint_notes"
  on public.infopoint_notes for select
  using (true);
