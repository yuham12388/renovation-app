-- ============================================
-- Step 5: 施工節點照片/影片
-- 在 Supabase Dashboard > SQL Editor 執行
-- ============================================

-- 1. 建立 stage_media 表（存每個節點的照片/影片）
create table if not exists public.stage_media (
  id uuid default gen_random_uuid() primary key,
  stage_id uuid references public.project_stages on delete cascade,
  project_id uuid references public.projects on delete cascade,
  url text not null,
  type text default 'photo' check (type in ('photo', 'video')),
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- RLS：所有人可讀，所有人可寫
alter table public.stage_media enable row level security;
drop policy if exists "read all stage media" on public.stage_media;
create policy "read all stage media" on public.stage_media
  for select using (true);
drop policy if exists "write stage media" on public.stage_media;
create policy "write stage media" on public.stage_media
  for all using (true) with check (true);

-- 2. 建立 progress-media Storage bucket
insert into storage.buckets (id, name, public)
values ('progress-media', 'progress-media', true)
on conflict (id) do nothing;

-- Storage policy：任何人可上傳/讀取 progress-media
drop policy if exists "upload progress media" on storage.objects;
create policy "upload progress media" on storage.objects for insert
  with check (bucket_id = 'progress-media');
drop policy if exists "read progress media" on storage.objects;
create policy "read progress media" on storage.objects for select
  using (bucket_id = 'progress-media');

-- 確認
select table_name from information_schema.tables
where table_schema = 'public' and table_name = 'stage_media';
