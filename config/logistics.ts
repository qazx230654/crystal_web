export const ecpayLogisticsConfig = {
  mapUrl: process.env.ECPAY_LOGISTICS_MAP_URL ?? "https://logistics-stage.ecpay.com.tw/Express/map",
  merchantId: process.env.ECPAY_MERCHANT_ID ?? "2000132",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL
};
