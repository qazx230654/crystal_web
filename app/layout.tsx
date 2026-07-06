import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "椛 能量水晶 | 天然水晶手鍊推薦・招財・桃花・療癒",
  description: "椛 Crystal mock front-end rebuilt with Next.js App Router, TypeScript and Tailwind CSS."
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
