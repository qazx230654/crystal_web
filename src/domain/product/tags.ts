export const defaultMineralOptions = [
  "白水晶",
  "粉晶",
  "白月光",
  "藍月光",
  "灰月光",
  "金髮晶",
  "黃虎眼石",
  "綠螢石",
  "白幽靈",
  "珍珠",
  "黑髮晶",
  "黑碧璽",
  "拉長石",
  "閃靈鑽"
];

export const defaultBenefitOptions = [
  "淨化",
  "愛情",
  "招財",
  "事業",
  "自信",
  "貴人",
  "專注",
  "平衡",
  "壓力",
  "穩定情緒",
  "人緣",
  "負能量",
  "正向能量",
  "能量維護"
];

export function sortProductTags(tags: Iterable<string>) {
  return Array.from(new Set(Array.from(tags).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-Hant"));
}
