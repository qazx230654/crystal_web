"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="page-fade" key={pathname}>
      {children}
    </div>
  );
}
