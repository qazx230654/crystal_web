import type { ProductOption } from "@/src/domain/product/types";

export const braceletSizeOptions = ["13 cm", "13.5 cm", "14 cm", "14.5 cm", "15 cm", "15.5 cm", "16 cm", "16.5 cm", "17 cm"];

export const defaultBraceletSize = braceletSizeOptions[4];

export const claspOptions: ProductOption[] = [
  { label: "彈力繩", value: "彈力繩" },
  { label: "龍蝦扣", value: "龍蝦扣", priceDelta: 200 }
];

export const fitOptions: ProductOption[] = [
  { label: "剛好", value: "剛好", note: "會有水晶壓痕但不掐肉" },
  { label: "微鬆", value: "微鬆", note: "可輕微滑動" }
];

export const metalToneOptions: ProductOption[] = [
  { label: "金飾", value: "金飾" },
  { label: "銀飾", value: "銀飾" },
  { label: "都可以", value: "都可以" }
];

export const yesNoOptions: ProductOption[] = [
  { label: "要", value: "要" },
  { label: "不要", value: "不要" }
];

export const pendantOptions: ProductOption[] = [
  { label: "要加吊飾", value: "要加吊飾" },
  { label: "不要吊飾", value: "不要吊飾" }
];

export const customStringOptions = [
  { label: "龍蝦扣", note: "+200元", image: "https://goodaytarot.com/images/d-design/d004.jpg" },
  { label: "磁扣", note: "+200元", image: "https://goodaytarot.com/images/d-design/d005.jpg" },
  { label: "彈力繩", note: "免費", image: "https://goodaytarot.com/images/d-design/d001.jpg" }
];

export const tarotTopicOptions = [
  "戀愛指南",
  "感情復合",
  "緣來暗戀",
  "旺桃花運",
  "財富密碼",
  "進化人生",
  "流年運勢",
  "守護神",
  "職涯探索",
  "心靈療癒"
];

export function getClaspPriceDelta(value: string) {
  return claspOptions.find((item) => item.value === value)?.priceDelta ?? 0;
}
