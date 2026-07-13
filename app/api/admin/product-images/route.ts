import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/services/admin-auth";
import { storageRepository } from "@/repositories/storage-repository";

export const dynamic = "force-dynamic";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAdminWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: { message: "請選擇要上傳的商品圖片" } }, { status: 400 });
    }
    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json({ error: { message: "圖片格式僅支援 JPG、PNG、WEBP 或 GIF" } }, { status: 400 });
    }
    if (file.size > maxImageSize) {
      return NextResponse.json({ error: { message: "圖片大小不可超過 6MB" } }, { status: 400 });
    }

    const image = await storageRepository.uploadProductImage(file);
    return NextResponse.json({ data: image }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "圖片上傳失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
