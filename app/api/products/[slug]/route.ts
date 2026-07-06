import { NextResponse } from "next/server";
import { findProduct, listRelatedProducts } from "@/services/product-service";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const [product, related] = await Promise.all([
    findProduct(params.slug),
    listRelatedProducts(params.slug)
  ]);

  return NextResponse.json({
    data: product,
    meta: {
      related,
      source: process.env.PRODUCT_SOURCE ?? "mock"
    }
  });
}
