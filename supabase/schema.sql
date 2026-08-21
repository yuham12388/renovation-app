-- ============================================
-- 裝修幫手 Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 貼上執行
-- ============================================

-- 1. profiles 表（延伸 auth.users）
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  role text check (role in ('owner', 'designer', 'admin')) default 'owner',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 自動建立 profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'owner'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. design_requests 表（設計我家需求單）
create table if not exists public.design_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  name text not null,
  phone text not null,
  area text,
  ping numeric,
  style text,
  budget text,
  timeline text,
  rooms text[],
  needs text,
  promo_code text,
  promo_verified boolean default false,
  status text default 'pending' check (status in ('pending', 'contacted', 'surveying', 'designing', 'contracted', 'closed')),
  created_at timestamptz default now()
);

-- 3. estimate_records 表（估價記錄）
create table if not exists public.estimate_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  ping numeric not null,
  house_age text,
  level text check (level in ('basic', 'standard', 'premium')),
  extras text[],
  total_min numeric,
  total_max numeric,
  days_min integer,
  days_max integer,
  created_at timestamptz default now()
);

-- 4. projects 表（施工案件）
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  title text not null,
  address text,
  ping numeric,
  status text default 'planning' check (status in ('planning', '施工中', '驗收中', '完工', '保固中')),
  progress integer default 0,
  budget text,
  designer text,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- 5. project_stages 表（施工階段時間線）
create table if not exists public.project_stages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade,
  name text not null,
  status text default 'pending' check (status in ('pending', 'active', 'done')),
  sort_order integer default 0,
  start_date text,
  end_date text,
  detail text
);

-- 6. cases 表（裝修案例）
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
  status text default 'published' check (status in ('draft', 'published', 'archived')),
  views integer default 0,
  created_at timestamptz default now()
);

-- 7. crew_requests 表（設計師工班需求單）
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
  status text default 'pending' check (status in ('pending', 'matched', 'confirmed', 'closed')),
  created_at timestamptz default now()
);

-- 8. coop_applications 表（商務合作申請）
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
  status text default 'pending' check (status in ('pending', 'contacted', 'signed', 'closed')),
  created_at timestamptz default now()
);

-- 9. promo_codes 表（優惠代碼）
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

-- 預設優惠代碼
insert into public.promo_codes (code, description, discount, valid_from, valid_until, max_uses)
values ('GREEN2026', '設計費 9 折 + 空氣清淨檢測', 'design_10_off + air_test', '2026-01-01', '2026-12-31', 100)
on conflict (code) do nothing;

-- ============================================
-- RLS (Row Level Security) 政策
-- ============================================

-- profiles：用戶只能讀寫自己的，登入時可自動建 profile
alter table public.profiles enable row level security;
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- design_requests：用戶只能看自己的，任何人可新增
alter table public.design_requests enable row level security;
create policy "users read own requests" on public.design_requests for select using (auth.uid() = user_id);
create policy "anyone can submit request" on public.design_requests for insert with check (true);

-- estimate_records：用戶只能看自己的
alter table public.estimate_records enable row level security;
create policy "users read own estimates" on public.estimate_records for select using (auth.uid() = user_id);
create policy "anyone can save estimate" on public.estimate_records for insert with check (true);

-- projects：用戶只能看自己的
alter table public.projects enable row level security;
create policy "users read own projects" on public.projects for select using (auth.uid() = user_id);

-- project_stages：透過 project ownership 間接控制
alter table public.project_stages enable row level security;
create policy "users read stages of own projects" on public.project_stages for select
  using (exists (select 1 from public.projects where id = project_id and user_id = auth.uid()));

-- cases：所有人可讀 published，只有 admin 可寫
alter table public.cases enable row level security;
create policy "anyone can read published cases" on public.cases for select using (status = 'published');

-- crew_requests：用戶只能看自己的，任何人可新增
alter table public.crew_requests enable row level security;
create policy "users read own crew requests" on public.crew_requests for select using (auth.uid() = user_id);
create policy "anyone can submit crew request" on public.crew_requests for insert with check (true);

-- coop_applications：用戶只能看自己的，任何人可新增
alter table public.coop_applications enable row level security;
create policy "users read own coops" on public.coop_applications for select using (auth.uid() = user_id);
create policy "anyone can apply coop" on public.coop_applications for insert with check (true);

-- promo_codes：所有人可讀 active 的（用於驗證）
alter table public.promo_codes enable row level security;
create policy "anyone can read active promos" on public.promo_codes for select using (active = true);

-- ============================================
-- Storage bucket（案例圖片用）
-- ============================================
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;

-- Storage policy：任何人可上傳到 case-images
create policy "anyone can upload case images" on storage.objects for insert
  with check (bucket_id = 'case-images');
create policy "anyone can read case images" on storage.objects for select
  using (bucket_id = 'case-images');
