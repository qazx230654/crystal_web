import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-xs font-semibold tracking-[0.08em] whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-crystal-gold/60 bg-white/88 text-crystal-ink shadow-[0_12px_28px_rgba(185,151,91,0.12)] hover:bg-crystal-champagne/30 hover:text-crystal-ink hover:shadow-[0_16px_34px_rgba(185,151,91,0.16)]",
        outline:
          "border-crystal-gold/45 bg-white/70 text-crystal-muted shadow-[0_10px_24px_rgba(90,65,55,0.04)] hover:border-crystal-gold hover:bg-crystal-champagne/24 hover:text-crystal-ink",
        secondary:
          "bg-crystal-pearl text-crystal-ink hover:bg-crystal-blush/70",
        ghost:
          "text-crystal-muted hover:bg-crystal-pearl hover:text-crystal-ink",
        destructive:
          "bg-red-50 text-red-700 hover:bg-red-100 focus-visible:border-red-200 focus-visible:ring-red-200",
        link: "rounded-none border-0 px-0 text-crystal-ink underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-4",
        xs: "h-7 gap-1 px-3 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 px-6 text-xs",
        icon: "size-10",
        "icon-xs":
          "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
