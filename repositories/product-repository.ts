import type { Category } from "@/src/domain/product";
import { supabaseRest } from "@/services/supabase-rest";

export type SupabaseProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  category: string[] | null;
  minerals: string[] | null;
  benefits: string[] | null;
  image: string | null;
  images: string[] | null;
  description: string | null;
  stock_label: string | null;
  sales: number | null;
  created_at: string | null;
  deleted_at: string | null;
};

export type ProductInsertRecord = {
  benefits: string[];
  category: Category[];
  created_at?: string;
  description?: string;
  image: string;
  images: string[];
  minerals: string[];
  name: string;
  original_price?: number | null;
  price: number;
  sales?: number;
  slug: string;
  stock_label: string;
};

export type ProductUpdateRecord = Omit<ProductInsertRecord, "created_at" | "sales">;

export type ProductSalesRecord = {
  id: string;
  sales?: number | null;
};

export class ProductRepository {
  listProducts() {
    return supabaseRest<SupabaseProductRow[]>("products", {
      query: "?select=*&order=created_at.desc.nullslast"
    });
  }

  async createProduct(payload: ProductInsertRecord) {
    const [product] = await supabaseRest<Array<{ id: string } & ProductInsertRecord>>("products", {
      body: payload,
      method: "POST"
    });

    return product;
  }

  async updateProduct(id: string, payload: ProductUpdateRecord) {
    const [product] = await supabaseRest<Array<{ id: string } & ProductUpdateRecord>>("products", {
      body: payload,
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return product;
  }

  async getProductStockLabel(id: string) {
    const [product] = await supabaseRest<Array<{ id: string; stock_label: string | null }>>("products", {
      query: `?id=eq.${encodeURIComponent(id)}&select=id,stock_label`
    });

    return product ?? null;
  }

  async updateProductStockLabel(id: string, stockLabel: string) {
    const [product] = await supabaseRest<Array<{ id: string; stock_label: string | null }>>("products", {
      body: { stock_label: stockLabel },
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return product;
  }

  async archiveProduct(id: string) {
    const [product] = await supabaseRest<Array<{ id: string; deleted_at: string | null }>>("products", {
      body: { deleted_at: new Date().toISOString() },
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return product;
  }

  async restoreProduct(id: string) {
    const [product] = await supabaseRest<Array<{ id: string; deleted_at: string | null }>>("products", {
      body: { deleted_at: null },
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return product;
  }

  async findProductSalesById(id: string) {
    const [product] = await supabaseRest<ProductSalesRecord[]>("products", {
      query: `?id=eq.${encodeURIComponent(id)}&select=id,sales&limit=1`
    });

    return product ?? null;
  }

  async findProductSalesBySlug(slug: string) {
    const [product] = await supabaseRest<ProductSalesRecord[]>("products", {
      query: `?slug=eq.${encodeURIComponent(slug)}&select=id,sales&limit=1`
    });

    return product ?? null;
  }

  async updateProductSales(id: string, sales: number) {
    const [product] = await supabaseRest<ProductSalesRecord[]>("products", {
      body: { sales },
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return product;
  }
}

export const productRepository = new ProductRepository();
