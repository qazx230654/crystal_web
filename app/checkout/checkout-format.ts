export const checkoutFieldClass = "border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose";

export function formatPrice(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}
