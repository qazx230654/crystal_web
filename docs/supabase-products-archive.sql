alter table public.products
add column if not exists deleted_at timestamptz;

create index if not exists products_deleted_at_idx
on public.products (deleted_at);
