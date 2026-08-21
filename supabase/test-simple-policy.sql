-- ============================================
-- 終極測試：用最簡單的 policy 試一下
-- ============================================

-- 先看 design_requests 表的所有 policy
select policyname, cmd, roles, qual, with_check 
from pg_policies 
where schemaname = 'public' and tablename = 'design_requests';

-- 如果上面是空的，說明 policy 沒建在正確的表上
-- 用最原始的方式重建
alter table public.design_requests enable row level security;

drop policy if exists "design_insert" on public.design_requests;
drop policy if exists "design_select" on public.design_requests;

-- 用最簡單的寫法
create policy "design_all" on public.design_requests
  for all using (true) with check (true);

-- 確認
select policyname, cmd, roles, qual, with_check 
from pg_policies 
where schemaname = 'public' and tablename = 'design_requests';
