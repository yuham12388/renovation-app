-- ============================================
-- 裝修幫手 - 修復 RLS Insert Policy
-- 在 Supabase Dashboard > SQL Editor 貼上執行
-- 用途：讓 anon key（未登入用戶）也能 insert 表單資料
-- ============================================

-- 1. design_requests：任何人都可以提交設計需求
drop policy if exists "anyone can submit request" on public.design_requests;
create policy "anyone can submit request" on public.design_requests
  for insert to anon, authenticated with check (true);

-- 2. estimate_records：任何人都可以儲存估價記錄
drop policy if exists "anyone can save estimate" on public.estimate_records;
create policy "anyone can save estimate" on public.estimate_records
  for insert to anon, authenticated with check (true);

-- 3. cases：任何人都可以提交案例（狀態為 draft）
drop policy if exists "anyone can submit case" on public.cases;
create policy "anyone can submit case" on public.cases
  for insert to anon, authenticated with check (true);

-- 4. crew_requests：任何人都可以提交工班需求
drop policy if exists "anyone can submit crew request" on public.crew_requests;
create policy "anyone can submit crew request" on public.crew_requests
  for insert to anon, authenticated with check (true);

-- 5. coop_applications：任何人都可以提交合作申請
drop policy if exists "anyone can apply coop" on public.coop_applications;
create policy "anyone can apply coop" on public.coop_applications
  for insert to anon, authenticated with check (true);

-- 6. profiles：登入用戶可建自己的 profile
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- 7. 確認結果：列出所有 policy
select tablename, policyname, cmd, roles::text as role
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
