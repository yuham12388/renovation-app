-- ============================================
-- 裝修幫手 - 修復 Admin 登入 V2
-- 在 Supabase Dashboard > SQL Editor 貼上執行
-- ============================================

-- 1. 先看一下現有的 constraint（確認問題）
select tc.conname, pg_get_constraintdef(tc.oid) as def
from pg_constraint tc
join pg_class c on c.oid = tc.conrelid
where c.relname = 'profiles' and tc.contype = 'c';

-- 2. 確保 trigger 函數存在
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'owner'));
  return new;
end;
$$ language plpgsql security definer;

-- 3. 確保 trigger 存在
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. 加上 profiles 的 insert policy
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 5. 如果舊 constraint 有問題，先刪再加一個寬鬆的
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_check1;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner', 'designer', 'admin') or role is null);

-- 6. 手動為已存在的 admin user 建 profile
insert into public.profiles (id, name, role)
select id, 'Admin', 'admin'
from auth.users
where email in ('admin2@renovation-helper.com', 'spaceuphelper@gmail.com')
on conflict (id) do update set role = 'admin', name = 'Admin';

-- 7. 確認結果
select u.email, u.id, p.role, p.name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email in ('admin2@renovation-helper.com', 'spaceuphelper@gmail.com');
