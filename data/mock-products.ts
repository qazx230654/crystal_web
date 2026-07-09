import type { Product } from "@/src/domain/product";

export const mockProducts: Product[] = [
  {
    id: "prod-1782487809722",
    slug: "prod-1782487809722",
    name: "青嵐之境手鍊",
    price: 2580,
    category: ["monthly", "healing", "wealth"],
    minerals: ["綠螢石", "綠阿賽", "黃虎眼石", "祖母晶", "白幽靈", "白水晶", "珍珠"],
    benefits: ["壓力", "自信", "事業", "貴人", "財運"],
    image: "https://drive.google.com/thumbnail?id=11w_f0nmMRgssJW5LUcefA2nf6njb_vu7&sz=w1600",
    images: [
      "https://drive.google.com/thumbnail?id=11w_f0nmMRgssJW5LUcefA2nf6njb_vu7&sz=w1600",
      "https://drive.google.com/thumbnail?id=1Jyf5nMvB4zRP4UWsLBLmbqMgIDiiy09v&sz=w1600"
    ],
    description:
      "真正的力量，不是迎著風奔跑，而是在風起時依然守住自己的方向。綠螢石整理思緒，黃虎眼石帶來行動力，白水晶協調整體能量。",
    stockLabel: "現貨 2-5 個工作天寄出",
    sales: 280,
    createdAt: "2026-06-08"
  },
  {
    id: "prod-1782487502261",
    slug: "prod-1782487502261",
    name: "浮光之境手鍊",
    price: 1380,
    category: ["monthly", "wealth"],
    minerals: ["金髮晶"],
    benefits: ["招財", "事業", "貴人", "自信"],
    image: "https://drive.google.com/thumbnail?id=1Y-zMUfBHSTwskNAdejfwUKV0BCQivkWN&sz=w1600",
    description: "金髮晶象徵明亮的行動力，適合正在推進目標、想穩住自信與財運的人。",
    stockLabel: "現貨 2-5 個工作天寄出",
    sales: 240,
    createdAt: "2026-06-06"
  },
  {
    id: "prod-1782454150570",
    slug: "prod-1782454150570",
    name: "白夜序章手鍊",
    price: 1580,
    category: ["monthly", "healing", "protect"],
    minerals: ["白幽靈", "白水晶"],
    benefits: ["穩定情緒", "專注"],
    image: "https://drive.google.com/thumbnail?id=1HGgNJAEtlPOsGD4VgXMV4OEdJhuEsEru&sz=w1600",
    description: "白幽靈協助釋放沉重情緒，白水晶放大清明感，讓日常慢慢回到平衡。",
    stockLabel: "現貨 2-5 個工作天寄出",
    sales: 220,
    createdAt: "2026-06-04"
  },
  {
    id: "d005-moon-clear-heart",
    slug: "d005-moon-clear-heart",
    name: "月映淨心手鍊",
    price: 1580,
    category: ["love", "healing"],
    minerals: ["粉晶", "白月光", "珍珠", "白水晶", "藍月光"],
    benefits: ["淨化", "愛情"],
    image: "https://goodaytarot.com/images/d-design/d005.jpg",
    description: "柔粉與月光石調和情緒，為愛情、關係與內在柔軟度補上安定的頻率。",
    stockLabel: "下單後 5-10 個工作天寄出",
    sales: 180,
    createdAt: "2026-05-19"
  },
  {
    id: "d001-moon-secret",
    slug: "d001-moon-secret",
    name: "月下密語手鍊",
    price: 1580,
    originalPrice: 1680,
    category: ["healing", "protect"],
    minerals: ["白幽靈", "藍月光", "灰月光", "藍針", "珍珠"],
    benefits: ["淨化", "平衡"],
    image: "https://goodaytarot.com/images/d-design/d001.jpg",
    description: "像夜色裡的一段低語，協助清理雜訊，找回直覺與心靈平衡。",
    stockLabel: "下單後 5-10 個工作天寄出",
    sales: 160,
    createdAt: "2026-05-12"
  },
  {
    id: "prod-1780818090716",
    slug: "prod-1780818090716",
    name: "月映星河項鍊",
    price: 1350,
    category: ["necklace", "wealth", "protect"],
    minerals: ["白瑪瑙", "珍珠", "藍月光", "白幽靈"],
    benefits: ["人緣", "負能量", "招財", "穩定內在"],
    image: "https://goodaytarot.com/images/d-design/d004.jpg",
    description: "以珍珠和月光的柔和色澤，穩定日常能量，也讓穿搭更有光感。",
    stockLabel: "現貨 2-5 個工作天寄出",
    sales: 150,
    createdAt: "2026-05-07"
  },
  {
    id: "custom-deposit-product",
    slug: "custom-deposit-product",
    name: "客製化商品",
    price: 1500,
    category: ["other", "love", "wealth", "healing"],
    minerals: ["依需求搭配"],
    benefits: ["客製", "能量解析"],
    image: "https://goodaytarot.com/images/about-crystal.jpg",
    description: "依照你的功效、色系、款式與當下狀態安排礦石搭配，提供初版免費修改一次。",
    stockLabel: "預約制",
    sales: 210,
    createdAt: "2026-04-20"
  },
  {
    id: "prod-1781070485343",
    slug: "prod-1781070485343",
    name: "白水晶碎石｜淨化能量首選",
    price: 80,
    category: ["other", "healing"],
    minerals: ["白水晶"],
    benefits: ["淨化"],
    image: "https://goodaytarot.com/images/workshop-products.jpg",
    description: "一包約為一條手鍊的淨化用量，適合日常消磁與能量維護。",
    stockLabel: "現貨 2-5 個工作天寄出",
    sales: 340,
    createdAt: "2026-03-30"
  }
];
