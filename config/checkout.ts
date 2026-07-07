export const domesticShippingOptions = {
  blackCat: {
    fee: 130,
    label: "宅配到府",
    method: "black-cat",
    note: "黑貓宅急便"
  },
  sevenEleven: {
    fee: 60,
    label: "7-11 取貨",
    method: "711",
    note: "超商取貨，先付款再取貨"
  }
} as const;

export const paymentOptions = {
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

export const bankTransferConfig = {
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "Crystal",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "111004444556",
  bankCode: process.env.NEXT_PUBLIC_BANK_CODE ?? "824",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "連線銀行"
};
