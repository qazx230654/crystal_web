import { shopTheme } from "@/config/shop";

export function ShopThemeStyle() {
  const cssVariables = Object.entries(shopTheme.cssVariables)
    .map(([name, value]) => `${name}: ${value};`)
    .join("");

  return <style dangerouslySetInnerHTML={{ __html: `:root{${cssVariables}}` }} />;
}
