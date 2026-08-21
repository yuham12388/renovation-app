-- ============================================
-- Step 1: 只建缺的表 + 補缺的欄位（不碰 RLS）
-- ============================================

-- 建缺的 4 張表
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

-- 補 design_requests 缺的欄位
alter table public.design_requests add column if not exists user_id uuid references auth.users on delete set null;
alter table public.design_requests add column if not exists rooms text[];
alter table public.design_requests add column if not exists promo_code text;
alter table public.design_requests add column if not exists promo_verified boolean default false;
alter table public.design_requests add column if not exists status text default 'pending';

-- 補 estimate_records 缺的欄位
alter table public.estimate_records add column if not exists user_id uuid references auth.users on delete set null;
alter table public.estimate_records add column if not exists extras text[];
alter table public.estimate_records add column if not exists total_min numeric;
alter table public.estimate_records add column if not exists total_max numeric;

-- 補 projects 缺的欄位
alter table public.projects add column if not exists user_id uuid references auth.users on delete set null;

-- 確認
select table_name, column_name, data_type 
from information_schema.columns 
where table_schema = 'public' 
  and table_name in ('design_requests', 'estimate_records', 'cases', 'crew_requests', 'coop_applications', 'promo_codes', 'projects', 'profiles')
order by table_name, ordinal_position;
