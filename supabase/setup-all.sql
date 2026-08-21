-- ============================================
-- 裝修幫手 - 只建缺的表 + 加缺的欄位
-- 不刪已有表，只補建 + 補欄位
-- ============================================

-- 1. 建缺的 4 張表
create table if not exists public.cases (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  style text,
  ping numeric,
  house_age text,
  area text,
  layout text,
  days integer,
  budget text,
  concept text,
  trades text[],
  designer text,
  main_image text,
  before_images text[],
  after_images text[],
  other_images text[],
  status text default 'draft',
  views integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.crew_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  name text not null,
  phone text not null,
  studio text,
  type text not null,
  case_desc text,
  budget text,
  timeline text,
  needs text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.coop_applications (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  studio text,
  type text,
  case_desc text,
  budget text,
  timeline text,
  needs text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.promo_codes (
  code text primary key,
  description text,
  discount text,
  valid_from date,
  valid_until date,
  max_uses integer,
  used_count integer default 0,
  active boolean default true
);

insert into public.promo_codes (code, description, discount, valid_from, valid_until, max_uses)
values ('GREEN2026', '設計費 9 折 + 空氣清淨檢測', 'design_10_off + air_test', '2026-01-01', '2026-12-31', 100)
on conflict (code) do nothing;

-- 2. 檢查並加缺的 user_id 欄位（如果表存在但缺欄位）
do $$
begin
  -- design_requests 加 user_id（如果缺）
  if not exists (select 1 from information_schema.columns where table_name = 'design_requests' and column_name = 'user_id' and table_schema = 'public') then
    alter table public.design_requests add column user_id uuid references auth.users on delete set null;
  end if;
  
  -- estimate_records 加 user_id（如果缺）
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_records' and column_name = 'user_id' and table_schema = 'public') then
    alter table public.estimate_records add column user_id uuid references auth.users on delete set null;
  end if;
  
  -- projects 加 user_id（如果缺）
  if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'user_id' and table_schema = 'public') then
    alter table public.projects add column user_id uuid references auth.users on delete set null;
  end if;
  
  -- design_requests 加其他缺的欄位
  if not exists (select 1 from information_schema.columns where table_name = 'design_requests' and column_name = 'rooms' and table_schema = 'public') then
    alter table public.design_requests add column rooms text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'design_requests' and column_name = 'promo_code' and table_schema = 'public') then
    alter table public.design_requests add column promo_code text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'design_requests' and column_name = 'promo_verified' and table_schema = 'public') then
    alter table public.design_requests add column promo_verified boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'design_requests' and column_name = 'status' and table_schema = 'public') then
    alter table public.design_requests add column status text default 'pending';
  end if;
  
  -- estimate_records 加其他缺的欄位
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_records' and column_name = 'extras' and table_schema = 'public') then
    alter table public.estimate_records add column extras text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_records' and column_name = 'total_min' and table_schema = 'public') then
    alter table public.estimate_records add column total_min numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_records' and column_name = 'total_max' and table_schema = 'public') then
    alter table public.estimate_records add column total_max numeric;
  end if;
end $$;

-- 3. 啟用 RLS（已啟用的不會報錯）
alter table public.profiles enable row level security;
alter table public.design_requests enable row level security;
alter table public.estimate_records enable row level security;
alter table public.projects enable row level security;
alter table public.project_stages enable row level security;
alter table public.cases enable row level security;
alter table public.crew_requests enable row level security;
alter table public.coop_applications enable row level security;
alter table public.promo_codes enable row level security;

-- 4. RLS Policy（全部先 drop 再 create）
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "profiles_read" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id);

drop policy if exists "design_select" on public.design_requests;
drop policy if exists "design_insert" on public.design_requests;
drop policy if exists "users read own requests" on public.design_requests;
drop policy if exists "anyone can submit request" on public.design_requests;
create policy "design_select" on public.design_requests for select to authenticated using (auth.uid() = user_id);
create policy "design_insert" on public.design_requests for insert to anon, authenticated with check (true);

drop policy if exists "estimate_select" on public.estimate_records;
drop policy if exists "estimate_insert" on public.estimate_records;
drop policy if exists "users read own estimates" on public.estimate_records;
drop policy if exists "anyone can save estimate" on public.estimate_records;
create policy "estimate_select" on public.estimate_records for select to authenticated using (auth.uid() = user_id);
create policy "estimate_insert" on public.estimate_records for insert to anon, authenticated with check (true);

drop policy if exists "projects_select" on public.projects;
drop policy if exists "users read own projects" on public.projects;
create policy "projects_select" on public.projects for select to authenticated using (auth.uid() = user_id);

drop policy if exists "stages_select" on public.project_stages;
drop policy if exists "users read stages of own projects" on public.project_stages;
create policy "stages_select" on public.project_stages for select to authenticated
  using (exists (select 1 from public.projects where id = project_id and user_id = auth.uid()));

drop policy if exists "cases_select" on public.cases;
drop policy if exists "cases_insert" on public.cases;
drop policy if exists "anyone can read published cases" on public.cases;
drop policy if exists "anyone can submit case" on public.cases;
create policy "cases_select" on public.cases for select to anon, authenticated using (status = 'published');
create policy "cases_insert" on public.cases for insert to anon, authenticated with check (true);

drop policy if exists "crew_select" on public.crew_requests;
drop policy if exists "crew_insert" on public.crew_requests;
drop policy if exists "users read own crew requests" on public.crew_requests;
drop policy if exists "anyone can submit crew request" on public.crew_requests;
create policy "crew_select" on public.crew_requests for select to authenticated using (auth.uid() = user_id);
create policy "crew_insert" on public.crew_requests for insert to anon, authenticated with check (true);

drop policy if exists "coop_select" on public.coop_applications;
drop policy if exists "coop_insert" on public.coop_applications;
drop policy if exists "users read own coops" on public.coop_applications;
drop policy if exists "anyone can apply coop" on public.coop_applications;
create policy "coop_select" on public.coop_applications for select to authenticated using (auth.uid() = user_id);
create policy "coop_insert" on public.coop_applications for insert to anon, authenticated with check (true);

drop policy if exists "promo_select" on public.promo_codes;
drop policy if exists "anyone can read active promos" on public.promo_codes;
create policy "promo_select" on public.promo_codes for select to anon, authenticated using (active = true);

-- 5. Storage
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;

drop policy if exists "img_upload" on storage.objects;
drop policy if exists "img_read" on storage.objects;
drop policy if exists "anyone can upload case images" on storage.objects;
drop policy if exists "anyone can read case images" on storage.objects;
create policy "img_upload" on storage.objects for insert
  to anon, authenticated with check (bucket_id = 'case-images');
create policy "img_read" on storage.objects for select
  to anon, authenticated using (bucket_id = 'case-images');

-- 6. 補建 admin profile
insert into public.profiles (id, name, role)
select id, 'Admin', 'admin' from auth.users
where email in ('admin2@renovation-helper.com', 'spaceuphelper@gmail.com')
on conflict (id) do update set role = 'admin', name = 'Admin';

-- 7. 確認
select tablename as tbl, policyname as policy from pg_policies where schemaname = 'public' order by tablename;
