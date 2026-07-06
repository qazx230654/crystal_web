# 商品 API

商品資料目前由 `services/product-service.ts` 統一管理，底層資料來源在 `data/product-source.ts`：

- 預設：`data/mock-products.ts`
- 設定 `PRODUCT_SOURCE=google-drive` 後：讀 Google Drive `products.json`

前台頁面與 API routes 共用同一套 service，因此之後若要把商品來源換成 CMS、Supabase 或其他後台，只要替換 product provider，不需要重寫畫面。

## GET /api/products

取得商品列表。

Query:

- `category`: 可選，分類代碼，例如 `monthly`、`love`、`wealth`
- `sort`: 可選，`銷售量`、`價格低到高`、`價格高到低`、`最新商品`

範例：

```txt
/api/products
/api/products?category=monthly
/api/products?category=monthly&sort=最新商品
```

Response:

```json
{
  "data": [],
  "meta": {
    "count": 0,
    "category": "monthly",
    "sort": "最新商品",
    "source": "google-drive"
  }
}
```

## GET /api/products/[slug]

取得單一商品與相關商品。

範例：

```txt
/api/products/prod-1782487809722
```

Response:

```json
{
  "data": {
    "id": "prod-1782487809722",
    "slug": "prod-1782487809722",
    "name": "青嵐之境手鍊"
  },
  "meta": {
    "related": [],
    "source": "google-drive"
  }
}
```

## GET /api/categories

取得分類與各分類商品數量。

範例：

```txt
/api/categories
```

Response:

```json
{
  "data": [
    {
      "id": "all",
      "label": "全部商品",
      "count": 8
    }
  ],
  "meta": {
    "count": 10,
    "source": "google-drive"
  }
}
```

## 下一步：訂單 API

訂單後端若使用 Supabase，建議接著建立：

```txt
POST /api/orders
GET /api/orders/[id]
PATCH /api/orders/[id]
```

商品 API 保持唯讀；訂單 API 負責寫入 Supabase。
