"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  /** "fade": the wrapper itself fades + rises. "group": wrapper stays neutral, its `.reveal-item` children fade individually. */
  variant?: "fade" | "group";
} & Record<string, any>;

export function Reveal({ as, children, className, delay = 0, variant = "fade", ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, isInView } = useInView<HTMLElement>();

  return (
    <Tag
      className={cn(variant === "fade" ? "reveal" : "reveal-group", className)}
      data-visible={isInView ? "true" : "false"}
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
