import { Heart, Shield, Sparkles, WalletCards } from "lucide-react";

export const shopNavbar = {
  links: [
    { label: "每月限量", href: "/products?category=monthly" },
    { label: "預約體驗", href: "/crystal-workshop" },
    { label: "購物說明", href: "/shopping-guide" },
    { label: "訂單查詢", href: "/order-lookup" },
    { label: "品牌故事", href: "/about" }
  ],
  hiddenLabels: ["訂單查詢"],
  categoryMenu: [
    { href: "/products", label: "查看全部商品", muted: "Shop all" },
    { href: "/custom", label: "客製化方案", muted: "Custom plans" }
  ],
  mobilePrimaryLinks: [
    { label: "所有商品", href: "/products" },
    { label: "客製化方案", href: "/custom" }
  ]
} as const;

export const shopCategoryHighlights = [
  { title: "RELATIONSHIP ENERGY", label: "關係與桃花", href: "/products?category=love", icon: Heart },
  { title: "ABUNDANCE FLOW", label: "財富與事業", href: "/products?category=wealth", icon: WalletCards },
  { title: "GROUNDING SHIELD", label: "守護與安定", href: "/products?category=protect", icon: Shield },
  { title: "SOFT HEALING", label: "溫柔療癒", href: "/products?category=healing", icon: Sparkles }
] as const;
