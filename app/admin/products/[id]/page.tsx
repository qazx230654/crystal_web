import { ProductEditor } from "@/app/admin/products/product-editor";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductEditor productId={params.id} />;
}
