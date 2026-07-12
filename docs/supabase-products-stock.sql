alter table public.products
add column if not exists stock_quantity integer;

-- stock_quantity 為 NULL 代表不追蹤庫存（沿用目前行為，數量不限）。
-- 要開始追蹤庫存時，請在後台商品編輯頁面輸入實際庫存數量。
