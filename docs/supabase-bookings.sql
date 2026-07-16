create table if not exists experience_plans (
  id uuid primary key default gen_random_uuid(),
  experience_id text not null,
  name text not null,
  description text,
  price_per_person integer not null,
  min_headcount integer not null default 1,
  max_headcount integer,
  duration_minutes integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists experience_sessions (
  id uuid primary key default gen_random_uuid(),
  experience_id text not null,
  session_date date not null,
  start_time time not null,
  end_time time,
  capacity integer not null,
  booked_count integer not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  booking_number text unique not null,
  experience_id text not null,
  plan_id uuid references experience_plans(id),
  session_id uuid references experience_sessions(id),
  booking_status text not null default 'pending',
  payment_status text not null default 'unpaid',
  headcount integer not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  line_id text,
  payment_method text not null,
  unit_price integer not null,
  total integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type text not null,
  message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists experience_sessions_experience_date_idx on experience_sessions(experience_id, session_date);
create index if not exists experience_sessions_status_idx on experience_sessions(status);
create index if not exists bookings_user_id_idx on bookings(user_id);
create index if not exists bookings_session_id_idx on bookings(session_id);
create index if not exists bookings_booking_status_idx on bookings(booking_status);
create index if not exists bookings_payment_status_idx on bookings(payment_status);
create index if not exists booking_events_booking_id_idx on booking_events(booking_id);

alter table experience_plans enable row level security;
alter table experience_sessions enable row level security;
alter table bookings enable row level security;
alter table booking_events enable row level security;

grant usage on schema public to service_role;
grant select, insert, update on table experience_plans to service_role;
grant select, insert, update on table experience_sessions to service_role;
grant select, insert, update on table bookings to service_role;
grant select, insert, update on table booking_events to service_role;

-- booking_status 可用值：pending / confirmed / attended / no_show / cancelled
-- payment_status 沿用 orders 既有語意：unpaid / paid / failed / refunding / refunded
-- experience_sessions.status 可用值：open / closed / cancelled
