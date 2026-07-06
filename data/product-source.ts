import { mockProducts } from "@/data/mock-products";
import type { Category, Product } from "@/data/product-types";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webContentLink?: string;
};

type DriveProductFile = Partial<Omit<Product, "category">> & {
  category?: Category | Category[] | string | string[];
  imageFileId?: string;
  imageFileName?: string;
  imageFileNames?: string[];
};

const driveApiBase = "https://www.googleapis.com/drive/v3/files";
const driveFetchOptions = { cache: "no-store" as const };

export const products = mockProducts;

export async function getProducts(): Promise<Product[]> {
  if (process.env.PRODUCT_SOURCE !== "google-drive") {
    return mockProducts;
  }

  const driveProducts = await getGoogleDriveProducts().catch((error: unknown) => {
    console.error("[products] Failed to load Google Drive products. Falling back to mock data.", safeErrorMessage(error));
    return [];
  });
  return driveProducts.length ? driveProducts : mockProducts;
}

export async function getProduct(slug: string): Promise<Product> {
  const productList = await getProducts();
  return productList.find((product) => product.slug === slug) ?? productList[0] ?? mockProducts[0];
}

async function getGoogleDriveProducts(): Promise<Product[]> {
  const folderId = process.env.GOOGLE_DRIVE_PRODUCTS_FOLDER_ID;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!folderId || !apiKey) {
    return [];
  }

  const files = await listDriveFiles(folderId, apiKey);
  const productJsonFile = newestFirst(files).find((file) => file.name === "products.json");

  if (productJsonFile) {
    const response = await fetch(driveDownloadUrl(productJsonFile.id, apiKey), driveFetchOptions);
    if (response.ok) {
      const text = await response.text();
      const payload = parseDriveJson(text, productJsonFile.name) as DriveProductFile[] | { products: DriveProductFile[] };
      const items = Array.isArray(payload) ? payload : payload.products;
      return items.map((item, index) => normalizeDriveProduct(item, index, files)).filter(Boolean) as Product[];
    }
  }

  const jsonFiles = newestFirst(files).filter((file) => file.mimeType === "application/json" || file.name.endsWith(".json"));
  const productFiles = await Promise.all(
    jsonFiles.map(async (file, index) => {
      const response = await fetch(driveDownloadUrl(file.id, apiKey), driveFetchOptions);
      if (!response.ok) return null;
      const item = parseDriveJson(await response.text(), file.name) as DriveProductFile;
      return normalizeDriveProduct(item, index, files);
    })
  );

  return productFiles.filter(Boolean) as Product[];
}

function parseDriveJson(text: string, fileName: string) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const preview = text.slice(0, 80).replace(/\s+/g, " ");
    throw new Error(
      `Google Drive file "${fileName}" is not valid JSON. First characters: ${preview}`,
      { cause: error }
    );
  }
}

async function listDriveFiles(folderId: string, apiKey: string): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    key: apiKey,
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,modifiedTime,thumbnailLink,webContentLink)",
    pageSize: "1000",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true"
  });

  const response = await fetch(`${driveApiBase}?${params.toString()}`, driveFetchOptions);

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { files?: DriveFile[] };
  return payload.files ?? [];
}

function newestFirst(files: DriveFile[]) {
  return [...files].sort((a, b) => (b.modifiedTime ?? "").localeCompare(a.modifiedTime ?? ""));
}

function normalizeDriveProduct(item: DriveProductFile, index: number, files: DriveFile[]): Product | null {
  if (!item.name || !item.price) return null;

  const id = item.id ?? slugify(item.name);
  const images = resolveImages(item, files);
  const image = item.image ?? images[0];

  if (!image) return null;

  return {
    id,
    slug: item.slug ?? id,
    name: item.name,
    price: Number(item.price),
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    category: normalizeCategories(item.category),
    minerals: normalizeTextList(item.minerals),
    benefits: normalizeTextList(item.benefits),
    image,
    images: images.length ? images : item.images,
    description: item.description ?? "",
    stockLabel: item.stockLabel ?? "現貨 2-5 個工作天寄出",
    sales: Number(item.sales ?? 0),
    createdAt: item.createdAt ?? new Date(Date.now() - index * 1000).toISOString()
  };
}

function resolveImages(item: DriveProductFile, files: DriveFile[]) {
  if (item.images?.length) return item.images;
  if (item.image) return [item.image];

  const imageIds = [
    item.imageFileId,
    ...files
      .filter((file) => item.imageFileNames?.includes(file.name) || file.name === item.imageFileName)
      .map((file) => file.id)
  ].filter(Boolean) as string[];

  return imageIds.map((id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1600`);
}

function normalizeCategories(value: DriveProductFile["category"]): Category[] {
  const raw = Array.isArray(value) ? value : value ? [value] : ["other"];
  const allowed = new Set<Category>([
    "monthly",
    "love",
    "wealth",
    "protect",
    "healing",
    "necklace",
    "charm",
    "perfume",
    "other"
  ]);

  const categories = raw.filter((item): item is Category => allowed.has(item as Category));
  return categories.length ? categories : ["other"];
}

function normalizeTextList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(/[、,]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "");
}

function driveDownloadUrl(fileId: string, apiKey: string) {
  return `${driveApiBase}/${fileId}?alt=media&key=${apiKey}`;
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/key=[^&\s]+/g, "key=[redacted]");
  }

  return "Unknown error";
}
