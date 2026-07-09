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

export type ProductStatus = "active" | "soldout" | "draft" | "hidden";

export type ProductArchiveStatus = "archived";

export type ProductDisplayStatus = ProductStatus | ProductArchiveStatus;

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
  deletedAt?: string | null;
  status?: ProductStatus;
};

export type ProductOption = {
  label: string;
  value: string;
  note?: string;
  priceDelta?: number;
};
