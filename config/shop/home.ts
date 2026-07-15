export const shopHome = {
  hero: {
    eyebrow: "Energy Atelier",
    titleLines: ["與你的頻率相遇"],
    accentLines: ["讓晶石", "成為日常光感"],
    body: "以天然晶石承載愛情、財運與內在安定的祈願，為每一天選一段更靠近自己的能量節奏。",
    primaryCta: { label: "探索限量作品", href: "/products?category=monthly" },
    secondaryCta: { label: "預約專屬配置", href: "/custom" },
    stats: ["10,000+ 滿意顧客", "4.9 平均評分", "100% 天然晶石"],
    banner: {
      src: "https://goodaytarot.com/images/about-crystal.jpg",
      alt: "水晶手鍊"
    },
    note: {
      eyebrow: "Daily Alignment",
      body: "讓晶石的光澤，安靜提醒你回到最適合自己的步調。"
    }
  },
  announcementMarquee: "任選兩件商品免運 · 天然晶石手作配置 · Crystal Energy ·",
  energyMarquee: "天然晶石 · 溫柔淨化 · 手作配置 · 關係祝福 · 豐盛流動 · 內在安定 ·",
  customBlock: {
    eyebrow: "Bespoke Energy",
    title: "配置專屬於您的頻率",
    body: "從想靠近的狀態出發，依照功效、色系與配戴習慣，整理成能長久陪伴的晶石作品。",
    cta: { label: "查看客製流程", href: "/custom" }
  },
  bestSellersBlock: {
    eyebrow: "Best Sellers",
    title: "經典熱銷系列"
  }
} as const;
