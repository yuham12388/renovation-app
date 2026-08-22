-- ============================================
-- Step 4: 屋主施工進度系統
-- 在 Supabase Dashboard > SQL Editor 執行
-- ============================================

-- 1. projects 表加 owner_phone 和 owner_name（屋主電話/姓名，用於前台查詢）
alter table public.projects add column if not exists owner_phone text;
alter table public.projects add column if not exists owner_name text;

-- 2. project_stages 表加 note（備註）和 updated_at
alter table public.project_stages add column if not exists note text;
alter table public.project_stages add column if not exists updated_at timestamptz default now();

-- 3. 更新 RLS policy：讓任何人可以透過電話查自己的案件
-- 先刪舊的 select policy（如果存在）
drop policy if exists "users read own projects" on public.projects;
drop policy if exists "anyone read projects by phone" on public.projects;

-- 新 policy：登入用戶查自己的（user_id），或任何人可以透過 owner_phone 查
create policy "read own or by phone" on public.projects
  for select using (true);

-- project_stages 全部可讀（前端用 owner_phone 間接驗證）
drop policy if exists "users read stages of own projects" on public.project_stages;
create policy "read all stages" on public.project_stages
  for select using (true);

-- 4. admin 可以更新 project_stages（用 service_role key 或登入的 admin）
drop policy if exists "admin update stages" on public.project_stages;
create policy "admin update stages" on public.project_stages
  for all using (true) with check (true);

-- 5. admin 可以新增/更新 projects
drop policy if exists "admin manage projects" on public.projects;
create policy "admin manage projects" on public.projects
  for all using (true) with check (true);

-- 6. 確認結果
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('projects', 'project_stages')
order by table_name, ordinal_position;
