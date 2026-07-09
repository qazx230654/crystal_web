import type { PaymentMethod } from "@/src/domain/checkout/types";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  "bank-transfer": "轉帳",
  "credit-card": "信用卡 / Apple Pay"
};

export function buildPaymentNote(input: {
  formData: FormData;
  method: PaymentMethod;
  transferFileName?: string;
}) {
  if (input.method !== "bank-transfer") return "";

  const bankLastFive = String(input.formData.get("bankLastFive") ?? "").trim() || "未填";
  const transferFileName = input.transferFileName || "未上傳";

  return `轉帳末五碼：${bankLastFive}；轉帳截圖：${transferFileName}`;
}
