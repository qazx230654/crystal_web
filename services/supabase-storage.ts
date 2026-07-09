export { productImageBucket, SupabaseStorageConfigError } from "@/repositories/storage-repository";
import { storageRepository } from "@/repositories/storage-repository";

export async function uploadProductImage(file: File) {
  return storageRepository.uploadProductImage(file);
}
