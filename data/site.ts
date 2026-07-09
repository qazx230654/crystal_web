import { Heart, Shield, Sparkles, WalletCards } from "lucide-react";

export const navLinks = [
  { label: "每月限量", href: "/products?category=monthly" },
  { label: "預約體驗", href: "/crystal-workshop" },
  { label: "購物說明", href: "/shopping-guide" },
  { label: "訂單查詢", href: "/order-lookup" },
  { label: "品牌故事", href: "/about" }
];

export const categoryHighlights = [
  { title: "RELATIONSHIP ENERGY", label: "關係與桃花", href: "/products?category=love", icon: Heart },
  { title: "ABUNDANCE FLOW", label: "財富與事業", href: "/products?category=wealth", icon: WalletCards },
  { title: "GROUNDING SHIELD", label: "守護與安定", href: "/products?category=protect", icon: Shield },
  { title: "SOFT HEALING", label: "溫柔療癒", href: "/products?category=healing", icon: Sparkles }
];

export const guideSections = [
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
];

export const customPlans = [
  {
    code: "A",
    title: "純客製水晶手鍊",
    price: "手鍊價格：NT$1,500 ± NT$300",
    href: "/custom/form",
    body: "提供想要的功效、色系與款式，或和店家討論愛情、財運、溝通、療癒等方向。"
  }
  // ,
  // {
  //   code: "B",
  //   title: "塔羅 × 水晶手鍊",
  //   price: "手鍊價格：NT$1,500 ± NT$300｜塔羅依價目表 9 折",
  //   href: "/custom/form-b",
  //   body: "以塔羅解析當下缺失能量，再依解析配置水晶，適合想要更完整能量對話的人。"
  // },
  // {
  //   code: "C",
  //   title: "脈輪檢測 × 水晶手鍊",
  //   price: "手鍊價格：NT$1,500 ± NT$300｜脈輪檢測 NT$500",
  //   href: "/custom/form-c",
  //   body: "透過七大脈輪能量檢測，找出需要照看的頻率並完成專屬水晶搭配。"
  // },
  // {
  //   code: "D",
  //   title: "生命靈數 × 水晶手鍊",
  //   price: "手鍊價格：NT$1,500 ± NT$300｜生命靈數解析 NT$500",
  //   href: "/custom/form-d",
  //   body: "從生命數、天賦數、星座數與空缺數切入，強化優勢並溫柔補足缺口。"
  // }
];
