# 訂單 API

訂單 API 使用 Next.js server route 寫入 Supabase。前端不直接接觸 Supabase service role key。

需要環境變數：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon / publishable key
SUPABASE_SERVICE_ROLE_KEY=你的 service_role 或 secret key
ADMIN_ORDERS_TOKEN=你的後台管理密碼
```

`SUPABASE_SERVICE_ROLE_KEY` 不可以加 `NEXT_PUBLIC_`，也不要提交到 Git。
可以參考專案根目錄的 `.env.example` 建立自己的 `.env.local`。

`ADMIN_ORDERS_TOKEN` 會用於 `/admin/login` 後台登入。登入成功後系統會寫入 HttpOnly cookie，後台頁面與後台訂單 API 會自動用此 cookie 驗證；正式環境務必設定這個值。

`NEXT_PUBLIC_SUPABASE_ANON_KEY` 會用於會員 Email / 密碼註冊與登入。前端仍是呼叫本站 `/api/auth/*`，不會直接操作資料表；實際讀寫會員資料與訂單關聯由 server route 完成。

## Supabase schema

先到 Supabase SQL Editor 執行：

```txt
docs/supabase-orders.sql
```

會建立：

- `orders`
- `order_items`
- `order_events`
- `profiles`

也會在 `orders` 新增 `user_id`，用來把會員訂單與 Supabase Auth 使用者關聯起來；免會員訂單則維持空值。

## POST /api/orders

建立訂單。

Request:

```json
{
  "customer": {
    "name": "王小明",
    "phone": "0912345678",
    "email": "hello@example.com",
    "lineId": "gooday_line"
  },
  "items": [
    {
      "productId": "prod-1782487809722",
      "productSlug": "prod-1782487809722",
      "quantity": 1,
      "options": {
        "size": "15 cm",
        "clasp": "彈力繩"
      }
    }
  ],
  "shipping": {
    "method": "711",
    "address": "7-11 門市或收件地址"
  },
  "paymentMethod": "bank-transfer",
  "note": "希望盡快出貨"
}
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "order_number": "GD20260706ABC123",
    "status": "pending",
    "total": 2640
  },
  "meta": {
    "items": [],
    "totals": {
      "subtotal": 2580,
      "shippingFee": 60,
      "total": 2640
    }
  }
}
```

## GET /api/orders/[id]

讀取單一訂單、明細與事件紀錄。
