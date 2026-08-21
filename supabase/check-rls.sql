-- ============================================
-- 診斷 RLS 狀態：確認每張表的 RLS 是否啟用
-- ============================================

select 
  tablename as table_name,
  rowsecurity as rls_enabled,
  (select count(*) from pg_policies pp where pp.schemaname = 'public' and pp.tablename = c.relname) as policy_count
from pg_tables t
join pg_class c on c.relname = t.tablename
where t.schemaname = 'public'
  and t.tablename in ('design_requests','estimate_records','cases','crew_requests','coop_applications','promo_codes','profiles','projects','project_stages')
order by t.tablename;
