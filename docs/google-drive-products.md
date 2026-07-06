# Google Drive 商品資料夾格式

這個專案已經把商品資料層拆成可抽換 provider。預設使用 `data/mock-products.ts`，若要改讀 Google Drive，設定：

```bash
PRODUCT_SOURCE=google-drive
GOOGLE_DRIVE_PRODUCTS_FOLDER_ID=你的資料夾 ID
GOOGLE_DRIVE_API_KEY=你的 Google Drive API Key
```

資料夾支援兩種方式：

1. 放一個 `products.json`
2. 每個商品各放一個 `.json`

建議商品 JSON 欄位：

```json
{
  "id": "prod-demo",
  "slug": "prod-demo",
  "name": "青嵐之境手鍊",
  "price": 2580,
  "originalPrice": 2880,
  "category": ["monthly", "healing", "wealth"],
  "minerals": ["綠螢石", "白水晶"],
  "benefits": ["財運", "專注"],
  "image": "https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600",
  "images": ["https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600"],
  "imageFileId": "Google Drive 圖片檔案 ID",
  "imageFileName": "cover.jpg",
  "imageFileNames": ["cover.jpg", "detail.jpg"],
  "description": "商品說明",
  "stockLabel": "現貨 2-5 個工作天寄出",
  "sales": 280,
  "createdAt": "2026-06-08"
}
```

圖片欄位有三種填法，擇一即可：

- `image` / `images`：直接填完整圖片 URL
- `imageFileId`：填 Google Drive 圖片檔案 ID，系統會組成縮圖 URL
- `imageFileName` / `imageFileNames`：商品 JSON 與圖片放在同一個 Drive 資料夾，系統會依檔名配對圖片

可用分類代碼：

- `monthly` 每月限量
- `love` 愛情桃花
- `wealth` 財運事業
- `protect` 能量防護
- `healing` 療癒系列
- `necklace` 項鍊
- `charm` 吊飾
- `perfume` 能量香水
- `other` 其他

畫面模組開關集中在 `config/modules.ts`，可以用布林值快速開關首頁區塊、購物袋、顧問浮窗、跑馬燈與商品頁功能。
