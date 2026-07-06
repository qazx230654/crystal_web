create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  status text not null default 'pending',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  line_id text,
  shipping_method text not null,
  shipping_address text,
  payment_method text not null,
  subtotal integer not null default 0,
  shipping_fee integer not null default 0,
  total integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  line_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null,
  product_slug text not null,
  product_name text not null,
  unit_price integer not null,
  quantity integer not null,
  options jsonb,
  created_at timestamptz not null default now()
);

create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  type text not null,
  message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_events_order_id_idx on order_events(order_id);
create index if not exists orders_user_id_idx on orders(user_id);

alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table profiles enable row level security;

grant usage on schema public to service_role;
grant select, insert, update on table orders to service_role;
grant select, insert, update on table order_items to service_role;
grant select, insert, update on table order_events to service_role;
grant select, insert, update on table profiles to service_role;
