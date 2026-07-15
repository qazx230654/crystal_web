# Crystal Web Architecture

Crystal Web 是以 Next.js App Router 建立的精品水晶電商前後台。專案目前採用接近 Clean Architecture 的分層方式：UI 只負責呈現與互動，商業規則集中在 Domain，資料存取集中在 Repository，應用流程由 Service 組合，品牌與商家差異集中在 Config。

## 資料流

### 前台商品瀏覽

```txt
UI Page / Component
  -> services/product-service.ts
  -> repositories/product-repository.ts
  -> Supabase products
  -> Domain product rules
  -> UI render
```

前台商品列表與商品詳情透過 `product-service` 讀取商品。Repository 負責 Supabase REST 查詢，Service 負責整理商品資料，Domain 負責分類、狀態、標籤與可購買判斷。

### 購物車與結帳

```txt
Cart UI / Checkout Page
  -> components/cart-context.tsx
  -> src/domain/checkout/*
  -> services/order/create-order.service.ts
  -> repositories/order-repository.ts
  -> Supabase orders / order_items / order_events
```

購物車 localStorage 只保存 `productId`、`slug`、`quantity`、選項與客製資料。結帳前會重新取得最新商品資訊，並由 Checkout Domain 處理運費、驗證與 payload 組裝。

### 訂單管理

```txt
Admin Orders UI
  -> hooks/useAdminApi.ts
  -> app/api/orders/*
  -> services/order/*
  -> repositories/order-repository.ts
  -> src/domain/order + payment + logistics
  -> Supabase orders
```

後台訂單 UI 不直接決定狀態文案與可操作按鈕，而是引用 Domain。Service 負責建立訂單、更新訂單、流程動作、通知與銷量更新。

### 商品管理

```txt
Admin Products UI
  -> hooks/useAdminApi.ts
  -> app/api/admin/products/*
  -> services/supabase-product-service.ts
  -> repositories/product-repository.ts
  -> Supabase products
```

商品新增、編輯、上下架與封存透過 Admin API。商品圖片上傳由 `repositories/storage-repository.ts` 寫入 Supabase Storage，再把 URL 存入 `products`。

### 會員與權限

```txt
Auth UI / API
  -> services/auth-service.ts
  -> Supabase Auth
  -> repositories/member-repository.ts
  -> Supabase profiles
```

會員登入註冊使用 Supabase Auth。管理員保護由 `services/admin-auth.ts` 的 `requireAdmin` 統一處理，Admin API 必須先經過權限檢查。

## 資料夾結構

```txt
app/
  Next.js App Router 頁面、layout、API routes

components/
  可重用 UI 元件、全站 shell、商品卡、購物車、顧問、shadcn/ui

src/domain/
  純商業規則，不直接存取 Supabase、不處理畫面

repositories/
  資料存取層，目前內部使用 Supabase REST / Storage

services/
  應用服務層，負責串接 Domain、Repository、通知與工作流程

hooks/
  前端共用 hooks，例如 admin API loading/error/401 處理

config/
  技術與商家設定

config/shop/
  品牌、導覽、Footer、付款、物流、首頁、模組開關、品牌色

data/
  目前仍保留的靜態資料入口；部分已改為 re-export shop config
```

## Domain Layer

位置：`src/domain/`

Domain Layer 放「不依賴 UI、API、Database」的商業規則。

### Order Domain

位置：`src/domain/order/`

負責：

- 訂單狀態 `OrderStatus`
- 狀態 label 與樣式
- 後台篩選 tabs
- 狀態轉換
- Admin 可執行操作

相關檔案：

- `src/domain/order/status.ts`
- `src/domain/order/admin-actions.ts`
- `src/domain/order/filters.ts`
- `src/domain/order/index.ts`

### Payment Domain

位置：`src/domain/payment/`

負責：

- 金流狀態
- 金流狀態 label
- 從訂單資料解析付款狀態

### Logistics Domain

位置：`src/domain/logistics/`

負責：

- 物流狀態
- 物流狀態 label / color
- 從訂單資料解析物流狀態

### Checkout Domain

位置：`src/domain/checkout/`

負責：

- `DeliveryMethod`
- `PaymentMethod`
- `ShippingRule`
- 運費計算
- 711 門市 callback 資料解析
- checkout payload 組裝
- checkout 驗證
- 付款備註組裝

相關檔案：

- `src/domain/checkout/shipping.ts`
- `src/domain/checkout/payment.ts`
- `src/domain/checkout/payload-builder.ts`
- `src/domain/checkout/validator.ts`
- `src/domain/checkout/types.ts`

