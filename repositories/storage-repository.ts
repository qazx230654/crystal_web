const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const productImageBucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET ?? "product-images";

export class SupabaseStorageConfigError extends Error {}

export class StorageRepository {
  async uploadProductImage(file: File) {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new SupabaseStorageConfigError("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const extension = getFileExtension(file.name);
    const path = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${extension}`;
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${productImageBucket}/${path}`, {
      body: file,
      cache: "no-store",
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false"
      },
      method: "POST"
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase Storage ${response.status}: ${message}`);
    }

    return {
      path,
      url: `${supabaseUrl}/storage/v1/object/public/${productImageBucket}/${path}`
    };
  }
}

export const storageRepository = new StorageRepository();

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.trim().toLowerCase();
  return extension ? `.${extension}` : "";
}
