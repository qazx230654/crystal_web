const defaultEcpayLogisticsMapUrl = "https://logistics.ecpay.com.tw/Express/map";

export const ecpayLogisticsConfig = {
  mapUrl: process.env.ECPAY_LOGISTICS_MAP_URL ?? defaultEcpayLogisticsMapUrl,
  merchantId: process.env.ECPAY_MERCHANT_ID ?? "2000132",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL
};
