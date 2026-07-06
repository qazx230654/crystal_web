export type Category =
  | "monthly"
  | "love"
  | "wealth"
  | "protect"
  | "healing"
  | "necklace"
  | "charm"
  | "perfume"
  | "other";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: Category[];
  minerals: string[];
  benefits: string[];
  image: string;
  images?: string[];
  description: string;
  stockLabel: string;
  sales: number;
  createdAt: string;
};

export const categoryLabels: Record<Category | "all", string> = {
  all: "全部商品",
  monthly: "每月限量",
  love: "愛情桃花",
  wealth: "財運事業",
  protect: "能量防護",
  healing: "療癒系列",
  necklace: "項鍊",
  charm: "吊飾",
  perfume: "能量香水",
  other: "其他"
};
