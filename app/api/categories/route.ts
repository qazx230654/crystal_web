import { NextResponse } from "next/server";
import { listCategories } from "@/services/product-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await listCategories();

  return NextResponse.json({
    data: categories,
    meta: {
      count: categories.length,
      source: process.env.PRODUCT_SOURCE ?? "mock"
    }
  });
}
