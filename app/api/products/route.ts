import { NextResponse } from "next/server";
import { listProducts } from "@/services/product-service";
import type { Category } from "@/src/domain/product";
import { getProductSource } from "@/data/product-source";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as Category | null;
  const sort = searchParams.get("sort") ?? undefined;
  const products = await listProducts({
    category: category ?? undefined,
    sort
  });

  return NextResponse.json({
    data: products,
    meta: {
      count: products.length,
      category,
      sort: sort ?? "銷售量",
      source: getProductSource()
    }
  });
}
