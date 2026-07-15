import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { ShopThemeStyle } from "@/components/shop-theme-style";
import { shopBrand } from "@/config/shop";

export const metadata: Metadata = {
  title: shopBrand.metadata.title,
  description: shopBrand.metadata.description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <ShopThemeStyle />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
