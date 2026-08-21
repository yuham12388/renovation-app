-- ============================================
-- 深度診斷：列出每個 policy 的完整定義
-- ============================================

select 
  tablename,
  policyname,
  cmd,
  roles::text as roles,
  qual,
  with_check
from pg_policies 
where schemaname = 'public'
order by tablename, policyname;
