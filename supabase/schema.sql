-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  role text not null default 'pending' check (role in ('pending', 'viewer', 'contributor', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seasons
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null check (brand in ('dior_homme', 'saint_laurent')),
  year int not null,
  period text not null check (period in ('SS', 'AW')),
  description text,
  cover_image_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Celebrities
create table public.celebrities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  cover_image_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Media
create table public.media (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  type text not null check (type in ('image', 'video', 'interview', 'scan')),
  file_url text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  width int,
  height int,
  season_id uuid references public.seasons(id) on delete set null,
  celebrity_id uuid references public.celebrities(id) on delete set null,
  brand text check (brand in ('dior_homme', 'saint_laurent')),
  tags text[],
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.celebrities enable row level security;
alter table public.media enable row level security;

-- Profiles: users can read approved profiles, update own
create policy "Approved users can read profiles"
  on public.profiles for select
  using (
    auth.uid() is not null and (
      (select role from public.profiles where id = auth.uid()) in ('viewer', 'contributor', 'admin')
    )
  );

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Seasons: approved users read, contributors/admins write
create policy "Approved users can read seasons"
  on public.seasons for select
  using ((select role from public.profiles where id = auth.uid()) in ('viewer', 'contributor', 'admin'));

create policy "Contributors and admins can insert seasons"
  on public.seasons for insert
  with check ((select role from public.profiles where id = auth.uid()) in ('contributor', 'admin'));

create policy "Contributors and admins can update seasons"
  on public.seasons for update
  using ((select role from public.profiles where id = auth.uid()) in ('contributor', 'admin'));

create policy "Admins can delete seasons"
  on public.seasons for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Celebrities: same rules
create policy "Approved users can read celebrities"
  on public.celebrities for select
  using ((select role from public.profiles where id = auth.uid()) in ('viewer', 'contributor', 'admin'));

create policy "Contributors and admins can insert celebrities"
  on public.celebrities for insert
  with check ((select role from public.profiles where id = auth.uid()) in ('contributor', 'admin'));

create policy "Contributors and admins can update celebrities"
  on public.celebrities for update
  using ((select role from public.profiles where id = auth.uid()) in ('contributor', 'admin'));

create policy "Admins can delete celebrities"
  on public.celebrities for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Media: approved users read, contributors/admins write
create policy "Approved users can read media"
  on public.media for select
  using ((select role from public.profiles where id = auth.uid()) in ('viewer', 'contributor', 'admin'));

create policy "Contributors and admins can insert media"
  on public.media for insert
  with check ((select role from public.profiles where id = auth.uid()) in ('contributor', 'admin'));

create policy "Contributors and admins can update media"
  on public.media for update
  using ((select role from public.profiles where id = auth.uid()) in ('contributor', 'admin'));

create policy "Admins can delete media"
  on public.media for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Storage buckets (run after creating buckets in dashboard)
-- Bucket: media (private, authenticated access only)
-- Bucket: avatars (private, authenticated access only)

-- Auto-update updated_at on profiles
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- Seed admin account (replace with your user ID after first sign up)
-- update public.profiles set role = 'admin' where username = 'your_username';
