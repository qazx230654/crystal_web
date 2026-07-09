alter table orders add column if not exists order_status text;
alter table orders add column if not exists payment_status text not null default 'unpaid';
alter table orders add column if not exists shipping_status text not null default 'pending';
alter table orders add column if not exists logistics_provider text;
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists logistics_print_url text;
alter table orders add column if not exists shipped_at timestamptz;

update orders
set
  order_status = coalesce(order_status, status, 'pending'),
  payment_status = case
    when payment_status is not null and payment_status <> '' then payment_status
    when status in ('paid', 'making', 'shipped', 'completed') then 'paid'
    else 'unpaid'
  end,
  shipping_status = case
    when shipping_status is not null and shipping_status <> '' then shipping_status
    when status = 'shipped' then 'shipped'
    when status = 'completed' then 'delivered'
    else 'pending'
  end
where true;

alter table orders alter column order_status set default 'pending';
alter table orders alter column order_status set not null;

create index if not exists orders_order_status_idx on orders(order_status);
create index if not exists orders_payment_status_idx on orders(payment_status);
create index if not exists orders_shipping_status_idx on orders(shipping_status);
