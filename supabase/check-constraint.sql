-- 查 estimate_records 的 check constraint 允許哪些 level 值
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.estimate_records'::regclass
  and contype = 'c';
