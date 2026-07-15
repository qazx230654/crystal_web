export const shopBankTransfer = {
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "Crystal",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "111004444556",
  bankCode: process.env.NEXT_PUBLIC_BANK_CODE ?? "824",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "連線銀行"
} as const;

export const shopPaymentOptions = {
  bankTransfer: {
    label: "轉帳",
    method: "bank-transfer",
    note: "完成轉帳後上傳截圖，確認後出貨"
  },
  creditCard: {
    label: "信用卡 / Apple Pay",
    method: "credit-card",
    note: "VISA / Master / JCB，即時扣款"
  }
} as const;
