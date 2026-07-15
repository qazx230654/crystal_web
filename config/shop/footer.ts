export const shopFooter = {
  description: "專屬你的能量水晶，陪你走向更好的每一天。",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "所有商品", href: "/products" },
        { label: "客製化方案", href: "/custom" },
        { label: "訂單查詢", href: "/order-lookup" },
        { label: "購物說明", href: "/shopping-guide" }
      ]
    },
    {
      title: "Contact",
      links: [
        { label: "聯絡我們", href: "/contact" },
        { label: "Instagram", href: "instagram", external: true },
        { label: "LINE", href: "line", external: true }
      ]
    }
  ]
} as const;
