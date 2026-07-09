import { contactLinks } from "@/config/contact";

export type WorkshopTagIcon = "location" | "people" | "duration";

export type WorkshopTag = {
  icon: WorkshopTagIcon;
  label: string;
};

export type WorkshopPricing = {
  price: string;
  note?: string;
  groupDiscounts?: string[];
};

export type WorkshopExperience = {
  id: string;
  title: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    caption: string;
  };
  tags: WorkshopTag[];
  highlightsTitle: string;
  highlights: string[];
  pricing?: WorkshopPricing;
  cta: {
    label: string;
    href: string;
  };
};

export type WorkshopTestimonial = {
  name: string;
  source: string;
  quote: string;
};

export const popularExperienceSpotlight = {
  eyebrow: "✦ 最熱門體驗 ✦",
  emoji: "🔮",
  title: "生命靈數水晶手鍊體驗課",
  description:
    "從你的生日數字出發，解讀專屬於你的天賦與課題，再挑選最貼近頻率的天然水晶，親手串起一條只屬於自己的手鍊——每一條都是獨一無二的能量印記。",
  highlights: [
    "老師全程詳細解說生命靈數與水晶知識",
    "親手挑選、串起專屬於你的水晶手鍊",
    "完成的手鍊可加購客製吊飾與禮盒包裝",
    "附贈簡易淨化保養小卡，回家就能上手",
    "適合親子、情侶、朋友一起預約體驗"
  ]
};

export const workshopTestimonials: WorkshopTestimonial[] = [
  {
    name: "陳小姐",
    source: "課程學員",
    quote: "本來是想帶媽媽來走走，沒想到老師從生命靈數講到水晶挑選都超細心，媽媽和我都完成了自己的手鍊，整個下午都很療癒。"
  },
  {
    name: "王小姐",
    source: "課程學員",
    quote: "第一次接觸生命靈數，老師講解很好懂，挑水晶的時候也會依照我當下的狀態給建議，做出來的手鍊很喜歡，會再回來體驗！"
  },
  {
    name: "林太太",
    source: "課程學員",
    quote: "帶小朋友一起做手鍊，過程很有趣也很安全，老師很有耐心，還教我們平常怎麼保養水晶，很推薦親子一起來。"
  },
  {
    name: "陳先生",
    source: "課程學員",
    quote: "特地排假來體驗，從解說到手作步驟都很細緻，老師人很溫柔，完成後還幫忙檢查手鍊鬆緊，服務很用心。"
  },
  {
    name: "黃小姐",
    source: "課程學員",
    quote: "情侶一起來體驗超推薦，各自做了屬於自己的手鍊，老師講解生命靈數的部分很準，整個過程很放鬆也很有意義。"
  },
  {
    name: "周小姐",
    source: "課程學員",
    quote: "原本手上舊手鍊有點鬆了，順便請老師幫忙換線，趁機體驗了生命靈數課程，講解得很專業，完成品也很有質感。"
  }
];

export const workshopExperiences: WorkshopExperience[] = [
  {
    id: "numerology-bracelet",
    title: "生命靈數水晶手鍊體驗課",
    image: {
      src: "https://goodaytarot.com/images/about-crystal.jpg",
      alt: "生命靈數水晶手鍊體驗",
      caption: "生命靈數 · 水晶手鍊體驗"
    },
    tags: [
      { icon: "location", label: "桃園火車站開車 7 分鐘" },
      { icon: "people", label: "1-4 人團班制" },
      { icon: "duration", label: "1.5 - 2 小時" }
    ],
    highlightsTitle: "這堂課會讓你學到：",
    highlights: [
      "完整生命靈數計算方法",
      "全生命靈數／陰數／連線解析",
      "手鍊搭配色彩學＋輔導設計",
      "獨門手鍊壓實綁法",
      "水晶保養、淨化、連結方式",
      "水晶能量知識探討"
    ],
    pricing: {
      price: "NT$2,500",
      note: "含所有材料費",
      groupDiscounts: ["2 人同行 -$100/人", "3 人同行 -$150/人"]
    },
    cta: {
      label: "聯繫 LINE 諮詢課程",
      href: contactLinks.line.href
    }
  },
  {
    id: "crystal-business-class",
    title: "水晶創業全能班",
    description: "不只是手作，更是一套完整的創業思維。從水晶理論、基礎美學，到少見技術細節與小資創業 SOP 都完整分享。",
    image: {
      src: "https://goodaytarot.com/images/workshop-small-class.jpg",
      alt: "水晶創業全能班上課實況",
      caption: "水晶創業 · 全能養成班"
    },
    tags: [{ icon: "duration", label: "全程 5.5 小時（含休息）" }],
    highlightsTitle: "這堂課會讓你學到：",
    highlights: [
      "基礎美學、金屬材質與常用配件",
      "小資創業完整 SOP",
      "手鍊／項鍊／吊飾實作（共 3 件作品）",
      "配色秘訣＋專業打結手法",
      "淨化保養與手鍊喚醒方式",
      "建立日常能量維護習慣"
    ],
    cta: {
      label: "聯繫 LINE 諮詢課程",
      href: contactLinks.line.href
    }
  }
];