### Product Domain

位置：`src/domain/product/`

負責：

- 商品分類
- 商品狀態
- 商品上下架/封存顯示狀態
- 礦石、功效、標籤 options
- 商品是否不可購買的判斷
- 商品表單 options

相關檔案：

- `src/domain/product/categories.ts`
- `src/domain/product/status.ts`
- `src/domain/product/tags.ts`
- `src/domain/product/form-options.ts`
- `src/domain/product/types.ts`

## Repository Layer

位置：`repositories/`

Repository Layer 是資料存取邊界。Service 應透過 Repository 存取資料，不應在 Service 或 UI 直接散落 Supabase table 操作。

目前 Repository：

- `repositories/product-repository.ts`
  - 存取 `products`
  - 商品列表、新增、更新、上下架、封存、庫存、銷量

- `repositories/order-repository.ts`
  - 存取 `orders`、`order_items`、`order_events`
  - 建立訂單、查詢訂單、更新訂單、寫入事件

- `repositories/member-repository.ts`
  - 存取 `profiles`
  - 會員 profile 建立與更新

- `repositories/storage-repository.ts`
  - 存取 Supabase Storage
  - 商品圖片上傳與 public URL 產生

Supabase REST helper 目前位於：

- `services/supabase-rest.ts`
- `services/supabase-storage.ts`

這兩個檔案偏基礎設施工具，未來若要更嚴格，可移到 `repositories/_shared` 或 `lib/supabase`。

## Service Layer

位置：`services/`

Service Layer 是應用流程層，負責組合 Domain 與 Repository。

### Product Services

- `services/product-service.ts`
  - 前台商品列表、商品詳情、相關商品

- `services/supabase-product-service.ts`
  - 後台商品新增/更新/封存/上下架

- `services/admin-product-store.ts`
  - 後台商品表單 options

- `services/product-validation.ts`
  - 商品新增/編輯 payload 驗證

- `services/product-status.ts`
  - 商品狀態與儲存格式轉換

### Order Services

位置：`services/order/`

- `create-order.service.ts`
  - 建立訂單
  - 寫入訂單品項與事件
  - 呼叫通知與銷量更新

- `update-order.service.ts`
  - 更新訂單狀態
  - 查詢訂單、查詢列表、訂單查詢

- `order-workflow.service.ts`
  - 後台操作流程
  - 開始備貨、建立物流單、標記出貨、取消、退款

- `order-notification.service.ts`
  - 訂單通知流程
  - 新訂單、付款成功、出貨等通知入口

- `order-sales.service.ts`
  - 訂單完成後更新商品銷量

- `shipping.service.ts`
  - 訂單運費與商品有效性檢查

- `stock.service.ts`
  - 商品庫存保留、扣庫存、回補庫存

- `types.ts`
  - 訂單 service 共用型別

相容入口：

- `services/order-service.ts`

此檔目前作為 facade，讓舊 API 與 UI import 不需要大幅改動。

### Auth / Admin Services

- `services/auth-service.ts`
  - Supabase Auth 註冊、登入、登出、重設密碼、會員 profile

- `services/admin-auth.ts`
  - `requireAdmin`
  - 後台 API 權限保護

### Notification Service

- `services/notification-service.ts`
  - Email 通知寄送
  - 目前可串 Resend，未來也可擴充 LINE Notify / Messaging API

## Config Layer

位置：`config/`

Config Layer 放商家、品牌、付款、物流、模組開關與外部整合設定。未來替不同商家做 demo 或正式站，應優先改這裡。

### Shop Config

位置：`config/shop/`

- `brand.ts`
  - 店名
  - Logo mark
  - tagline
  - metadata title / description

- `contact.ts`
  - Instagram
  - LINE

- `payment.ts`
  - 銀行帳號
  - 付款方式文案

- `shipping.ts`
  - 宅配與超商物流選項
  - 運費

- `navigation.ts`
  - Navbar
  - 商品分類 dropdown
  - Mobile menu
  - 分類 highlights

- `footer.ts`
  - Footer 描述與欄位

- `home.ts`
  - 首頁 hero
  - 首頁 banner image
  - 首頁 CTA
  - 首頁跑馬燈
  - 首頁區塊文案

- `modules.ts`
  - 全站模組開關
  - 首頁模組開關
  - 商品頁模組開關

- `theme.ts`
  - 品牌色
  - CSS variables

- `content.ts`
  - 購物說明
  - 客製化方案

### Compatibility Config

以下舊入口仍保留，內部已改讀 `config/shop`：

