-- ============================================
-- Step 2: RLS Policy（簡化版，逐表建）
-- 只建 insert policy（讓前台表單能存資料）
-- ============================================

-- design_requests：任何人可 insert
drop policy if exists "design_insert" on public.design_requests;
drop policy if exists "anyone can submit request" on public.design_requests;
create policy "design_insert" on public.design_requests
  for insert to anon, authenticated with check (true);

-- estimate_records：任何人可 insert
drop policy if exists "estimate_insert" on public.estimate_records;
drop policy if exists "anyone can save estimate" on public.estimate_records;
create policy "estimate_insert" on public.estimate_records
  for insert to anon, authenticated with check (true);

-- cases：任何人可 insert
drop policy if exists "cases_insert" on public.cases;
drop policy if exists "anyone can submit case" on public.cases;
create policy "cases_insert" on public.cases
  for insert to anon, authenticated with check (true);

-- cases：任何人可 select published
drop policy if exists "cases_select" on public.cases;
drop policy if exists "anyone can read published cases" on public.cases;
create policy "cases_select" on public.cases
  for select to anon, authenticated using (status = 'published');

-- crew_requests：任何人可 insert
drop policy if exists "crew_insert" on public.crew_requests;
drop policy if exists "anyone can submit crew request" on public.crew_requests;
create policy "crew_insert" on public.crew_requests
  for insert to anon, authenticated with check (true);

-- coop_applications：任何人可 insert
drop policy if exists "coop_insert" on public.coop_applications;
drop policy if exists "anyone can apply coop" on public.coop_applications;
create policy "coop_insert" on public.coop_applications
  for insert to anon, authenticated with check (true);

-- promo_codes：任何人可 select active
drop policy if exists "promo_select" on public.promo_codes;
drop policy if exists "anyone can read active promos" on public.promo_codes;
create policy "promo_select" on public.promo_codes
  for select to anon, authenticated using (active = true);

-- profiles：登入用戶可 select/insert/update 自己的
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_insert" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- projects：登入用戶可 select（安全版，不引用 user_id）
drop policy if exists "projects_select" on public.projects;
drop policy if exists "users read own projects" on public.projects;
create policy "projects_select" on public.projects
  for select to authenticated using (true);

-- project_stages：登入用戶可 select（安全版，不引用 project_id）
drop policy if exists "stages_select" on public.project_stages;
drop policy if exists "users read stages of own projects" on public.project_stages;
-- 如果 project_stages 表不存在，下面這行會報錯，但用 do block 包住就不會中斷
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'project_stages') then
    create policy "stages_select" on public.project_stages
      for select to authenticated using (true);
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
drop policy if exists "anyone can upload case images" on storage.objects;
drop policy if exists "anyone can read case images" on storage.objects;
create policy "img_upload" on storage.objects for insert
  to anon, authenticated with check (bucket_id = 'case-images');
create policy "img_read" on storage.objects for select
  to anon, authenticated using (bucket_id = 'case-images');

-- 確認
select tablename, policyname, cmd, roles::text as roles
from pg_policies where schemaname = 'public'
order by tablename, policyname;
