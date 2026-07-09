"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-context";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-context";
import { CrystalAdvisor } from "@/components/crystal-advisor";
import { modules } from "@/config/modules";
import { PageFade } from "@/components/page-fade";
import { AnnouncementMarquee, Footer, Header } from "@/components/site-chrome-parts";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <AnnouncementMarquee />
        <main>
          <PageFade>{children}</PageFade>
        </main>
        {modules.chrome.footer ? <Footer /> : null}
        {modules.chrome.cart ? <CartDrawer /> : null}
        {modules.chrome.advisor ? <CrystalAdvisor /> : null}
      </CartProvider>
    </AuthProvider>
  );
}