- `config/contact.ts`
- `config/checkout.ts`
- `config/modules.ts`
- `data/site.ts`

保留原因是降低重構風險，避免一次修改所有 UI import。

## UI Layer

UI Layer 包含 `app/` 與 `components/`。

原則：

- Page 負責 route、資料取得與 layout 組合
- Component 負責呈現與互動
- UI 不直接寫訂單狀態規則
- UI 不直接操作 Supabase table
- UI 透過 Service、API route、Domain helper 取得結果
- Admin API 呼叫使用 `hooks/useAdminApi.ts` 統一 loading、error、401 redirect

主要 UI 分布：

- `app/page.tsx`
  - 首頁
  - 讀 `config/shop/home.ts`

- `components/site-chrome.tsx`
  - AuthProvider / CartProvider / Header / Footer / CartDrawer / CrystalAdvisor 組裝

- `components/site-chrome-parts.tsx`
  - Header
  - Navbar
  - Footer
  - Announcement marquee

- `components/brand.tsx`
  - Logo 與品牌名稱
  - 讀 `config/shop/brand.ts`

- `app/products/*`
  - 商品列表與商品詳情

- `app/checkout/*`
  - 結帳頁與拆分元件
  - 邏輯引用 Checkout Domain

- `app/admin/orders/*`
  - 訂單管理
  - 狀態、按鈕、篩選引用 Order Domain

- `app/admin/products/*`
  - 商品管理與商品編輯
  - 表單 options 引用 Product Domain

- `components/ui/*`
  - shadcn/ui 基礎元件

## 新增一間商家時需要修改哪些地方

優先只修改 `config/shop/`。

### 必改

1. `config/shop/brand.ts`
   - 店名
   - Logo mark
   - tagline
   - metadata title / description

2. `config/shop/contact.ts`
   - Instagram
   - LINE

3. `config/shop/payment.ts`
   - 銀行名稱
   - 銀行代碼
   - 銀行帳號
   - 帳戶名稱

也可以使用環境變數覆蓋：

```txt
NEXT_PUBLIC_BANK_ACCOUNT_NAME
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER
NEXT_PUBLIC_BANK_CODE
NEXT_PUBLIC_BANK_NAME
```

4. `config/shop/shipping.ts`
   - 運費
   - 配送方式文案

5. `config/shop/home.ts`
   - 首頁 hero 文案
   - 首頁 banner 圖
   - 首頁 CTA
   - 首頁跑馬燈
   - 首頁推薦區塊文案

6. `config/shop/navigation.ts`
   - Navbar 連結
   - 商品分類 dropdown
   - Mobile menu
   - 首頁分類 highlights

7. `config/shop/footer.ts`
   - Footer 描述
   - Footer 欄位與連結

8. `config/shop/theme.ts`
   - 品牌色
   - CSS variables

### 視情況修改

1. `config/shop/modules.ts`
   - 是否顯示搜尋
   - 是否顯示會員入口
   - 是否顯示購物車
   - 是否顯示 Footer
   - 是否顯示水晶顧問
   - 首頁模組開關

2. `config/shop/content.ts`
   - 購物說明
   - 退換貨
   - 付款說明
   - 客製化方案

3. `src/domain/product/`
   - 若新商家的商品分類、礦石分類、功效分類完全不同，才修改 Product Domain options

4. `src/domain/checkout/`
   - 若運費計算規則、付款方式、配送方式邏輯不同，才修改 Checkout Domain

5. `src/domain/order/`
   - 若訂單流程狀態不同，才修改 Order Domain

### 通常不需要修改

- `repositories/`
  - 除非更換資料庫或 Storage provider

- `services/order/`
  - 除非訂單建立、通知、庫存、物流流程不同

- `components/ui/`
  - 除非要調整整體 Design System

- `app/api/`
  - 除非 API contract 或權限規則改變

## 目前架構注意事項

- `services/order-service.ts` 目前是 facade，保留給既有 import 使用。
- `config/contact.ts`、`config/checkout.ts`、`config/modules.ts`、`data/site.ts` 是相容入口，實際資料來源已集中到 `config/shop`。
- `services/auth-service.ts` 仍直接呼叫 Supabase Auth，這是外部 Auth 基礎設施，不屬於一般資料表 Repository。
- `repositories/storage-repository.ts` 直接處理 Supabase Storage，符合 StorageRepository 邊界。
- 若未來要更嚴格 Clean Architecture，可以把 `services/supabase-rest.ts` 移到 infrastructure/shared，但目前 Repository 已是主要資料存取邊界。

