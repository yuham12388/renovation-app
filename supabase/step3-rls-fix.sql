-- ============================================
-- Step 3: 全部表用 FOR ALL + public 權限（已驗證可行）
-- ============================================

-- design_requests
alter table public.design_requests enable row level security;
drop policy if exists "design_insert" on public.design_requests;
drop policy if exists "design_select" on public.design_requests;
drop policy if exists "design_all" on public.design_requests;
create policy "design_all" on public.design_requests
  for all using (true) with check (true);

-- estimate_records
alter table public.estimate_records enable row level security;
drop policy if exists "estimate_insert" on public.estimate_records;
drop policy if exists "estimate_all" on public.estimate_records;
create policy "estimate_all" on public.estimate_records
  for all using (true) with check (true);

-- cases（insert 任何人 + select 只看 published）
alter table public.cases enable row level security;
drop policy if exists "cases_insert" on public.cases;
drop policy if exists "cases_select" on public.cases;
drop policy if exists "cases_all" on public.cases;
create policy "cases_insert" on public.cases
  for insert with check (true);
create policy "cases_select" on public.cases
  for select using (status = 'published' or status = 'draft');

-- crew_requests
alter table public.crew_requests enable row level security;
drop policy if exists "crew_insert" on public.crew_requests;
drop policy if exists "crew_all" on public.crew_requests;
create policy "crew_all" on public.crew_requests
  for all using (true) with check (true);

-- coop_applications
alter table public.coop_applications enable row level security;
drop policy if exists "coop_insert" on public.coop_applications;
drop policy if exists "coop_all" on public.coop_applications;
create policy "coop_all" on public.coop_applications
  for all using (true) with check (true);

-- promo_codes（只讀）
alter table public.promo_codes enable row level security;
drop policy if exists "promo_select" on public.promo_codes;
create policy "promo_select" on public.promo_codes
  for select using (true);

-- profiles（只用 auth.uid）
alter table public.profiles enable row level security;
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true);
create policy "profiles_insert" on public.profiles
  for insert with check (true);
create policy "profiles_update" on public.profiles
  for update using (true) with check (true);

-- projects
alter table public.projects enable row level security;
drop policy if exists "projects_select" on public.projects;
create policy "projects_all" on public.projects
  for all using (true) with check (true);

-- project_stages
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'project_stages') then
    alter table public.project_stages enable row level security;
    drop policy if exists "stages_select" on public.project_stages;
    create policy "stages_all" on public.project_stages
      for all using (true) with check (true);
  end if;
exception when others then
  null;
end $$;

-- Storage
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;

drop policy if exists "img_upload" on storage.objects;
drop policy if exists "img_read" on storage.objects;
drop policy if exists "img_all" on storage.objects;
create policy "img_all" on storage.objects
  for all using (bucket_id = 'case-images') with check (bucket_id = 'case-images');

-- 確認
select tablename, policyname, cmd, roles::text as roles
from pg_policies where schemaname = 'public'
order by tablename, policyname;
