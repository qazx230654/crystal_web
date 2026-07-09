import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Crystal 能量水晶｜天然水晶手鍊・客製化水晶・招財桃花能量飾品",
  description:"Crystal 提供天然能量水晶、水晶手鍊與五行能量分析，依照個人需求客製化搭配招財、桃花、事業、健康等能量水晶，打造專屬於你的幸運飾品。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
