alter table profiles add column if not exists role text not null default 'member';
alter table profiles add column if not exists status text not null default 'active';
alter table profiles add column if not exists vip_tier text;

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_status_idx on profiles(status);

-- 將指定會員升級為管理員，請把 email 換成你的管理員帳號。
-- update profiles set role = 'admin', status = 'active' where email = 'your-admin@email.com';

-- 可用角色建議：
-- member: 一般會員
-- vip: VIP 會員
-- admin: 後台管理員

-- 可用狀態建議：
-- active: 啟用
-- disabled: 停用
