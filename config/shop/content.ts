export const shopGuideSections = [
  {
    id: "return",
    eyebrow: "RETURN POLICY",
    title: "退換貨說明",
    body: [
      "每一條手鍊出貨前皆經過細心檢查，出貨後恕不提供退換貨服務。",
      "若收到商品有瑕疵，或手圍尺寸有任何疑慮，歡迎透過官方 LINE 與我們聯繫。"
    ]
  },
  {
    id: "shipping",
    eyebrow: "SHIPPING INFO",
    title: "運送說明",
    body: ["台灣地區含離島：黑貓宅急便 $130、7-11 店到店 $60，單次購買兩件商品以上免運。"]
  },
  {
    id: "payment",
    eyebrow: "PAYMENT",
    title: "付款方式",
    body: ["台灣地區支援轉帳、信用卡與 Apple Pay。"]
  },
  {
    id: "faq",
    eyebrow: "FAQ",
    title: "常見問題",
    body: [
      "三個月內提供一次免費保固，包含換線、五金汰換與損壞維修。",
      "建議每月至少淨化消磁一次，並避免長時間拉扯或配戴洗澡。",
      "手圍請用皮尺平貼測量淨手圍，不需要自行加 0.5 或 1 公分。"
    ]
  }
] as const;

export const shopCustomPlans = [
  {
    code: "A",
    title: "純客製水晶手鍊",
    price: "手鍊價格：NT$1,500 ± NT$300",
    href: "/custom/form",
    body: "提供想要的功效、色系與款式，或和店家討論愛情、財運、溝通、療癒等方向。"
  }
] as const;
