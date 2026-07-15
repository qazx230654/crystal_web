export const shopShippingOptions = {
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
